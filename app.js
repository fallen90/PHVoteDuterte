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
    outputs = data + 'outputs/',
    bodyParser = require('body-parser')
facebook = require('./facebook');


app.set('port', env.NODE_PORT || 80);
app.set('ip', env.NODE_IP || '0.0.0.0');
app.set('view engine', 'ejs');
app.set('views', 'public/views');

app.use('/lib', express.static(__dirname + '/public/lib'));
app.use('/css', express.static(__dirname + '/public/assets/css'));
app.use('/img', express.static(__dirname + '/layers'));
app.use('/out', express.static(__dirname + '/outputs'));
app.use('/js', express.static(__dirname + '/public/assets/js'));

app.use(bodyParser.json({
    limit: '50mb'
})); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true,
    limit: '50mb'
}));

app.use(busboy());
app.use(require('connect-livereload')());


//routes

app.get('/', function(req, res) {
    res.render('index', { title: '#PHVoteDuterte' });
});
app.get('/test', function(req, res) {
    res.render('test', { title: '#PHVoteDuterte' });
    console.log(req.query.test);
});
app.get('/health', function(req, res) {
    res.writeHead(200);
    res.end();
});
app.post('/download', function(req, res) {

    function base64_decode(base64str, file) {
        var matches = base64str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        console.log(matches[1]);
        var bitmap = new Buffer(matches[2], 'base64');
        // write buffer to file
        fs.writeFileSync(file, bitmap);
        console.log('******** File created from base64 encoded string ********');
    }

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    var data = req.body.data;
    var accessToken = req.body.accessToken;
    var filename = './outputs/' + makeid() + '.png';

    base64_decode(data, filename);

    facebook.createPost('#PHVoteDuterte', filename, function(resp) {
        console.log('success', JSON.parse(resp));
        res.send(JSON.parse(resp));
    }, function(fail) {
        console.log('faile', fail);
    }, accessToken);
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
