require("./../core");
require("./tasks/db-tasks");
new ConsoleApplication({
    "path": "db:" + process.argv[2]
}).run();
