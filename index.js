/*jshint node:true, laxbreak:true */
/**
 * Module dependencies.
 */

var express    = require('express');
var hash       = require('./pass').hash;
var db         = require('./app/services/db');
var bodyParser = require('body-parser');
var session    = require('express-session');

var app = module.exports = express();

// config

app.set('view engine', 'pug');
app.set('views', __dirname + '/app/views');

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

// Session-persisted message middleware

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});


var User = require('./app/models/user');

function register(email, name, password, fn){
  User.where({'email' : email}).fetch().then(function(user){
    
    if (user) return fn(new Error('User already exists'));
    
    hash(password, function(err, salt, hash){

      new User({
        email: email,  
        name: name,
        encrypted_password:hash,
        salt:salt
      }).save().then(fn);
    });
  });
}

function authenticate(email, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', email, pass);

  User.where({'email': email}).fetch().then(function(user) {
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash(pass, user.attributes.salt, function(err, hash){
      if (err) return fn(err);
      if (hash == user.attributes.encrypted_password) return fn(null, user);
      fn(new Error('invalid password'));
    });
  });

}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


app.get('/restricted', restrict, function(req, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});


//ROUTES


app.get('/', function(req, res){
  res.render('index');
});

app.get('/nothing', function(req, res){
  res.render('nothing');
});

app.get('/signUp', function(req, res){
  res.render('signUp');
});
app.post('/signUp', function(req,res){
  //Check for validity
  register(rec.body.email, rec.body.name, rec.body.password, function(err, user){
    if (user) {
      req.session.regenerate(function(){
        req.session.user = user;
        req.session.success = 'Registered as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/restricted');
      });
    } else {
      req.session.error = 'Registration failed:' + err.message;
      res.redirect('/signUp');
   }
  });
});

app.get('/login', function(req, res){
  res.render('login');
});
app.post('/login', function(req, res){
  authenticate(req.body.email, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/restricted');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' email and password.';
      res.redirect('/login');
    }
  });
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
