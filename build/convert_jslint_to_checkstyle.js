/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");
var fs = require("fs");

var file_name = process.ARGV[2];

var i = 0;
var line = "";
var incident = null;
var tmp = null;

var file_contents = fs.readFileSync(file_name).toString().split("\n");

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
        };

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

        last_file_name = incident.file_name;
    }
}

if (last_file_name !== null) {
    output.push('</file>');
}

output.push('</checkstyle>');
sys.puts(output.join(""));
