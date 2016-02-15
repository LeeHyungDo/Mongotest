var express = require('express')
  , bodyParser = require('body-parser')
  , main = require('./main')
  , map = require('./maproutecontroller')
  , http = require('http')
  , stylus = require('stylus')
  , stats = require('./stats')
  , mongoose = require('mongoose')
  , morgan = require('morgan')
  , methodOverride = require('method-override')
  , favicon = require('serve-favicon')
  , errorHandler = require('errorhandler')
  , serveIndex = require('serve-index')
  , app = express();

// MongoDB
mongoose.connect('mongodb://127.0.0.1/WidgetDB');

mongoose.connection.on('open', function() {
   console.log('Connected to Mongoose');
});

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(stats());
  app.use(favicon(__dirname + '/public/images/favicon.ico'));
  app.use(morgan('dev'));
//  app.use(express.staticCache({maxObjects: 100, maxLength: 512}));
  app.use(stylus.middleware({
      src: __dirname + '/views'
    , dest: __dirname + '/public'
  }));
  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(bodyParser.json());
  app.use(methodOverride());
//  app.use(app.router);
  app.use(serveIndex('/public', {'icons': true}));
  app.use(function(req, res, next){
    throw new Error(req.url + ' not found');
  });
  app.use(function(err, req, res, next) {
    console.log(err);
    res.send(err.message);
  });

var env = process.env.NODE_ENV || 'development';
if('development' == env) {
  app.use(errorHandler());
}

// top level
app.get('/', main.index);

app.get('/stats', main.stats);

var prefixes = ['widgets'];


// map route to object controller
prefixes.forEach(function(prefix) {
  map.mapRoute(app, prefix);
});

var server = http.createServer(app).listen(3000);

server.on('close', function() {
   console.log('terminating server');
   client.quit();
});

console.log("Express server listening on port 3000");
