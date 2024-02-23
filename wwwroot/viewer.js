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
    function onDocumentLoadSuccess(doc) {
      resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
    }
    function onDocumentLoadFailure(code, message, errors) {
      reject({ code, message, errors });
    }
    Autodesk.Viewing.Document.load(
      "urn:" + urn,
      onDocumentLoadSuccess,
      onDocumentLoadFailure
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
  var instanceTree = viewer.model.getData().instanceTree;

  var allDbIdsStr = Object.keys(instanceTree.nodeAccess.dbIdToIndex);

  return allDbIdsStr.map(function (id) {
    return parseInt(id);
  });
}
