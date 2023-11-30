const express = require("express");
const { client, getMaterialCost, updateMaterialCost } = require("./db.js");
const { PORT } = require("./config.js");
const app = express();

app.use(express.json());
app.use(express.static("wwwroot"));
app.use(require("./routes/auth.js"));

app.get("/material-cost", async function (req, res, next) {
  try {
    res.json(await getMaterialCost());
  } catch (err) {
    next(err);
  }
});

app.post("/material-cost/:id", async function (req, res, next) {
  const id = req.params.id;
  const price = req.body.price;
  if (!price) {
    res.status(400).end("Incorrect input");
    return;
  }
  try {
    res.json(await updateMaterialCost(id, price));
  } catch (err) {
    next(err);
  }
});

client.connect().then((_) => {
  app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}...`);
  });
});
process.on("exit", () => client.close());
