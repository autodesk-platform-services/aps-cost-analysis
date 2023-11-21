const { MongoClient, ObjectId } = require("mongodb");
const { MONGODB_URL } = require("./config.js");

// Connection URL
const client = new MongoClient(MONGODB_URL);

// Database Name
const dbName = "rcdb";
const collectionName = "cost";

// Connect to the MongoDB server
async function connect() {
  await client.connect();
}

// Close the MongoDB connection
async function close() {
  await client.close();
}

async function getCost() {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const findResult = await collection.find({}).toArray();
  console.log("Found documents =>", findResult);
  return findResult;
}

async function updateCost(rowId, updatedPrice) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(rowId) },
      { $set: { price: Number(updatedPrice) } }
    );

    console.log("Found documents =>", updateResult);
    return updateResult;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { connect, close, getCost, updateCost };
