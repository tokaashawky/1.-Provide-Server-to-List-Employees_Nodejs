const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const empjson = path.join(__dirname, "employees.json");
//-----------------------------------------------------------
//-----------------------------------------------------------
const readFile = (filePath, defaultValue = "[]") => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return JSON.parse(defaultValue);
    }
};
const writeFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};
//------------------------------------------------------------
//-----------------------------------------------------------
const handleRequest = (req, res) => {
    const pathname = req.url.split("?")[0];
    if (pathname === "/") {
        const employees = readFile(empjson);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
      <html>
      <head>
      <title>Employees</title>
      <link rel="stylesheet" href="/style.css"></head>
      <body>
        <h1>Employee List</h1>
        <table border="1">
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Salary</th>
                <th>Level</th>
            <th>yearsOfExperience</th>
           </tr>
            ${employees.map(emp => `<tr>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.salary}</td>
            <td>${emp.level}</td>
            <td>${emp.yearsOfExperience}</td>
          </tr>`).join("")}
        </table>
      </body>
      </html>
    `);
    //------------------------------------------------------------
    //-----------------------------------------------------------
    } else if (pathname === "/employee" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const employees = readFile(empjson);
            employees.push(JSON.parse(body));
            writeFile(empjson, employees);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Employee added successfully" }));
        });
    //------------------------------------------------------------
    //-----------------------------------------------------------    
    } else if (pathname === "/style.css") {
        serveFile(res, "style.css", "text/css");
    } else if (pathname === "/astronomy") {
        serveFile(res, "Astronomy_page.html", "text/html");
    } else if (pathname === "/serbal") {
        serveFile(res, "serbal_page.html", "text/html");
    } else if (pathname === "/astronomy/download") {
        res.writeHead(200, {
            "Content-Disposition": "attachment; filename=astronomy.jpg",
            "Content-Type": "image/jpeg",
        });
        fs.createReadStream(path.join(__dirname, "astronomy.jpg")).pipe(res);
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - Not Found</h1>");
    }
};
//------------------------------------------------------------
//----------------------------------------------------------- 
const serveFile = (res, fileName, contentType) => {
    const filePath = path.join(__dirname, fileName);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("500 - Internal Server Error");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
};

http.createServer(handleRequest).listen(4000, () => {
    console.log(`Server running at http://localhost:4000/`);
});
