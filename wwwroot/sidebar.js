let materialsTable;
let breakdownTable;
let breakdownChart;

export function initSidebar(onMaterialSelected, onMaterialModified, currencies) {
    materialsTable = initMaterialsTable(currencies);
    materialsTable.on("rowClick", (e, row) => {
        onMaterialSelected(row.getData().material);
    });
    materialsTable.on("cellEdited", (cell) => {
        const material = cell.getData();
        onMaterialModified(material._id, material.price, material.currency);
    });

    breakdownTable = initCostBreakdownTable();
    breakdownTable.on("rowClick", (e, row) => {
        onMaterialSelected(row.getData().material);
    });

    breakdownChart = initCostBreakdownChart();
    breakdownChart.config.options.onClick = (ev, items) => {
        if (items.length === 1) {
            const index = items[0].index;
            onMaterialSelected(breakdownChart.data.labels[index]);
        }
    };
}

export function updateSidebar(materials, breakdown) {
    materialsTable.replaceData(materials);
    breakdownTable.replaceData(breakdown);
    breakdownChart.data.labels = breakdown.map((e) => e.material);
    breakdownChart.data.datasets[0].data = breakdown.map((e) => e.percent);
    breakdownChart.update();
}

function initMaterialsTable(currencies) {
    return new Tabulator("#materials-table", {
        layout: "fitColumns",
        height: "100%",
        data: [],
        columns: [
            { title: "Material", field: "material", sorter: "string" },
            { title: "Supplier", field: "supplier" },
            { title: "Price", field: "price", sorter: "number", editor: "number" },
            {
                title: "Currency",
                field: "currency",
                editor: "list",
                sorter: "string",
                editorParams: {
                    autocomplete: "true",
                    defaultValue: "USD",
                    values: currencies.map(e => e.currency)
                }
            }
        ]
    });
}

function initCostBreakdownTable() {
    return new Tabulator("#breakdown-table", {
        height: "100%",
        layout: "fitColumns",
        data: [],
        columns: [
            { title: "Material", field: "material", sorter: "string" },
            { title: "Percent", field: "percent", formatter: "progress" },
            {
                title: "Cost",
                field: "cost",
                sorter: "number",
                formatter: "money",
                formatterParams: {
                    decimal: ",",
                    thousand: ".",
                    symbol: "$",
                    negativeSign: true,
                    precision: 2
                }
            }
        ]
    });
}

function initCostBreakdownChart() {
    const canvas = document.getElementById("breakdown-chart-canvas");
    return new Chart(canvas.getContext("2d"), {
        type: "pie",
        data: {
            labels: [],
            datasets: [
                {
                    backgroundColor: [
                        "#b91d47",
                        "#00aba9",
                        "#2b5797",
                        "#e8c3b9",
                        "#1e7145",
                        "#d496a7",
                        "#820263",
                        "#a7c957"
                    ],
                    data: []
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: "Cost Breakdown"
            }
        }
    });
}
