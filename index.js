var http = require('http');
var connection = require('./db');

var hostname = 'localhost';
var port = 3000;



var fs = require("fs");

var url = require('url');
var querystring = require('querystring');



var srv = http.createServer(function (req, res) {

    var path = url.parse(req.url).pathname;

    var query = querystring.parse(url.parse(req.url).query);

    console.log(path);
    console.log(query);


//Return vfly.png

    if (path === '/vfly.png') {

        fs.readFile("html/vfly.png", function (err, img) {

            if (err) {
                console.log(err);
                console.log('File not found');
            } else {
                console.log('Sending V-Fly');
                res.writeHead(200, {
                    'Content-Type': "image/png"
                });
                res.end(img);
            }
        });

//Return HTML page

    } else if (req.url.indexOf('.html') && path === '/home') {

        fs.readFile('html/toListen.html', function (err, data) {

            if (err) {
                throw err;
                res.writeHead('404');
                res.end('Erreur 404');
            } else {
                res.writeHead(200, {
                    'Content-Type': "text/html"
                });
                res.end(data);
            }

        });

//Return CSS page

    } else if (path === '/bootstrap.min.css') {
        console.log('Request a .css file from ' + req.url);
        fs.readFile('../bootstrap-3.3.7-dist/css/bootstrap.min.css', function (err, css) {

            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, {

                    'Content-Type': "text/css"
                });
                res.end(css, 'utf-8');
            }
        });

//Return JavaScript 

    } else if (path === '/ajax.js') {
        console.log('Request a .js file from ' + req.url);
        fs.readFile('html/ajax.js', function (err, js) {


            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, {

                    'Content-Type': "application/javascript"

                });
                res.end(js, 'utf-8');
            }
        });

//Treat POST request

    } else if (path === '/sendForm' && req.method === 'POST') {

        console.log(req.method + ' request !');
        console.log(req.headers);

        var reqBody = '';
        req.on('data', function (data) {

            reqBody += data;
            console.log("****Incoming Data****.");

        });
        req.on('end', function () {

            console.log(reqBody);

            var formData = querystring.parse(reqBody);
            console.log(formData);

            connection.query('INSERT INTO link SET ?', formData,
                    function (err, rows, fields) {

                        if (err) {
                            throw err;
                        }
                        console.log('Insert successful');
                    });

            fs.readFile('html/toListen.html', function (err, data) {

                if (err) {
                    throw err;
                    res.writeHead('404');
                    res.end('Erreur 404');
                } else {
                    res.writeHead(200, {

                        'Content-Type': "text/html"
                    });
                    res.end(data);
                }
            });
        });

//AJAX 

    } else if (path === '/myToListen') {

        connection.query('SELECT * FROM link',
                function (err, rows, fields) {
                    if (err) throw err;
                    else {
                        var linksJSON = JSON.stringify(rows);
                        res.writeHead(200, {
                            'Content-Type': "application/json"
                        });
                        res.end(linksJSON);
                    }
                });

    } else if (querystring.parse(url.parse(req.url).query)['id']) {

        var id = querystring.parse(url.parse(req.url).query)['id'];
        connection.query('DELETE FROM link WHERE id = ?', id, function (err, rows, fields) {
            if (err) {
                throw err;
            }
            console.log('delete successful');
        });

        fs.readFile('html/toListen.html', function (err, data) {

            if (err) {
                throw err;
                res.writeHead('404');
                res.end('Erreur 404');
            } else {
                res.writeHead(200, {
                    'Content-Type': "text/html"
                });
                res.end(data);
            }
        });

//Return a 404 error

    } else {
        res.writeHead(404, {
            'Content-Type': "text/html"
        });
        res.end('404 Error');
    }
});

srv.listen(port, hostname, function () {

    console.log('Server is running at http://' + hostname + ':' + port);

});