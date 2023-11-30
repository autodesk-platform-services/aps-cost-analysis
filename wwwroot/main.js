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
    async function onPriceModified(id, price) {
      await fetch("/material-cost/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      update();
    }
    async function update() {
      const response = await fetch("/material-cost");
      const materials = await response.json();
      const breakdown = await calculateCostBreakdown(
        viewer,
        materials,
        materialProperty,
        unitProperty
      );
      updateSidebar(materials, breakdown);
    }
    initSidebar(onMaterialSelected, onPriceModified);
    update();
  }
);

async function calculateCostBreakdown(
  viewer,
  materials,
  materialProperty,
  unitProperty
) {
  const summary = [];
  let totalCost = 0;
  for (const material of materials) {
    const row = { material: material.material, cost: 0, percent: 0 };
    const dbids = await search(viewer, materialProperty, material.material);
    const results = await getProperties(viewer, dbids, unitProperty);
    for (const result of results) {
      const units = result.properties[0].displayValue;
      row.cost += units * material.price;
      totalCost += units * material.price;
    }
    summary.push(row);
  }
  for (const row of summary) {
    row.percent = (row.cost / totalCost) * 100;
  }
  return summary;
}
