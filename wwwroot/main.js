import {
  initViewer,
  loadModel,
  search,
  getProperties,
  getAllDbIds,
  CustomPropertyPanel,
} from "./viewer.js";
import { initSidebar, updateSidebar } from "./sidebar.js";

const params = new URLSearchParams(window.location.search);
const urn = params.get("urn");
const materialProperty = params.get("material-property") || "Material";

const viewer = await initViewer(document.getElementById("preview"));
const panel = new CustomPropertyPanel(viewer, { materialProperty });
loadModel(viewer, urn);

viewer.addEventListener(Autodesk.Viewing.EXTENSION_LOADED_EVENT, function (e) {
  if (e.extensionId === "Autodesk.PropertiesManager") {
    viewer.getExtension("Autodesk.PropertiesManager").setPanel(panel);
  }
});

viewer.addEventListener(
  Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
  async function () {
    const currencies = await fetch("/currencies").then((resp) => resp.json());

    async function update() {
      const allMaterials = await fetch("/materials").then((resp) =>
        resp.json()
      );
      let allMaterialNames = allMaterials.map((m) => m.material);
      const dbids = getAllDbIds(viewer);
      const allProperties = await getProperties(
        viewer,
        dbids,
        materialProperty
      );
      let modelMaterialNames = allProperties.map(
        (p) => p.properties[0].displayValue
      );
      const sharedMaterials = allMaterialNames.filter((element) =>
        modelMaterialNames.includes(element)
      );
      const materials = allMaterials.filter((material) =>
        sharedMaterials.includes(material.material)
      );

      const breakdown = await calculateCostBreakdown(
        viewer,
        materials,
        materialProperty,
        currencies
      );
      updateSidebar(materials, breakdown);
      panel.setMaterials(materials);
    }

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
    const current_currency = currencies.find(
      (currency) => currency.currency == material.currency
    );
    row.cost += units * material.price * current_currency.factor;
    totalCost += units * material.price * current_currency.factor;
    summary.push(row);
  }
  for (const row of summary) {
    row.percent = (row.cost / totalCost) * 100;
  }
  return summary;
}
