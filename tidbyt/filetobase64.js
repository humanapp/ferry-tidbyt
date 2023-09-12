var fs = require("fs"),
    file = process.argv[2],
    data = fs.readFileSync(file);

fs.writeFileSync(file + ".txt", data.toString("base64"));
