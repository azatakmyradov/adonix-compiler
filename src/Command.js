const exec = require('child_process').exec;

class Command {
    static execute(command, callback) {
        return new Promise((resolve, reject) => {
            exec(command,  { maxBuffer: 1024 * 5000 }, function (error, stdout, stderr) {
                const result = callback(stdout);
    
                console.log(stderr);
    
                resolve(result);
            });
        });
    }
}

module.exports = Command;