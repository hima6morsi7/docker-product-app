var db = require('../config/mongo_database.js');
var public_fields = '_id name category region price location zip_code descr img1 img2 img3 created user_id';
var mongoosePaginate = require('mongoose-paginate');


exports.all = function(req, res) {
	var query = db.product_model.find();

	query.select(public_fields);
	query.sort('-created');
	query.exec(function(err, results) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}
    	console.log(results);
  		return res.json(200, results);
	});
};
exports.allByPage = function(req, res) {
	 var query = {};
    var product_model = db.product_model;
        if (req.params.term) {
            query = { $text: { $search: req.params.term } };
        }

        product_model.paginate(query, { page: parseInt(req.params.pageIndex), limit: parseInt(req.params.pageSize) }, function(err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        });
	
};
exports.get = function(req, res) {
	var id = req.params.id || '';
	if (id == '') {
		return res.send(400);
	}
	var query = db.product_model.findOne({_id: id});
	query.select(public_fields);
	query.exec(function(err, result) {
		if (err) {
  			console.log(err);
  			return res.send(400);
  		}

  		if (result != null) {
  			db.userModel.findOne({_id: result['user_id']}, function (err, user) {
  				product = {};
  				product['seller'] = user.username;
  				product['phone_number'] = user.phone_number;
  				product['email'] = user.email;
  				product['id'] = result._id;
				product['name'] = result.name;
				product['category'] = result.category;
				product['region'] = result.region;
				product['price'] = result.price;
				product['location'] = result.location;
				product['zip_code'] = result.zip_code;
				product['descr'] = result.descr;
				product['img1'] = result.img1;
				product['img2'] = result.img2;
				product['img3'] = result.img3;
				product['created'] = result.created;
				console.log(product);
				return res.json(200, product);
			});
		
  		} else {
  			return res.send(400);
  		}
	});
};

exports.create = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}
	db.userModel.findOne({_id: req.user.id}, function (err, user) {
	
		var product = req.body.product;
		console.log(req.body);	
		if (product == null || product.name == null || product.category == null || product.region == null) {
			return res.send(400);
		}
		var product_entry = new db.product_model();
		product_entry.name 		= product.name;
		product_entry.category 	= product.category.name;
		product_entry.region 	= product.region.name;
		product_entry.price 		= product.price;
		product_entry.location 	= product.location;
		product_entry.zip_code 	= product.zip_code;
		product_entry.descr 		= product.descr;
		product_entry.img1 		= product.img1;
		product_entry.img2 		= product.img2;
		product_entry.img3 		= product.img3;
		product_entry.user_id 	= user.id;
		product_entry.save(function(err) {
			if (err) {
				console.log("error");
				console.log(err);
				return res.send(400);
			}
			return res.send(200);
		});
	});
}

exports.update = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}
	db.productModel.findOne({_id: req.body.product.id ,user_id: req.user.id}, function (err, user) {
			if (err) {
  			console.log(err);
  			return res.send(400);
  		}
		var product = req.body.product;
		var updateProduct = {};
		console.log(req.body);	
		if (product == null || product.name == null || product.category == null || product.region == null) {
			return res.send(400);
		}
		product.updated = new Date();

		db.productModel.update({_id: product.id}, product, function(err, nbRows, raw) {
			console.log(product.name);
			if (err) {
  				console.log(err);
				return res.send(400);
  			}
			return res.send(200);
		});
	});
};

exports.delete = function(req, res) {
	if (!req.user) {
		return res.send(401);
	}

	var id = req.params.id;
	if (id == null || id == '') {
		res.send(400);
	} 

	var query = db.productModel.findOne({_id:id});

	query.exec(function(err, result) {
		if (err) {
			console.log(err);
			return res.send(400);
		}

		if (result != null) {
			result.remove();
			return res.send(200);
		}
		else {
			return res.send(400);
		}
		
	});
};

