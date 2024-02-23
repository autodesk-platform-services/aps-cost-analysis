const { MongoClient, ObjectId } = require("mongodb");
const { MONGODB_URL } = require("./config.js");
const client = new MongoClient(MONGODB_URL);
const databaseName = "rcdb";
const collectionName = "cost";

async function getMaterialCost() {
  const collection = client.db(databaseName).collection(collectionName);
  const results = await collection.find({}).toArray();
  return results;
}

async function updateMaterialCost(id, price, currency) {
  const collection = client.db(databaseName).collection(collectionName);
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { price: Number(price), currency: currency } }
  );
  return result;
}

module.exports = { client, getMaterialCost, updateMaterialCost };