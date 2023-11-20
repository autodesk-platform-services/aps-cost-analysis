let { APS_CLIENT_ID, APS_CLIENT_SECRET, PORT, MONGODB_URL } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !MONGODB_URL) {
  console.warn("Missing some of the environment variables.");
  process.exit(1);
}

PORT = PORT || 8080;

module.exports = {
  APS_CLIENT_ID,
  APS_CLIENT_SECRET,
  PORT,
  MONGODB_URL,
};
