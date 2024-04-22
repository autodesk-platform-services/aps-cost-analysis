async function getAccessToken(callback) {
  try {
    const resp = await fetch("/auth/token");
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer(
      { env: "AutodeskProduction", getAccessToken },
      function () {
        const viewer = new Autodesk.Viewing.GuiViewer3D(container);
        viewer.start();
        viewer.setTheme("light-theme");
        resolve(viewer);
      }
    );
  });
}

export function loadModel(viewer, urn) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      function onDocumentLoadSuccess(doc) {
        resolve(
          viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry())
        );
      },
      function onDocumentLoadFailure(code, message, errors) {
        reject({ code, message, errors });
      }
    );
  });
}

export function search(viewer, propertyName, propertyValue) {
  return new Promise(function (resolve, reject) {
    viewer.search(propertyValue, resolve, reject, [propertyName], {
      includeInherited: true,
    });
  });
}

export function getProperties(viewer, dbids, propertyName) {
  return new Promise(function (resolve, reject) {
    viewer.model.getBulkProperties(
      dbids,
      { propFilter: [propertyName] },
      resolve,
      reject
    );
  });
}

export function getAllDbIds(viewer) {
  const instanceTree = viewer.model.getData().instanceTree;
  const allDbIdsStr = Object.keys(instanceTree.nodeAccess.dbIdToIndex);
  return allDbIdsStr.map((id) => parseInt(id));
}

export class CustomPropertyPanel extends Autodesk.Viewing.Extensions
  .ViewerPropertyPanel {
  constructor(viewer, options) {
    super(viewer, options);
    this.materialProperty = options.materialProperty;
    this.materials = options.materials || [];
    this.dbid = -1;
  }

  requestAggregatedNodeProperties(selectionSet) {
    super.requestAggregatedNodeProperties(selectionSet);
    if (
      Array.isArray(selectionSet) &&
      selectionSet.length === 1 &&
      selectionSet[0].selection.length === 1
    ) {
      this.dbid = selectionSet[0].selection[0];
    } else {
      this.dbid = -1;
    }
  }

  setAggregatedProperties(properties, options) {
    super.setAggregatedProperties(properties, options);
    if (this.dbid > 1) {
      this.viewer.getProperties(this.dbid, (result) => {
        const property = result.properties.find(
          (prop) => prop.displayName === this.materialProperty
        );
        if (property) {
          const material = this.materials.find(
            (mat) => mat.material === property.displayValue
          );
          if (material) {
            this.addProperty("Supplier", material.supplier, "Cost Analysis");
            this.addProperty(
              "Price",
              `${material.price} ${material.currency}`,
              "Cost Analysis"
            );
          }
        }
      });
    }
  }

  setMaterials(materials) {
    this.materials = materials;
    this.isDirty = true;
    this.requestProperties();
  }
}
