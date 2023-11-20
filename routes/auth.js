const express = require("express");
const APS = require("forge-apis");
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require("../config.js");

let publicAuthClient = new APS.AuthClientTwoLegged(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  ["viewables:read"],
  true
);

async function getPublicToken() {
  if (!publicAuthClient.isAuthorized()) {
    await publicAuthClient.authenticate();
  }
  return publicAuthClient.getCredentials();
}

let router = express.Router();

router.get("/api/auth/token", async function (req, res, next) {
  try {
    res.json(await getPublicToken());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
