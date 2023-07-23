const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
require("dotenv").config();

// Default paths
const upload = multer({ dest: "tmp/" });
const X3_PATH = process.env.X3_PATH;
const ROOT_PATH = __dirname;
const X3_URL = process.env.X3_URL;

const port = process.env.PORT;

const Adonix = require("./src/Adonix.js");
const adx = new Adonix(X3_PATH, ROOT_PATH);

app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Returns JSON to check if the server is up
 */
app.get("/", (req, res) => {
  res.json({
    message: "working",
  });
});

/*
 * Returns file names in TRT folder
 */
app.get("/:folder/files", (req, res) => {
  const X3Folder = req.params.folder.toUpperCase();

  adx.files(X3Folder).then((result) => {
    res.json({
      result,
      message: "Request was successful",
      total: result.length,
    });
  });
});

/*
 * Returns the file that was requested from the TRT folder
 */
app.get("/:folder/download", (req, res) => {
  const fileName = req.query.fileName.replace(".src", "");
  const X3Folder = req.params.folder.toUpperCase();

  adx.fetch(X3Folder, fileName).then((data) => {
    res.sendFile(`${ROOT_PATH}/tmp/${data.fileName}.src`);
  });
});

/*
 * Uploads/compiles the file that was received and compiles
 */
app.post("/:folder/upload", upload.single("file"), (req, res) => {
  const fileName = req.file.originalname.replace(".src", "");
  const X3Folder = req.params.folder.toUpperCase();

  adx.sync(X3Folder, req.file.path, fileName).then((result) => {
    adx.compile(X3Folder, fileName).then((result) => {
      res.json({
        message: "uploaded and compiled",
        result: result,
        host: X3_URL,
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Compiler is listening on port: http://localhost:${port}`);
});
