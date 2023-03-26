const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const csvFiles = ["Polar1.csv", "Polar2.csv"];

const data = {};

for (const csvFile of csvFiles) {
  if (!fs.existsSync(csvFile)) {
    console.error(`File not found: ${csvFile}`);
    continue;
  }

  const csvData = fs.readFileSync(csvFile, "utf-8");
  data[csvFile] = csvData;
}

app.get("/:csvNumber", (req, res) => {
  const csvNumber = req.params.csvNumber;
  if (csvNumber < 1 || csvNumber > csvFiles.length) {
    res.status(404).send(`CSV number ${csvNumber} not found`);
    return;
  }
  const csvFile = csvFiles[csvNumber - 1];
  res.type("text/plain").send(data[csvFile]);
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});