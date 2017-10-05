var express = require('express');
var app = express.createServer();

app.configure(function () {
    app.use(
        "/", 
        express.static(__dirname) 
    );
});
app.listen(3000); 