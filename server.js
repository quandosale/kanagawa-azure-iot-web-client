const express = require("express");
const http = require("http");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "dist")));

app.use(function(req, res /*, next*/) {
  res.redirect("/");
});

const server = http.createServer(app);

var port = normalizePort(process.env.PORT || "8080");
server.listen(port, function listening() {
  console.log("Listening on %d", server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
