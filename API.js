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
  maxPoolSize: 100,
});

async function connectToDatabase(req, res, next) {
  try {
    await client.connect();
    req.db = client.db("database1");
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}

async function fetchData(collectionName, fileId, db) {
  const collection = db.collection(collectionName);
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
    const collection = req.db.collection(collectionName);
    const cursor = collection.find();
    const data = await cursor.toArray();
    const files = await Promise.all(
      data.map(async (d) => {
        return `
          <li><a href="/${collectionName}/${d.file_id}">${d.file_id}</a></li>
        `;
      })
    );
    res.send(`
      <h1>${collectionName}</h1>
      <ul>
        ${files.join("")}
      </ul>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/:collectionName/:fileId", connectToDatabase, async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const fileId = req.params.fileId;
    req.db;
    const data = await fetchData(
      collectionName,
      fileId,
      client.db("database1")
    );
    res.send(data.join("\n")); // send "data" as plain text
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
