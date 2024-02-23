import {
  initViewer,
  loadModel,
  search,
  getProperties,
  getAllDbIds,
} from "./viewer.js";
import { initSidebar, updateSidebar } from "./sidebar.js";

const params = new URLSearchParams(window.location.search);
const urn = params.get("urn");
const materialProperty = params.get("material-property") || "Material";
const viewer = await initViewer(document.getElementById("preview"));
loadModel(viewer, urn);
viewer.addEventListener(
  Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
  async function () {
    function onMaterialSelected(material) {
      viewer.search(
        material,
        function (dbids) {
          viewer.fitToView(dbids);
          viewer.isolate(dbids);
        },
        function () {},
        [],
        { includeInherited: true }
      );
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
      const all_materials = await response_material.json();
      let p_array1 = [];
      for (const material of all_materials) {
        p_array1.push(material.material);
      }
      const dbids = getAllDbIds(viewer);
      const allProperties = await getProperties(
        viewer,
        dbids,
        materialProperty
      );
      let p_array2 = [];
      for (const eachProperties of allProperties) {
        p_array2.push(eachProperties.properties[0].displayValue);
      }
      const intersection = p_array1.filter((element) =>
        p_array2.includes(element)
      );
      const materials = all_materials.filter((material) =>
        intersection.includes(material.material)
      );
      const breakdown = await calculateCostBreakdown(
        viewer,
        materials,
        materialProperty,
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
  currencies
) {
  const summary = [];
  let totalCost = 0;
  for (const material of materials) {
    const row = { material: material.material, cost: 0, percent: 0 };
    const dbids = await search(viewer, materialProperty, material.material);
    const count = dbids.length;
    const units = count;
    const current_currency = currencies.find(function (currency) {
      return currency.currency == material.currency;
    });
    row.cost += units * material.price * current_currency.factor;
    totalCost += units * material.price * current_currency.factor;
    summary.push(row);
  }
  for (const row of summary) {
    row.percent = (row.cost / totalCost) * 100;
  }
  return summary;
}
