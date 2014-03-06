/**
 * http://en.wikipedia.org/wiki/Monkey_patch
 * A monkey patch is a way to extend or modify the run-time code of dynamic languages
 * without altering the original source code. This process has also been termed
 * duck punching and shaking the bag.
 * 
 * Monkey patching is used to:
 * Modify/extend behaviour of a third-party product without maintaining a private copy of the source code
 * ...
 */

// This monkeypatch forces mongoose to require all paths by default.
// However it does allow overriding with "pathName: {type: SomeType, required: false}""
mongoose.Schema = (function monkeyPatch(original) {
	var schema = function Schema(obj,options) {
		for(var path in obj) {
			if(obj.hasOwnProperty(path)) {
				if(typeof obj[path] != 'object') {
					obj[path] = {
						type: obj[path],
						required: true 
					}
				} else if(obj[path].required == null) {
					obj[path].required = true;
				}
			}
		}
		return original.apply(this, arguments);
	};

	schema.prototype = schema.__proto__ = original;
	return schema;
})(mongoose.Schema);

// This monkeypatch cancel the console log when a client sends a malformed request
// this should not show up in the server logs because the server did not crash
var temp = (function monkeyPatch(original) {
	return function duckPunch() {
		var errorHandler = function errorHandler(err, req, res, next) {
			var consoleErr = console.error;
			console.error = function noop() {};
			var result = original.apply(this, arguments);
			console.error = consoleErr;
			return result;
		}
		errorHandler.prototype = errorHandler.__proto__ = original;
		return errorHandler;
	};
})(express.errorHandler());

// express is doing something weird so we can't modify the errorHandler
// bypass this by deleting the property first
delete express.errorHandler;
express.errorHandler = temp;