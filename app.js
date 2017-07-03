var express = require('express');
var app = express();
var jwt = require('express-jwt');
var bodyParser = require('body-parser'); //bodyparser + json + urlencoder
var morgan  = require('morgan'); // logger
var tokenManager = require('./config/token_manager');
var serveStatic = require('serve-static')
var secret = require('./config/secret');
var path = require('path');

app.use(bodyParser());
app.use(morgan());

var routes = {};
routes.products = require('./routes/products.js');
routes.users = require('./routes/users.js');


app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost');
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});
app.use(serveStatic(path.join(__dirname, '/public')));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.get('/',function(req,res){
res.render('index');
})
//Create a new user
app.post('/user/register', routes.users.register); 

//Login
app.post('/user/signin', routes.users.signin); 
//Refresh ession
app.post('/user/refresh', routes.users.refresh); 

//Logout
app.get('/user/logout', jwt({secret: secret.secretToken}), routes.users.logout); 

app.get('/products', routes.products.all);
app.get('/productsByPage/:pageSize/:pageIndex', routes.products.allByPage);

app.get('/product/:id', routes.products.get);

app.put('/product', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.products.update); 

app.post('/product', jwt({secret: secret.secretToken}), tokenManager.verifyToken , routes.products.create); 

app.delete('/product/:id', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.products.delete); 

app.listen(3001);

console.log('Blog API is starting on port 3001');