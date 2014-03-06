/**
 * RESTful CRUD (REpresentational State Transfer - Create Read Update Delete)
 * wikipedia: http://en.wikipedia.org/wiki/Representational_state_transfer
 * http://en.wikipedia.org/wiki/Create,_read,_update_and_delete
 *
 * We use crud when we establish a route for the frontend to use.
 * crud has 8 functions:
 * getCollection, putCollection, postCollection, deleteCollection
 * getDocument, putDocument, postDocument, deleteDocument
 *
 * each function can take 3 parameters: (Model [,passSuccess [,passError]])
 * We always need to pass in the Model that we are going to use. The models are defined in schemas.js.
 *
 * passSuccess is an optional parameter.  If you want addition middleware afterwards, set passSuccess to true. 
 * If you want the route to finish with the crud operation and return the result to the client, omit it.
 *
 * passError is also an optional parameter.  Normally crud will directly return the error to the client
 * then we can use angular to handle that error on the client side.  In case we would rather handle that
 * error on the server side, we can set passError to true.  Instead of sending a response to the client,
 * the error is saved on request.error, and then we call next()
 * Two important things to remember:
 *   passError takes presidence over passSuccess.  passError must be the third argument, so passSuccess should be
 *     explcitly set to either true or false.  If there were no errors, crud follows the passSuccess behavior.
 *   The next callback function must be able to handle the error.  Especially if passSuccess is false, the next
 *     callback will need to examine the req.error and req.response to determine if the crud worked.
 */


////
// Error checking helper functions
////

exports.modelErr = function() {
	return function(req, res, next) {
		return res.status(500).json({
			error: "Unknown Error",
			details: "Model not given"
		});
	}
}

exports.errorHandler = function(Model, req, res, next, passError, action) {
	return function error(status, details) {
		if(status == 500) {
			console.error("--CRUD server error when "+action);
			console.error("---details: "+details);
		}
		var error = {
			error: "Error " + action + " " + Model.modelName,
			status: status,
			details: details
		};
		if(passError) {
			req.error = error;
			next();

		} else {
			return res.status(status).json(error);
		}
	}
}

exports.prepareObj = function(obj, inc) {

	// remove any of angular's funny business
	for (var key in obj)
		if(obj.hasOwnProperty(key) && key.charAt(0) == "$")
			delete obj[key];

	// Remove the _id because "Mod on _id not allowed" and set the version number to increment by 1
	delete obj._id;
	delete obj.__v;
	if(inc)
		obj['$inc'] = { __v: 1 };
}

exports.validateCollection = function(Model, collection, cb, index) {
	if(index == null)
		index = collection.length-1;

	var doc = new Model(collection[index]);
	doc.validate(function checkValid(err) {
		if(err)
			return cb(err);
		if(index == 0)
			return cb();
		exports.validateCollection(Model, collection, cb, index-1);
	});
}

////
// Documents
////

// POST on document: Not generally used. Treat the document as a collection and create a new document in it.
// Because this is an odd one, we'll leave it unimplemented.  Use postCollection instead.
exports.postDocument = function(Model, passSuccess, passError) {
	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "creating");
		return error(501, "Posting on document not implemented");
	}
}

// GET on document: Retrieve a document by id
exports.getDocument = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "getting");

		if (!req)
			return error(500, "No request found");
		if (!req.params)
			return error(400, "No request parameters found");
		if (!req.params._id)
			return error(400, "Missing id from parameters");

		return Model.findById(req.params._id, function(err, result) {
			if (err)
				return error(500, err);
			if (!result)
				return error(404, "No result returned");
			if (!passSuccess)
				return res.json(result);

			req.resource = result;
			next();
		});
	}
}

// PUT on document: Updates the document of the collection, or if it doesn't exist, create it.
exports.putDocument = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "updating");

		if (!req)
			return error(500, "No request found");
		if (!req.params)
			return error(400, "No request parameters found");
		if (!req.body)
			return error(400, "No request body found");
		if (!req.params._id)
			return error(400, "Missing _id from parameters");
		if (!req.body._id)
			return error(400, "Missing _id from body");
		if (req.params._id != req.body._id)
			return error(400, "_id from parameters and body do not match ("+req.params._id+" != "+req.body._id+")");

		exports.prepareObj(req.body, true);
		var doc = new Model(req.body);

		doc.validate(function valid(err) {
			if(err)
				return error(400, err);

			return Model.findByIdAndUpdate(req.params._id, req.body, function(err, result) {
				if (err)
					return error(500, err);
				if (!result)
					return error(404, "No result returned");
				if (!passSuccess)
					return res.json(result);

				req.resource = result;
				next();
			});
		});
	}
}

// DELETE on document: Deletes the object from the collection.
exports.deleteDocument = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "deleting");

		if (!req)
			return error(500, "No request found");
		if (!req.params)
			return error(400, "No request parameters found");
		if (!req.params._id)
			return error(400, "Missing id from parameters");

		return Model.findByIdAndRemove(req.params._id, function(err, result) {
			if (err)
				return error(500, err);
			if (!result)
				return error(404, "No result returned");
			if (!passSuccess)
				return res.json(result);

			req.resource = result;
			next();
		});
	}
}

////
// Collections
////

// POST on collection: Create a new document in the collection.
exports.postCollection = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "creating");

		if (!req)
			return error(500, "No request found");
		if (!req.body)
			return error(400, "No request body found");
		if (req.body._id)
			return error(400, "New document must not have _id");
		if (req.body.__v)
			return error(400, "New document must not have __v (versioning number)");

		exports.prepareObj(req.body, false);
		var doc = new Model(req.body);

		doc.validate(function valid(err) {
			if(err)
				return error(400, err);

			doc.save(function(err, result) {
				if (err)
					return error(500, err);
				if (!result)
					return error(404, "No result returned");
				if (!passSuccess)
					return res.json(result);

				req.resource = result;
				next();
			});
		});
	}
}

// GET on collection: Lists the documents in the entire collection.
exports.getCollection = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "getting all");

		return Model.find(function(err, result) {
			if (err)
				return error(500, err);
			if (!result)
				return error(404, "No result returned");
			if (!passSuccess)
				return res.json(result);

			req.resource = result;
			next();
		});
	}
}

// PUT on collection: Replaces the entire collection with another collection.
exports.putCollection = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "replacing all");

		if (!req)
			return error(500, "No request found");
		if (!req.body)
			return error(400, "No request body found");
		if(Object.prototype.toString.call(req.body) !== '[object Array]')
			return error(400, "Request body must be an array");


		exports.validateCollection(Model, req.body, function valid(err) {

			if(err)
				return error(400, err);

			// because of weird async and _id behaviors we have to do this intelligently
			// we need to remove any item that is in the db, but not in the request
			// we need to update any item that is in the db, and is in the request
			// we need to create any item that is not in the db, and is in the request
			// we also need to pay special attention to _id's

			// get the collection
			return Model.find(function(err, results) {
				// die if error
				if (err)
					return error(500, err);
				if (!results)
					return error(404, "No result returned");

				// create temporary maps/arrays
				var removeDocs = {};
				var updateDocs = [];
				var createDocs = [];

				// change the results to a map of {_id: {object including _id}}
				// and push it into the remove array
				var temp = {};
				for (var i = results.length - 1; i >= 0; i--) {
					temp[results[i]._id] = results[i];
					removeDocs[results[i]._id] = results[i];
				};
				results = temp;

				// seperate the request into the groups
				for (var i = req.body.length - 1; i >= 0; i--) {
					// get the id from each object
					var id = req.body[i]._id;

					// if the item doesn't have an id, create it
					if(id == null) {
						createDocs.push(req.body[i]);

					// otherwise modify it
					} else {
						// if the object does not have a match, then it is new, but has it's own _id
						// do not allow any PUT that does a custom _id
						if(results[id] == null)
							return error(400, "New document must not have _id");

						// push it to the update
						updateDocs.push(req.body[i]);
						// remove it from the remove map
						delete removeDocs[id];
					}
				};

				// define failure rollback maps
				var resetCreate = [];
				var resetModify = [];
				var resetRemove = [];

				function success() {
					exports.getCollection(Model, passSuccess, passError)(req, res, next);
				}

				// if the worst happens, attempt to fix
				function rollback(err) {
					console.log("Recovering!");
					var createFn = createNextDoc(Model, resetRemove, results, [], rollbackSuccessful, rollbackUnsuccessful);
					var updateFn = updateNextDoc(Model, updateDocs, results, [], createFn, rollbackUnsuccessful);
					var removeFn = removeNextDoc(Model, resetCreate, results, [], updateFn, rollbackUnsuccessful);
					removeFn();
				}

				function rollbackSuccessful(err) {
					console.log("Recovery Succeed!");
					return error(500, err);
				}

				function rollbackUnsuccessful(err) {
					console.log("Recovery Failed!");
					return error(500, err);
				}

				var removeFn = removeNextDoc(Model, removeDocs, results, resetRemove, success, rollback);
				var updateFn = updateNextDoc(Model, updateDocs, results, resetModify, removeFn, rollback);
				var createFn = createNextDoc(Model, createDocs, results, resetCreate, updateFn, rollback);
				createFn();
			});
		});	
	}
}

// DELETE on Collection: Deletes the entire collection.
exports.deleteCollection = function(Model, passSuccess, passError) {
	if (!Model || !Model.modelName)
		return exports.modelErr();

	return function(req, res, next) {
		var error = exports.errorHandler(Model, req, res, next, passError, "deleting all");

		// get the collection (to return)
		return Model.find(function(err, result) {
			if (err)
				return error(500, err);
			if (!result)
				return error(404, "No result returned");
			req.resource = result;

			// remove the collection
			return Model.remove(function(err) {
				if (err)
					return error(500, err);
				if (!passSuccess)
					return res.json(req.resource);

				next();
			});
		});

	}
}


////
// Recursive Methods with fallbacks

// create each model one at a time
function createNextDoc(Model, collection, original, undo, callback, errorCb) {
	return function() {
		if (collection.length == 0)
			return callback();
		var createDoc = collection.pop();

		exports.prepareObj(createDoc, false);
		var doc = new Model(createDoc);
		return doc.save(function(err, result) {
			if (err)
				return errorCb(err);
			undo.push(result._id);
			return createNextDoc(Model, collection, original, undo, callback, errorCb)();
		});
	};
}

// update each model one at a time
function updateNextDoc(Model, collection, original, undo, callback, errorCb) {
	return function() {
		if (collection.length == 0)
			return callback();

		var updateDoc = collection.pop();
		var id = updateDoc._id;

		exports.prepareObj(updateDoc, true);
		return Model.findByIdAndUpdate(id, updateDoc, function(err, result) {
			if (err)
				return errorCb(err);

			undo.push(original[id]);
			return updateNextDoc(Model, collection, original, undo, callback, errorCb)();
		});
	};
}

// remove each model one at a time
function removeNextDoc(Model, collection, original, undo, callback, errorCb) {
	return function() {

		var removeObj = popAssociativeArray(collection);

		if (removeObj === null)
			return callback();

		var removeId = removeObj._id;
		return Model.remove({_id : removeId}, function(err, numberRemoved) {
			if (err)
				return errorCb(err);
			if (numberRemoved !== 1)
				return errorCB({error:"Invalid Remove",details:"Number removed ("+numberRemoved+") != 0"});

			undo.push(original[removeId]);
			return removeNextDoc(Model, collection, original, undo, callback, errorCb)();
		});
	};
};

function popAssociativeArray(collection) {
	if(Object.prototype.toString.call(collection) != "[object Object]")
		return undefined;
	for(var property in collection) {
		if(collection.hasOwnProperty(property)) {
			var temp = collection[property];
			delete collection[property];
			return temp;
		}
	}
	return null;
}
