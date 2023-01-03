var fs = require("fs"),
    file = process.argv[2],
    data = fs.readFileSync(file);

console.log(data.toString("base64"));
