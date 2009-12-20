var sys = require("sys");
var posix = require("posix");

var file_name = process.ARGV[2];
var file_contents = null;

var i = 0;
var line = "";
var incident = null;
var tmp = null;

posix.cat(file_name).addCallback(function(contents) {
    file_contents = contents.split("\n");
}).wait();

var output = [];

output.push('<checkstyle version="1.1.0">');

var last_file_name = null;

for (i = 0; i < file_contents.length; i++) {
    line = file_contents[i];

    if (line.length > 0) {
        tmp = /(.*)\((\d+)\)\: (.*)/.exec(line);
        incident = {
            file_name: tmp[1],
            line: tmp[2],
            description: tmp[3],
            severity: "error"
        }

        if (incident.description.match(/^SyntaxError/)) {
            incident.severity = "error";
        }

        if (incident.description.match(/^lint warning/)) {
            incident.severity = "warning";
        }

        if (last_file_name !== incident.file_name) {
            if (last_file_name !== null) {
                output.push('</file>');
            }
            output.push('<file name="' + incident.file_name + '">');
        }

        output.push('<error line="' + incident.line + '" column="0" severity="');
        output.push(incident.severity + '" message="' + incident.description + '"/>');
    }
}

if (last_file_name !== null) {
    output.push('</file>');
}

output.push('</checkstyle>');
sys.puts(output.join(""));
