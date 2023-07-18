const { log } = require('console');
const express = require('express');
const app = express();
const port = 3000;
const exec = require('child_process').exec;
const multer = require('multer');
const bodyParser = require('body-parser');

const upload = multer({ dest: 'tmp/' });

const X3_PATH = 'C:\\Sage\\SAGEX3';
const TRT_PATH = `${X3_PATH}\\folders\\SEED\\TRT`;
const FOLDERS_PATH = `${X3_PATH}\\folders`;
const ROOT_PATH = __dirname;

app.use(bodyParser.urlencoded({ extended: false }));

function execute(command, callback) {
    return new Promise((resolve, reject) => {
        exec(command,  { maxBuffer: 1024 * 5000 }, function (error, stdout, stderr) {
            const result = callback(stdout);

            console.log(error, stderr);

            resolve(result);
        });
    });
}

function getAllFileNames(folder) {
    return execute(`cd ${FOLDERS_PATH}\\${folder}\\TRT && dir`, function (result) {
        const files = result.split(' ')
                            .filter(file => file.match(/\b(?!W)[A-Z][A-Za-z0-9_]*\.src\b/))
                            .map(file => file.split("src")[0] + 'src');

        return files;
    }).then(result => result);
}

function compile(folder, fileName) {
    return execute(`cd ${X3_PATH}\\runtime && bin\\env.bat && bin\\valtrt ${folder} ${fileName}`, function (result) {
        return result;
    });
}

function getFile(folder, fileName) {
    return execute(`xcopy ${FOLDERS_PATH}\\${folder}\\TRT\\${fileName}.src ${ROOT_PATH}\\tmp\\ /Y`, function (result) {
        return {
            result: result,
            fileName: fileName
        };
    });
}

function updateFile(target, destination) {
    return execute(`move C:\\compile\\${target} ${TRT_PATH}\\${destination}.src`, function (result) {
        return {
            result: result,
        };
    });
}

app.get('/', (req, res) => {
    res.json({
        message: 'working'
    });
});

app.get('/:folder/files', (req, res) => {
    getAllFileNames(req.params.folder.toUpperCase()).then(result => {
        res.json({
            result,
            message: 'Request was successful',
            total: result.length
        });
    });
});

app.get('/:folder/download', (req, res) => {
    const fileName = req.query.fileName.replace('.src', '');

    getFile(req.params.folder.toUpperCase(), fileName).then(data => {
        res.sendFile(`${ROOT_PATH}/tmp/${data.fileName}.src`);
    });
});

app.post('/:folder/upload', upload.single('file'), (req, res) => {
    const fileName = req.file.originalname.replace('.src', '');

    updateFile(req.file.path, fileName).then(result => {
        compile(req.params.folder, fileName).then(result => {
            res.json({
                message: 'uploaded and compiled',
                result: result
            });
        });
    });
});

app.listen(port, () => {
  console.log(`Compiler is listening on port: ${port}`)
});