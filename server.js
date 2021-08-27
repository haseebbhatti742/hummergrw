const http = require('http');
const app1 = require("./app");
const app = app1.app

const port = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(port, function() {
    console.log('Server Running! Open Chrome Now');
});