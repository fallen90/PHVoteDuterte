var express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    busboy = require('connect-busboy'),
    low = require('lowdb'),
    storage = require('lowdb/file-sync'),
    db = low('db.json', { storage }),
    env = process.env,
    data = typeof env.OPENSHIFT_DATA_DIR != 'undefined' ? env.OPENSHIFT_DATA_DIR : './',
    uploads = data + 'uploads/',
    outputs = data + 'outputs/'

app.set('port', env.NODE_PORT || 80);
app.set('ip', env.NODE_IP || '0.0.0.0');
app.set('view engine', 'ejs');
app.set('views', 'public/views');

app.use('/lib', express.static(__dirname + '/public/lib'));
app.use('/css', express.static(__dirname + '/public/assets/css'));
app.use('/img', express.static(__dirname + '/layers'));
app.use('/js', express.static(__dirname + '/public/assets/js'));

app.use(busboy());


//routes

app.get('/', function(req, res) {
    res.render('index', {title : '#PHVoteDuterte'});
});
app.get('/test', function(req, res) {
    res.render('test', {title : '#PHVoteDuterte'});
});
app.get('/health', function(req, res) {
    res.writeHead(200);
    res.end();
});

app.post('/file-upload', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        var key = generateKey();
        filename = uploads + key + path.extname(filename);

        fstream = fs.createWriteStream(filename);
        file.pipe(fstream);

        fstream.on('close', function() {
            res.send({
                key: key
            });
            
        });
    });
});

var server = http.createServer(app).listen(app.get('port'), app.get('ip'), function() {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'), app.get('port'));
});

var generateKey = function() {
    var tmpk = 125 * (new Date().getTime()).toString();
    var key = tmpk.substring(tmpk.length, tmpk.length / 2);
    return key;
}
