const express = require("express");
const { SdkManagerBuilder } = require("@aps_sdk/autodesk-sdkmanager");
const { AuthenticationClient, Scopes } = require("@aps_sdk/authentication");
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require("../config.js");
const sdk = SdkManagerBuilder.create().build();
const authenticationClient = new AuthenticationClient(sdk);

const router = express.Router();

router.get("/auth/token", async function (req, res, next) {
  try {
    const credentials = await authenticationClient.getTwoLeggedToken(
      APS_CLIENT_ID,
      APS_CLIENT_SECRET,
      [Scopes.DataRead]
    );
    res.json(credentials);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
