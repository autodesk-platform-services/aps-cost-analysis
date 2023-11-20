const express = require("express");
const { PORT } = require("./config.js");
const { getCost, updateCost } = require("./db.js");

let app = express();
app.use(express.json());
app.use(express.static("wwwroot"));
app.use(require("./routes/auth.js"));
app.get("/cost", async function (req, res, next) {
  try {
    res.json(await getCost());
  } catch (err) {
    next(err);
  }
});

app.post("/update/:row_id", async function (req, res, next) {
  const rowId = req.params.row_id;
  const updatedPrice = req.body.price;
  if (!updatedPrice) {
    res.status(400).end("Incorrect input");
    return;
  }
  try {
    res.status(200).json(await updateCost(rowId, updatedPrice));
  } catch (err) {
    next(err);
  }
});
app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}...`);
});
