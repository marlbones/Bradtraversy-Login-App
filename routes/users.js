var express = require('express');
var router = express.Router();

var User = require('../models/user')
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

module.exports = router;
