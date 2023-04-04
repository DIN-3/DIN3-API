const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let collection;

async function connect(collectionName) {
  await client.connect();
  collection = client.db("database1").collection(collectionName);
}

async function fetchData(collectionName, fileId) {
  if (!collection) {
    await connect(collectionName);
  }
  const cursor = collection.find({ file_id: fileId });
  const data = await cursor.toArray();
  return data.map((d) => d.data);
}

app.get("/:collectionName/:fileId", async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const fileId = req.params.fileId;
    const data = await fetchData(collectionName, fileId);
    res.send(data.join("\n")); // send "data" as plain text
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
