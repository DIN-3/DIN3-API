const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const uri =
  "mongodb+srv://polar_project_database:polar_project_database@cluster0.mec6yfh.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fetchData(collectionName, fileId) {
  try {
    await client.connect();
    const collection = client.db("database1").collection(collectionName);
    const cursor = collection.find({ file_id: fileId });
    const data = await cursor.toArray();
    return data.map((d) => d.data); // only return the "data" field
  } finally {
    await client.close();
  }
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

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
