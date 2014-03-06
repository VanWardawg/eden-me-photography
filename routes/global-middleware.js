exports.permissions = function(req, res, next) {
	// do some sort of authentication checking here
	// if not authenticated yet, do this:
	// return res.status(401).json({error: "Unauthorized", details: "Unauthorized"});

	// do some sort of permission checking here
	// if user does not have permissions:
	// return res.status(403).json({error: "Forbidden", details: "Forbidden"});

	// otherwise continue with the action
	if (req.isAuthenticated())
		next();
	else
		res.redirect('/login');
}


////
// Bad functions
// Used for testing possible errors that the serve can encounter
// NEVER use this when pushing to production
////

// adding a delay to see slow connections
exports.delay = function(delay) {
	return function delayRoute(req, res, next) {
		if(next != null && delay != null)
			setTimeout(next, delay);
	}
}

// a function to emulate errors
exports.error = function(status, err) {
	// defaults
	if(isNaN(status))
		status = 500;
	if(isNaN(err))
		err = {error: "Internal Server Error", details: "Intentional Error"};

	return function errorRoute(req, res, next) {
		return res.status(status).json(err);
	}
}

// a function to emulate infinite loops/never returning a response
exports.nonResponse = function(req, res, next) {}