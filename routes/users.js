var express = require('express');
var router = express.Router();
//Passport stuff for login
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.post('/register', function(req, res){
	// Remember, these are linked to the forms you create, and specifically, the form "names"
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

//Validation
req.checkBody('name', 'Name is required').notEmpty(); //checks the body of the req for name. after name is the error msg, then it sets it so it can't be empty
req.checkBody('email', 'Email is required').notEmpty();
req.checkBody('username', 'Username is required').notEmpty();
req.checkBody('password', 'Password is required').notEmpty();
req.checkBody('password2', 'Passwords do not match').equals(req.body.password); //password 2 needs to equal password 1

var errors = req.validationErrors(); //checks for errors in req
if (errors) {
	res.render('register', {
		errors:errors
	});
} else {
	 var newUser = new User({
		 name: name,
		 email: email,
		 username: username,
		 password: password
	 });

	 User.createUser(newUser, function(err, user){
		 if(err) throw err;
		 console.log(user);
	 });

	 req.flash('success_msg', 'You are registered and can now log in');

	 res.redirect('/users/login');
}

});


//This gets username, checks if there's one that matches it then validates that password
passport.use(new LocalStrategy(
  function(username, password, done) {
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown User'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
    // User.findOne({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
  }));


//Serialize and deserialze functions from passport. Have to do with user login sessions
	passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


//passport login
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}), //Setting up some other params.
  function(req, res) {
    res.redirect('/');
  });

//logout
	router.get('/logout', function(req, res){
		req.logout();
		req.flash('success_msg', 'You are logged out');
		res.redirect('/users/login');
	});

module.exports = router;
