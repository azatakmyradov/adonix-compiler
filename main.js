const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();

const upload = multer({ dest: 'tmp/' });
const port = process.env.PORT;
const X3_PATH = process.env.X3_PATH;
const FOLDERS_PATH = `${X3_PATH}\\folders`;
const ROOT_PATH = __dirname;
const X3_URL = process.env.X3_URL;

const Adonix = require('./src/Adonix.js');
const adx = new Adonix(X3_PATH, FOLDERS_PATH, ROOT_PATH);

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({
        message: 'working'
    });
});

app.get('/:folder/files', (req, res) => {
    adx.files(req.params.folder.toUpperCase()).then(result => {
        res.json({
            result,
            message: 'Request was successful',
            total: result.length
        });
    });
});

app.get('/:folder/download', (req, res) => {
    const fileName = req.query.fileName.replace('.src', '');

    adx.fetch(req.params.folder.toUpperCase(), fileName).then(data => {
        res.sendFile(`${ROOT_PATH}/tmp/${data.fileName}.src`);
    });
});

app.post('/:folder/upload', upload.single('file'), (req, res) => {
    const fileName = req.file.originalname.replace('.src', '');
    const folder = req.params.folder.toUpperCase();

    adx.sync(folder, req.file.path, fileName).then(result => {
        adx.compile(folder, fileName).then(result => {
            res.json({
                message: 'uploaded and compiled',
                result: result,
                host: X3_URL
            });
        });
    });
});

app.listen(port, () => {
  console.log(`Compiler is listening on port: ${port}`)
});