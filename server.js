const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json"
};

http.createServer((req, res) => {
  const decodedUrl = decodeURIComponent(req.url);
  let filePath = "." + decodedUrl.split("?")[0];
  if (filePath === "./") {
    filePath = "./index.html";
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1><p>The requested file was not found.</p>", "utf-8");
      } else {
        res.writeHead(500);
        res.end("Server Error: " + error.code + "\n");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}).listen(PORT);

console.log(`LexiVerse server running at http://localhost:${PORT}/`);
