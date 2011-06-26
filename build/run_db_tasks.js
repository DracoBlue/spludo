require("./../core");
require("./tasks/db-tasks");
new ConsoleApplication({
    "path": "db:" + process.ARGV[2]
}).run();
