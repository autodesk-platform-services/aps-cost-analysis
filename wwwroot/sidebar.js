import { getViewer } from "./viewer.js";
let global_cost_table;
let costChart;

//define data array
export async function initMaterialsTable(data, onRowSelected) {
  //initialize table
  const table = new Tabulator("#materials-table", {
    layout: "fitColumns",
    height: "100%",
    data: data, //assign data to table
    // autoColumns: true, //create columns from data field names
    columns: [
      {
        title: "Material",
        field: "material",
        sorter: "string",
      },
      {
        title: "Supplier",
        field: "supplier",
      },
      {
        title: "Price",
        field: "price",
        sorter: "number",
        editor: "number",
        cellClick: function (e, cell) {
          console.log("cell click");
        },
      },
      {
        title: "Currency",
        field: "currency",
      },
    ],
  });
  table.on("cellEdited", async (cell) => {
    const rowdata = cell.getData();
    const row_id = rowdata._id;
    alert(row_id);
    const row_price = rowdata.price;
    costUpdate(row_id, row_price);
    const response = await fetch("/cost");
    if (!response.ok) {
      alert("Couldnt read the data");
      throw new Error("Cannot read data");
    }
    const data = await response.json();

    const breakdown = await calculateCostBreakdown(getViewer(), data);
    //$("#table-cost").tabulator("replaceData", breakdown);
    global_cost_table.replaceData(breakdown);

    await initPieChart(getViewer(), data);

    alert(row_price);
  });
  table.on("rowClick", function (e, row) {
    onRowSelected(row.getData());
  });

  return table;
}
export async function initCostBreakdownTable(viewer, data, onRowSelected) {
  const breakdown = await calculateCostBreakdown(viewer, data);
  //initialize table
  const table = new Tabulator("#breakdown-table", {
    height: "100%",
    layout: "fitColumns",
    data: breakdown, //assign data to table
    // autoColumns: true, //create columns from data field names
    columns: [
      {
        title: "Material",
        field: "material",
        sorter: "string",
      },
      {
        title: "Percent",
        field: "percent",
      },
      {
        title: "Cost",
        field: "cost",
        sorter: "number",
      },
    ],
  });

  //initialize table

  table.on("rowClick", function (e, row) {
    onRowSelected(row.getData());
  });

  global_cost_table = table;
  return table;
}
async function costUpdate(row_id, row_price) {
  try {
    const response = await fetch("/update/" + row_id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: row_price }),
    });

    const data = await response.json(); // Parse response data as JSON

    console.log("Server response:", data);
    console.log("Server is up");
  } catch (error) {
    console.error("Error:", error);
    console.log("Server is down!!");
  }
}

function search(viewer, propertyName, propertyValue) {
  return new Promise(function (resolve, reject) {
    viewer.search(propertyValue, resolve, reject, [propertyName]);
  });
}

function getProperties(viewer, dbids, propertyName) {
  return new Promise(function (resolve, reject) {
    viewer.model.getBulkProperties(
      dbids,
      { propFilter: [propertyName] },
      resolve,
      reject
    );
  });
}
async function calculateCostBreakdown(viewer, materials) {
  const summary = [];
  let totalCost = 0;
  // Go through all materials stored in our MongoDB database
  for (const material of materials) {
    const row = { material: material.material, cost: 0, percent: 0 };
    // Find all objects that have "Material" property set to the current material name
    const dbids = await search(viewer, "Material", material.material);
    // Get the "Mass" property for all matching dbids
    const results = await getProperties(viewer, dbids, "Mass");
    // Compute the total mass and price
    for (const result of results) {
      const mass = result.properties[0].displayValue;
      row.cost += mass * material.price;
      totalCost += mass * material.price;
    }
    summary.push(row);
  }

  for (const row of summary) {
    row.percent = (row.cost / totalCost) * 100;
  }

  return summary;
}

export async function initPieChart(viewer, data) {
  if (costChart) {
    costChart.destroy();
  }

  const breakdown = await calculateCostBreakdown(viewer, data);
  console.log(breakdown);

  var xValues = [];
  var yValues = [];
  let barColors = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#e8c3b9",
    "#1e7145",
    "#d496a7",
    "#820263",
    "#a7c957",
  ];

  const canvas = document.getElementById("breakdown-chart-canvas");
  if (costChart) {
    costChart.destroy();
  }

  costChart = new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: breakdown.map((e) => e.material),
      datasets: [
        {
          backgroundColor: barColors,
          data: breakdown.map((e) => e.percent),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: "Cost Breakdown",
      },
    },
  });
  costChart.config.options.onClick = (ev, items) => {
    if (items.length === 1) {
      const index = items[0].index;
      const material = breakdown[index].material;
      viewer.search(material, function (dbIds) {
        viewer.fitToView(dbIds);
        viewer.isolate(dbIds);
      });
      console.log(ev, items);
    }
  };
}
