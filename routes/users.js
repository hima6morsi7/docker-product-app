var db = require('../config/mongo_database');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');
var getUserByToken = function(req,res,token){
	db.userModel.findOne({ _id: token.user_id}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (user == undefined) {
			return res.send(401);
		}
            console.log(user.id);
			var token = jwt.sign({id: user._id}, secret.secretToken, { expiresIn : tokenManager.TOKEN_EXPIRATION });
			return res.json({token:token});

	});
}
exports.signin = function(req, res) {
	console.log(req.body);
	var username = req.body.username || '';
	var password = req.body.password || '';
	
	if (username == '' || password == '') { 
		return res.send(401); 
	}

	db.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (user == undefined) {
			return res.send(401);
		}
		
		user.comparePassword(password, function(isMatch) {
			if (!isMatch) {
				console.log("Attempt failed to login with " + user.username);
				return res.send(401);
            }
            console.log(user.id);
			var token = jwt.sign({id: user._id}, secret.secretToken, { expiresIn : tokenManager.TOKEN_EXPIRATION });
			var token_entry = new db.token_model();
			token_entry.token = token;
			token_entry.user_id = user._id;
			token_entry.save(function(err) {
			if (err) {
				console.log("error");
				console.log(err);
				return res.send(400);
			}
		});
			return res.json({token:token});
		});

	});
};
exports.refresh = function(req, res) {
	console.log(req.body);
	var token = req.body.token || '';
	
	if (token == '') { 
		
		return res.send(401); 
	}
    db.token_model.findOne({ token: token}, function (err, token) {
	if (err) {
			console.log(err);
			return res.send(401);
	}
	// getUserByToken(req,res,token);
	db.userModel.findOne({ _id: token.user_id}, function (err, user) {
		if (err) {
			console.log(err);
			return res.send(401);
		}

		if (user == undefined) {
			return res.send(401);
		}
            console.log(user.id);
			var token = jwt.sign({id: user._id}, secret.secretToken, { expiresIn : tokenManager.TOKEN_EXPIRATION });
			return res.json({token:token});

	});
	});
};

exports.logout = function(req, res) {
	if (req.user) {
		tokenManager.expireToken(req.headers);

		delete req.user;	
		return res.send(200);
	}
	else {
		console.log("fail");
		return res.send(401);
	}
}

exports.register = function(req, res) {
	console.log(req.body);
	var username 			 = req.body.username || '';
	var password 			 = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';
	var email 				 = req.body.email || null;
	var phone_number 		 = req.body.phone_number || null;
	
	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.send(400);
	}

	var user = new db.userModel();
	user.username 		= username;
	user.password 		= password;
	user.email	  		= email;
	user.phone_number	= phone_number;

	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.send(500);
		}	
		
		db.userModel.count(function(err, counter) {
			if (err) {
				console.log(err);
				return res.send(500);
			}

			// if (counter == 1) {
			// 	db.userModel.update({username:user.username}, {is_admin:true}, function(err, nbRow) {
			// 		if (err) {
			// 			console.log(err);
			// 			return res.send(500);
			// 		}

			// 		console.log('First user created as an Admin');
			// 		return res.send(200);
			// 	});
			// } 
			// else {
				return res.send(200);
			// }
		});
	});
}