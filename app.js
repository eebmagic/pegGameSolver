var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');

var app =  express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname  + '/public'))
    .use(cors())
    .use(cookieParser());

app.listen(process.env.PORT || 8888)
