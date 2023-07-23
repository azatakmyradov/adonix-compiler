const exec = require("child_process").exec;

class Command {
  /*
   * Run system commands
   *
   * @param command Command to be executed
   * @param callback Callback to handle the result
   */
  static execute(command, callback) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        { maxBuffer: 1024 * 5000 },
        function (error, stdout, stderr) {
          const result = callback(stdout);

          console.log(stderr);

          resolve(result);
        }
      );
    });
  }
}

module.exports = Command;
