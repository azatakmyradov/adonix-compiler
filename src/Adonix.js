const Command = require('./Command.js');

class Adonix {
    constructor(x3_path, folders_path, root_path) {
        this.x3_path = x3_path;
        this.folders_path = folders_path;
        this.root_path = root_path;
    }

    files(folder) {
        const command = `cd ${this.folders_path}\\${folder}\\TRT && dir`;
    
        return Command.execute(command, function (result) {
            const files = result.split(' ')
                                .filter(file => file.match(/\b(?!W)[A-Z][A-Za-z0-9_]*\.src\b/))
                                .map(file => file.split("src")[0] + 'src');
    
            return files;
        }).then(result => result);
    }

    compile(folder, fileName) {
        const command = `cd ${this.x3_path}\\runtime && bin\\env.bat && bin\\valtrt ${folder} ${fileName}`;
    
        return Command.execute(command, function (result) {
            return result;
        });
    }

    fetch(folder, fileName) {
        const command = `xcopy ${this.folders_path}\\${folder}\\TRT\\${fileName}.src ${this.root_path}\\tmp\\ /Y`;
    
        return Command.execute(command, function (result) {
            return {
                result: result,
                fileName: fileName
            };
        });
    }

    sync(folder, target, destination) {
        const command = `mov ${this.root_path}\\${target} ${this.folders_path}\\${folder}\\TRT\\${destination}.src`;

        console.log(command)
    
        return Command.execute(command, function (result) {
            return {
                result: result,
            };
        });
    }
}

module.exports = Adonix;