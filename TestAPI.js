// Local host test file for API

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const uri =
  "mongodb+srv://polar_project_database:polar_project_database@cluster0.mec6yfh.mongodb.net/?retryWrites=true&w=majority";
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
  if (!collection) {
    throw new Error("Failed to connect to database");
  }
  const cursor = collection.find({ file_id: fileId });
  const data = await cursor.toArray();
  return data.map((d) => d.data);
}

app.get("/", async (req, res) => {
  try {
    res.send(
      `<ul>
        <li><a href="/Hurdles">Hurdles</a></li>
        <li><a href="/Sprint">Sprint</a></li>
        <li><a href="/Pole_vault">Pole Vault</a></li>
      </ul>
    `
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/:collectionName", connectToDatabase, async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const collection = req.dbClient.db("database1").collection(collectionName);
    const cursor = collection.find();
    const data = await cursor.toArray();
    const files = data
      .map(
        (d) => `
      <li><a href="/${collectionName}/${d.file_id}">${d.file_id}</a></li>
      <pre>${JSON.stringify(d.data, null, 2)}</pre>
    `
      )
      .join("");
    res.send(`
      <h1>${collectionName}</h1>
      <ul>
        ${files}
      </ul>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

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
