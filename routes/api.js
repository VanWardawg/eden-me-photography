/**
 * Establish our API to serve to the customer
 *
 * app.VERB(path, [callback...], callback) is used to establish routing functionality
 * where VERB is one of the HTTP verbs. We will probably only use get, put, post, delete.
 * http://expressjs.com/api.html#app.VERB
 *
 * the path will be '/api/MODELs' for collections
 * the path will be '/api/MODELs/:_id' for documents
 * make sure each model is pluralized in the path to follow convention
 *
 * If defined in the schema, paths can be models deep.  For example:
 *   '/api/users'						for the collection of users
 *   '/api/users/:_id'					for the document of a specific user
 *   '/api/users/:_id/comments'			for the collection of comments for that specific user
 *   '/api/users/:_id/comments/:_id'	for the document of the specific comment for a specific user
 *
 * After the paths we have callbacks.  Each callback has access to the request, response, and
 * can either return a response or call the next function.
 * For example, lets say we have the following route that attempts to modify a name:
 *   app.put('/api/names/:_id', permissions, crud.putDocument(Name), doMore);
 *
 * The first argument is the path as we explained above
 * The second, third, and fourth arguments are callbacks:
 *   permissions
 *   crud.putDocument(Name)
 *   doMore
 *
 * The first callback "permissions" will run, doing some sort of permissions requirement for the user
 * If the user does not have permissions, this function will need to return a response. For example:
 *   return res.status(401).json({error: "Unauthorized", details: "Unauthorized"});
 * This immediately finishes the route, meaning that "crud" and "doMore" will not execute
 * If permissions were fine, then permissions need to call "next();"  By calling next we excute the next callback
 *
 * The second callback "crud.putDocument(Name)" will run, attempting to add to the database
 * Depending on parameters, crud will either pass the result, or the error to the next callback or the client.
 * see crud.js for more details.
 *
 * Finally the last callback "doMore" will run, iff crud pass the result/error. In case we need some sort of post
 * processing after adding an item to the database.  This can be useful if we need to do something special,
 * like some sort of errorHandling or an internal update (such as increasing a global comment number after
 * saving a user's comment, etc.)
 */

// setup schemas for the api
require('./schemas.js');

// load crud functions
// see crud.js for more information
var crud = require('./crud.js');
//var gm = require('./global-middleware.js');

// Load the routes. Broke each api into a different file.
// require('./api/names.js').load(crud, gm);
// require('./api/events.js').load(crud, gm);
// require('./api/users.js').load(crud, gm);
// require('./api/auth.js').load(crud, gm);