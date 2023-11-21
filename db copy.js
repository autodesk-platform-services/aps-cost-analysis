const { MongoClient, ObjectId } = require("mongodb");
const { MONGODB_URL } = require("./config.js");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL

// Database Name
const dbName = "rcdb";
const collection_name = "cost";
//dbName.grantRolesToUser("test_user", [{ role: "readWrite", db: "rcdb" }])
async function getCost() {
  const client = new MongoClient(MONGODB_URL);
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collection_name);

  // the following code examples can be pasted here...
  const findResult = await collection.find({}).toArray();
  console.log("Found documents =>", findResult);
  client.close();
  return findResult;
}

async function updateCost(rowId, updatedPrice) {
  const client = new MongoClient(MONGODB_URL);
  // Use connect method to connect to the server

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collection_name);

  // the following code examples can be pasted here...
  try {
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(rowId) },
      { $set: { price: Number(updatedPrice) } }
    );

    console.log("Found documents =>", updateResult);
    return updateResult;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

module.exports = { getCost, updateCost };
