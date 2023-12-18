import { initViewer, loadModel, search, getProperties } from "./viewer.js";
import { initSidebar, updateSidebar } from "./sidebar.js";

const params = new URLSearchParams(window.location.search);
const urn = params.get("urn");
const materialProperty = params.get("material-property") || "Material";
const unitProperty = params.get("unit-property") || "Mass";

const viewer = await initViewer(document.getElementById("preview"));
loadModel(viewer, urn);
viewer.addEventListener(
  Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
  async function () {
    function onMaterialSelected(material) {
      viewer.search(material, function (dbids) {
        viewer.fitToView(dbids);
        viewer.isolate(dbids);
      });
    }
    async function onMaterialModified(id, price, currency) {
      const response = await fetch("/materials/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, currency }),
      });
      if (response.status == 400) {
        const message = await response.text();
        alert(message);
      }
      update();
    }

    const response_currency = await fetch("/currencies");
    const currencies = await response_currency.json();

    async function update() {
      const response_material = await fetch("/materials");
      const materials = await response_material.json();

      const breakdown = await calculateCostBreakdown(
        viewer,
        materials,
        materialProperty,
        unitProperty,
        currencies
      );
      updateSidebar(materials, breakdown);
    }
    initSidebar(onMaterialSelected, onMaterialModified, currencies);
    update();
  }
);

async function calculateCostBreakdown(
  viewer,
  materials,
  materialProperty,
  unitProperty,
  currencies
) {
  const summary = [];
  let totalCost = 0;
  for (const material of materials) {
    const row = { material: material.material, cost: 0, percent: 0 };
    const dbids = await search(viewer, materialProperty, material.material);
    const results = await getProperties(viewer, dbids, unitProperty);

    for (const result of results) {
      const units = result.properties[0].displayValue;
      const current_currency = currencies.find(function (currency) {
        return currency.currency == material.currency;
      });

      row.cost += units * material.price * current_currency.factor;
      totalCost += units * material.price * current_currency.factor;
    }

    summary.push(row);
  }
  for (const row of summary) {
    row.percent = (row.cost / totalCost) * 100;
  }
  return summary;
}
