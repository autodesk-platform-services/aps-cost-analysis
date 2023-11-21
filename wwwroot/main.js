import { initViewer, loadModel } from "./viewer.js";
import {
  initMaterialsTable,
  initCostBreakdownTable,
  initPieChart,
} from "./sidebar.js";

const params = new URLSearchParams(window.location.search);
const urn = params.get("urn");
const materialProperty = params.get("material-property") || "Material";
const unitProperty = params.get("unit-property") || "Mass";
const response = await fetch("/cost");
if (!response.ok) {
  alert("Couldnt read the data");
  throw new Error("Cannot read data");
}
const data = await response.json();
initViewer(document.getElementById("preview")).then(async (viewer) => {
  loadModel(viewer, urn);
  viewer.addEventListener(
    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
    async function () {
      initMaterialsTable(
        data,
        function (obj) {
          viewer.search(obj.material, function (dbIds) {
            viewer.fitToView(dbIds);
            viewer.isolate(dbIds);
          });
        },
        function (obj) {
          initCostBreakdownTable(
            viewer,
            data,
            materialProperty,
            unitProperty,
            function (obj) {
              viewer.search(obj.material, function (dbIds) {
                viewer.fitToView(dbIds);
                viewer.isolate(dbIds);
              });
            }
          );
        }
      );
      initCostBreakdownTable(
        viewer,
        data,
        materialProperty,
        unitProperty,
        function (obj) {
          viewer.search(obj.material, function (dbIds) {
            viewer.fitToView(dbIds);
            viewer.isolate(dbIds);
          });
        }
      );
      initPieChart(viewer, data);
    }
  );
});
