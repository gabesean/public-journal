const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
var _ = require('lodash');
const truncateHTML = require("html-truncate");
const getInnerText = require("innertext");
const logger = require('morgan');
const flash = require("connect-flash");

// Require Routes
const authRouter = require(__dirname + '/src/routes/auth.js');

// DOTENV
const MONGO_KEY = process.env.MONGO_KEY;

// mongoDB
// !!!!!!!!!!!!!!! IMPORTANT: RUN VALIDATORS GLOBALLY !!!!!!!!!!!!!!!
mongoose.set("runValidators", true);
mongoose.set('strictQuery', false);

// Catch and log any initial errors
mongoose.connect(`mongodb+srv://admin:${MONGO_KEY}@cluster0.p5ba3.mongodb.net`, {
	dbName: 'JOURNALDB',
	useNewUrlParser: true,
   useUnifiedTopology: true,
}).catch((err) => console.log(err)) ;

// Handle mongoDB connection errors
const db = mongoose.connection;
db.on('error', (err) => {
   console.log('database error occured', err);
});
db.once('open', (err) => {
   console.log('opened the database successfully', err);
});
db.once('disconnected', (err) => {
   console.log('database has mysteriously disconnected', err);
});


// MODULES
const startContent = require(__dirname + "/src/modules/content.js");
const utils = require(__dirname + "/src/modules/utils.js");
const { renderLoginLogoutButton, verifyPassForm, changeUsernameForm, changePasswordForm } = require(__dirname + "/src/modules/htmlRenderers.js");

// MODELS
const User = require(__dirname + "/src/models/user.js");
const Comment = require(__dirname + "/src/models/comment.js");
const Entry = require(__dirname + "/src/models/entry.js");

// Authentication
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// SESSION
const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
const MongoDBStore = require('connect-mongo');

// ANON ID
const generate = require('meaningful-string');
const genOptions = {
	"numberUpto": 100,
	"joinBy": '_'
}

// SECURITY
const encrypt = require("mongoose-encryption");


// store.on('error', (error) => {
// 	console.log(error)
// });


// Start app
const app = express();



// APP.LISTEN
const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Listening on port ... ` + port));


// EJS & lodash inside EJS
app.set("views", (__dirname + "/src/views"));
app.set('view engine', 'ejs');
app.set("view options", { rmWhitespace: true }); // Try to remove extra whitespace from EJS
app.locals._ = _;
app.locals.truncateHTML = truncateHTML;
app.locals.getInnerText = getInnerText;
app.locals.utils = utils;
app.locals.PACKAGE_VERSION = process.env.npm_package_version;

// APP.USE
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
   "/tinymce",
   express.static(__dirname + "/node_modules" + "/tinymce")
);

// Session Storage
// const store = new MongoDBStore({
// 		uri: "mongodb+srv://admin:" + MONGO_KEY + "@cluster0.p5ba3.mongodb.net/",
// 		databaseName: 'JOURNALDB',
// 		collection: 'sessions'
// 	},
// 	(error) => {
// 		console.log(error);
// 	});

const sess = {
	secret: process.env.CRYPT_KEY,
	store: new MongoDBStore({
		mongoUrl: `mongodb+srv://admin:${MONGO_KEY}@cluster0.p5ba3.mongodb.net/`,
		databaseName: 'JOURNALDB',
		collection: 'sessions'
	}),
	resave: false,
	saveUninitialized: false,
	cookie: {}
}


if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sess.cookie.secure = true // serve secure cookies
}



// Exports Modules
const startObject = startContent.content();
const date = utils.getTheDate();


// ENCRYPTION
// const secret = process.env.CRYPT_KEY;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });


// Initialize Passport & Session
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());



// Use Routes and Flash Messages
app.use(flash());
app.use('/', authRouter);




// ------------ Get Routes ------------ //
app.get("/", (req, res) => {
	const sortQuery = req.query.sort;
	let sortDirections;

	console.log(req.session)

	if (sortQuery === "oldest") {
		sortDirections = { 'createdAt': 1 };
	} else {
		sortDirections = { 'createdAt': -1 };
	}

	Entry.find({})
		.populate({ "path": "createdBy", "strictPopulate": false })
		.sort(sortDirections)
		.exec((err, entries) => {
			if (err) {
				console.log(err);
			} else {

            // Fetch number of comments sitewide
            Comment.find({}, (err, comments) => {

					res.render("home", {
                  currentRoute: req.originalUrl.slice(1),
                  loggedInUser: req.user,
                  pageTitle: "Front Page",
                  aboutContent: startObject.aboutContent,
                  userSignInLogout: renderLoginLogoutButton(req),
                  discardingTime: startObject.timeToDiscard,
                  entry: entries,
                  commentsLength: comments.length,
                  messages: req.flash(),
               });
            });
			}
		});
});


app.get("/entry", (req, res) => {
	const sortQuery = req.query.sort;
	let sortDirections;

	console.log(req.session)

	if (sortQuery === "oldest") {
		sortDirections = { 'createdAt': 1 };
	} else {
		sortDirections = { 'createdAt': -1 };
	}

	try {

		const findFunc = Entry.find({})
			.populate({ "path": "createdBy", "strictPopulate": false })
			.sort(sortDirections)
			.exec((err, entries) => {
				if (err) {
					console.log(err);
				} else {

               // Fetch number of comments sitewide
               Comment.find({}, (err, comments) => {

						res.render("entry-list", {
                     currentRoute: req.originalUrl.slice(1),
                     loggedInUser: req.user,
                     pageTitle: "All Entries",
                     userSignInLogout: renderLoginLogoutButton(req),
                     entry: entries,
                     commentsLength: comments.length,
                     messages: req.flash(),
                  });
               });
            }
			});
	} catch (err) {
		console.log(err);
	}
});

app.get("/entries", (req, res) => {
	res.redirect("/entry");
});

// Journal Single Pages
app.get("/entry/:id", (req, res) => {
	const reqTitle = _.lowerCase(req.params.title);
	const reqId = req.params.id;
	// try {
	if (req.isAuthenticated()) {
		
		// if (!req.user._id.equals(req.session.user._id)) {
		// 	Comment.findOneAndUpdate({ "createdBy": req.session.user._id }, {
		// 		createdBy: req.user._id
		// 	}, (err, comment) => {
		// 		if (err) {
		// 			console.log(err)
		// 		}
		// 	});
		// }
		
		Entry.findById(reqId)
			.populate({ "path": "createdBy", "strictPopulate": false })
			.populate({
				"path": "entryComments",
				"strictPopulate": false,
				"populate": {
					path: "createdBy"
				}
			})
			.exec((err, entry, stuff) => {
				if (err) {
					console.log(err)
				} 
				if (entry) {

					// SUCCESS
					if (entry.createdBy.equals(req.user._id)) {
                  res.render("entry", {
                     pageTitle: "Entry",
                     loggedInUser: req.user,
                     currentRoute: req.originalUrl.slice(1),
                     userSignInLogout: renderLoginLogoutButton(req),
                     postId: reqId,
                     entry: entry,
							displayFullEntry: true,
                     messages: req.flash(),
                  });
               } else {
                  res.render("entry", {
                     pageTitle: "Entry",
                     loggedInUser: req.user,
                     currentRoute: req.originalUrl.slice(1),
                     userSignInLogout: renderLoginLogoutButton(req),
                     postId: reqId,
                     entry: entry,
                     displayFullEntry: true,
                     messages: req.flash(),
                  });
               }
				} else {

               // 404 ERROR
               res.statusCode = 404;
               res.statusMessage =
                  "This page may have been deleted, or it may have been moved somewhere else...or it never existed in the first place!";
               res.render("http-response-status-codes", {
                  loggedInUser: req.user,
                  userSignInLogout: renderLoginLogoutButton(req),
                  message: {
                     statusCode: res.statusCode,
                     statusMessage: res.statusMessage,
                  },
               });
            }
			});
	} else {

		Entry.findById(reqId)
			.populate({ "path": "createdBy", "strictPopulate": false })
			.populate({
				"path": "entryComments",
				"strictPopulate": false,
				"populate": {
					path: "createdBy"
				}
			})
			.exec((err, entry) => {
				if (err) {
					console.log(err)
				} 
				if (entry) {

					// SUCCESS
					res.render("entry", {
                  pageTitle: "Entry",
                  userSignInLogout: renderLoginLogoutButton(req),
                  postId: reqId,
                  entry: entry,
						displayFullEntry: true,
                  messages: req.flash(),
               });
				} else {
					
               // 404 ERROR
               res.statusCode = 404;
               res.statusMessage =
                  "This page may have been deleted or it may have been moved somewhere else.";
               res.render("http-response-status-codes", {
                  userSignInLogout: renderLoginLogoutButton(req),
                  message: {
                     statusCode: res.statusCode,
                     statusMessage: res.statusMessage,
                  },
               });
            }
			});
	}
	// const aggResults = Entry.aggregate([{
	// 		$lookup: {
	// 			from: "users",
	// 			localField: "_id",
	// 			foreignField: "_id",
	// 			as: "createdBy",
	// 		}
	// 	},
	// 	{
	// 		$unwind: {
	// 			path: "$entryComments",
	// 			preserveNullAndEmptyArrays: true
	// 		}
	// 	},
	// 	{ $sort: { "entryComments.createdAt": -1 } },
	// 	{ $match: { _id: mongoose.Types.ObjectId(reqId) } },
	// 	{
	// 		$project: {
	// 			_id: "$_id",
	// 			createdBy: "$createdBy",
	// 			entryTitle: "$entryTitle",
	// 			entryContent: "$entryContent",
	// 			entryDate: "$entryDate",
	// 			entryComments: "$entryComments",
	// 		}
	// 	},

	// {
	// 	$group: {
	// 		_id: "$_id",
	// 		createdBy: { "$first": "$createdBy" },
	// 		entryTitle: { "$first": "$entryTitle" },
	// 		entryContent: { "$first": "$entryContent" },
	// 		entryDate: { "$first": "$entryDate" },
	// 		entryComments: { "$push": "$entryComments" }
	// 	}
	// },

	// ], (err) => {
	// 	if (err) {
	// 		console.log(err);
	// 	}
	// });

	// const results = await aggResults.exec();
	// const aggEntry = results[0];
	// console.log(aggEntry)


	// 
	// 	} catch (err) {
	// 		res.send(err);
	// 	}
});

app.get("/contact", (req, res) => {

	res.render("contact", {
		userSignInLogout: renderLoginLogoutButton(req),
		contact: startContent.contactContent
	});
});

// Compose New Entry Page
app.get("/compose", (req, res) => {

	// SUCCESS
	res.render("compose", {
      loggedInUser: req.user,
      currentRoute: req.originalUrl.slice(1),
      route: "/create-entry",
      pageTitle: "Compose",
      userSignInLogout: renderLoginLogoutButton(req),
      submitButton: "Create Entry",
		messages: req.flash()
   });
});

app.get("/compose/:id", (req, res) => {
	const entryId = req.params.id;

	if (req.isAuthenticated()) {

		Entry.findById(entryId, (err, entry) => {
         if (err) {
            console.log(err);
         }

         if (entry) {

				if (entry.createdBy.equals(req.user._id)) {

					// SUCCESS
					res.render("compose", {
                  loggedInUser: req.user,
                  route: "/edit",
                  pageTitle: "Compose",
                  userSignInLogout: renderLoginLogoutButton(req),
                  id: entryId,
                  entry: entry,
                  submitButton: "Update",
                  messages: req.flash(),
               });
            } else {

               // If user tries to edit an entry which is not theirs!
               req.flash(
                  "error",
                  "You cannot edit this entry because it's not yours. Nice try :)"
               );
               res.redirect(`/entry/${entryId}`);
            }
         } else {

            // 404 ERROR
            res.statusCode = 404;
            res.statusMessage =
               "This page may have been deleted or it may have been moved somewhere else.";
            res.render("http-response-status-codes", {
               loggedInUser: req.user,
               userSignInLogout: renderLoginLogoutButton(req),
               message: {
                  statusCode: res.statusCode,
                  statusMessage: res.statusMessage,
               },
            });
         }
      });

	} else {

      // If a person who is not logged in tries to edit a post
      req.flash(
         "error",
         "You cannot edit posts until you are logged in."
      );
      res.redirect(`/sign-in`);
   }
	
});


// ------------ Post Routes ------------ //

// Entries
app.post("/create-entry", (req, res, next) => {
	const postTitle = req.body.postTitle;
	const postContent = req.body.postArea;
	
	console.log(req.user);
	if (req.user) {
		if (req.isAuthenticated()) {

			// New journalEntry
			const item = new Entry({
				createdBy: req.user,
				entryTitle: postTitle,
				entryContent: postContent,
			});
			item.save((err) => {
				if (err) {

					// Map over each error type and flash the `message` prop
               Object.entries(err.errors).map(([key, val]) => {
                  req.flash("error", val.properties.message);
               });
               // Send flash error(s) to `/compose` route
               res.redirect("/compose");
               return;
            } else {

					// SUCCESS
					res.redirect("/entry/#" + _.kebabCase(item.entryTitle));
				}
			});
		}
	} else {

		// Create anonymous user but DON'T SAVE YET just in case there's an entry validation error
		const anonUser = new User({
			username: generate.meaningful(genOptions),
			anonymous: true
		});

		const anonymousItem = new Entry({
         createdBy: anonUser,
         entryTitle: postTitle,
         entryContent: postContent,
      });
      anonymousItem.save((err) => {
         if (err) {
            console.log(err);

            // Map over each error type and flash the `message` prop
            Object.entries(err.errors).map(([key, val]) => {
               req.flash("error", val.properties.message);
            });
            // Send flash error(s) to `/compose` route
            res.redirect("/compose");
            return;
				
         } else {

            // Save anonUser to DB after entry validates successfully
            anonUser.save();

            // Login anonUser
            req.login(anonUser, (err) => {
               if (err) {
                  console.log(err);

                  // Send flash error(s) to `/compose` route
                  req.flash(
                     "error",
                     "There was an issue creating your anonymous account. Please try again momentarily."
                  );
                  res.redirect("/compose");

                  return next(err);
               } else {

						// SUCCESS
						res.redirect("/entry/#" + _.kebabCase(anonymousItem.entryTitle));
                  // req.session.user = req.user;

                  // const id = new mongoose.Types.ObjectId();

                  // req.session.save((err) => {
                  // 	if (err) {
                  // 		return next(err);
                  // 	} else {
                  // 		res.redirect("/entry/#" + _.kebabCase(anonymousItem.entryTitle));
                  // 	}
                  // });
               }
            });
         }
      });
	}
});

app.post("/edit", (req, res) => {
	const entryId = req.body.editEntry;
	const title = req.body.postTitle;
	const content = req.body.postArea;

	if (req.isAuthenticated()) {
		const writtenBy = req.user.username;

		Entry.findOneAndUpdate({ $and: [{ _id: entryId }, { createdBy: req.user }] }, {
			createdBy: req.user,
			entryTitle: title,
			entryContent: content,
			updatedAt: new Date().toISOString()
		}, { runValidators: true }, (err, entry) => {
			if (err) {
            console.log(err);

            // Map over each error type and flash the `message` prop
            Object.entries(err.errors).map(([key, val]) => {
               req.flash("error", val.properties.message);
            });
            // Send flash error(s) to `/compose/:id` route
            res.redirect(`/compose/${entryId}`);
            return;
         } 
			
			if (!entry) {

				// If user tries to edit an entry which is not theirs HAHA!
				req.flash("error", "Cannot edit an entry which is not yours. Nice try :)");
				res.redirect(`/entry/${entryId}`);
			} else {

				// SUCCESS
				res.redirect(`/entry/${entryId}`);
			}
		});

		// 		User.findOne({
		// 			username: req.user.username
		// 		}, (err, userFound) => {
		// 			if (err) {
		// 				console.log(err)
		// 			} else {
		// 				console.log(userFound.entries)
		// 				// userFound.entries.forEach((entry) => {
		// 				// 	if (entry.id === entryId) {
		// 
		// 				// } else {
		// 				// res.send("Cannot edit an entry which is not yours.")
		// 				// }
		// 				// });
		// 			}
		// 		});
	} else {

      // Send flash error(s) to `/` route
		req.flash("error", "You must be logged in to edit a post.")
      res.redirect("/sign-in");
		return;
   }
});

app.post("/delete", (req, res) => {
	const entryId = mongoose.Types.ObjectId(req.body.deleteEntry);

	if (req.isAuthenticated()) {
		Entry.findById(entryId, (err, entry) => {
			if (err) {
				console.log(err)
			} else {
				if ((entry.createdBy.equals(req.user._id))) {
					Entry.findByIdAndDelete(entryId, (err, deletedEntry) => {
						if (err) {
							console.log(err);
						} else {
							res.redirect("/entry");
						}
					});
				} else {

               // If user tries to delete an entry which is not theirs HAHA!
               req.flash(
                  "error",
                  "Cannot delete an entry which is not yours. Nice try :)"
               );
               res.redirect(`/entry/${entryId}`);
            }
			}
		})
	}
});

// Comments
app.post("/add-comment", (req, res) => {
	const entryId = req.body.entryId;
	const comment = req.body.commentBody;

	if (req.isAuthenticated()) {
		
		// New entryComment
		const commentItem = new Comment({
			createdBy: req.user,
			commentContent: comment,
		});

		Entry.findById(entryId, {}, (err, foundEntry) => {
			if (err) {
				console.log(err);
			} else {
				foundEntry.entryComments.push(commentItem)
				foundEntry.save();
				commentItem.save((err, comment) => {
					if (err) {
						console.log(err)
					} else {
						res.redirect("/entry/" + entryId + "#" + commentItem._id);
					}
				});
			}
		});
	} else {

		// Generate new anonymous user if commenting without an account
		const anonUser = new User({
			username: generate.meaningful(genOptions),
			anonymous: true
		});

		req.login(anonUser, (err) => {
			if (err) {
				console.log(err)
			} else {
				// passport.authenticate(["local", "anonymous"])(req, res, () => {

				anonUser.save();
				req.session.user = req.user;
				req.session.save((err) => {
					if (err) return next(err)
				});

				console.log("BEFORE RELOAD >")
				console.log(req.user);

				const anonymousCommentItem = new Comment({
					createdBy: req.user,
					commentContent: comment,
				});

				Entry.findById(entryId, {}, (err, foundEntry) => {
					console.log(req.user)
					if (err) {
						console.log(err);
					} else {
						foundEntry.entryComments.push(anonymousCommentItem);
						foundEntry.save();
						anonymousCommentItem.save((err, comment) => {
							if (err) {
								console.log(err)
							} else {
								console.log("comment created by >")
								console.log(comment.createdBy)
								res.redirect("/entry/" + entryId + "#" + anonymousCommentItem._id);
							}
						});
					}
				});
			}

		});
	}
});

app.post("/edit-comment", (req, res) => {
	const entryId = req.body.entryId;
	const commentId = mongoose.Types.ObjectId(req.body.commentId);
	const comment = req.body.commentBody;

	if (req.isAuthenticated()) {

		Comment.findById(commentId, (err, foundComment) => {
			if (err) {
				console.log(err);
			} else {
				if (foundComment.createdBy.equals(req.user._id)) {
					Comment.findByIdAndUpdate(commentId, {
						commentContent: comment,
						updatedAt: new Date().toISOString()
					}, (err, updatedComment) => {
						if (err) {
							console.log(err)
						} else {
							res.redirect("/entry/" + entryId + "#" + commentId);
						}
					});
				} else {

               // If user tries to edit a comment which is not theirs HAHA!
               req.flash(
                  "error",
                  "You cannot edit this comment because it's not yours. Nice try :)"
               );
               res.redirect(`/entry/${entryId}#${commentId}`);
            }
			}
		});
	} else {
      
		// If user tries to edit a comment which is not theirs HAHA!
      req.flash(
         "error",
         "You cannot edit this comment because it's not yours. Nice try :)"
      );
      res.redirect(`/entry/${entryId}#${commentId}`);
   }
});

app.post("/delete-comment", (req, res) => {
	const commentId = mongoose.Types.ObjectId(req.body.commentId);
	const entryId = req.body.entryId;

	if (req.isAuthenticated()) {

		Comment.findById(commentId, (err, foundComment) => {
			if (err) {
				console.log(err)
			} else {
				if (foundComment.createdBy.equals(req.user._id)) {
					Comment.findByIdAndDelete(commentId, (err, deletedComment) => {
						if (err) {
							console.log(err)
						} else {
							res.redirect("/entry/" + entryId);
						}
					});
				} else {

               // If user tries to delete a comment which is not theirs HAHA!
               req.flash(
                  "error",
                  "You cannot delete this comment because it's not yours. Nice try :)"
               );
               res.redirect(`/entry/${entryId}#${commentId}`);
            }
			}
		});
	} else {

      // If user tries to delete a comment without logging in HAHA!
      req.flash(
         "error",
         "You cannot delete a comment without logging in. Nice try :)"
      );
      res.redirect(`/entry/${entryId}#${commentId}`);
   }
});

// Exporting app
module.exports = app