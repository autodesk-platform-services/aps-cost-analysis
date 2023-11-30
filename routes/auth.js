const express = require("express");
const APS = require("forge-apis");
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require("../config.js");

const publicAuthClient = new APS.AuthClientTwoLeggedV2(
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  ["viewables:read"],
  true
);
const router = express.Router();

router.get("/auth/token", async function (req, res, next) {
  try {
    if (!publicAuthClient.isAuthorized()) {
      await publicAuthClient.authenticate();
    }
    res.json(publicAuthClient.getCredentials());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
