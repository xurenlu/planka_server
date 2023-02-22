const express = require('express');
const serveStatic = require("@suntower/serve-static2")
const path = require('path');
app = express();
app.use(serveStatic(path.join(__dirname, 'public'),{tryFile:"/index.html"}));
const port = process.env.PORT || 5000;
app.listen(port);
