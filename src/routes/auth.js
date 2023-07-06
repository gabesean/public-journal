const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const OidcStrategy = require('passport-openidconnect').Strategy;
const DummyStrategy = require('@voxpelli/passport-dummy').Strategy;
const AnonymousStrategy = require('passport-anonymous').Strategy;

// MODELS
const User = require(__dirname + "/../models/user.js");
const Comment = require(__dirname + "/../models/comment.js");
const Entry = require(__dirname + "/../models/entry.js");

// Modules
const { renderLoginLogoutButton, verifyPassForm, changeUsernameForm, changePasswordForm } = require(__dirname + "/../modules/htmlRenderers.js");

// Create User & Anonymous Strategy for Passport
passport.use(User.createStrategy());

passport.use(
	new DummyStrategy((done) => {
		return done(null, { username: 'Anonymous' });
	}
));
passport.use(new AnonymousStrategy());
passport.use(new LocalStrategy(User.authenticate()));
// passport.use(
// 	new LocalStrategy((username, password, done) => {
// 		User.findOne({ username: username }, (err, user) => {
// 			if (err) {
// 				return done(err);
// 			}
// 			if (!user) {
// 				return done(null, false);
// 			}
// 			if (!user.verifyPassword(password)) {
// 				return done(null, false);
// 			}
// 			return done(null, user);
// 		});
// 	})
// );


// Configure Session Management
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// SimpleLogin Integration (BROKEN ATM)
/*
passport.use('SimpleLogin', new OidcStrategy({
	// SimpleLogin OIDC Settings
	issuer: 'https://app.simplelogin.io',
	authorizationURL: 'https://app.simplelogin.io/oauth2/authorize',
	tokenURL: 'https://app.simplelogin.io/oauth2/token',
	userInfoURL: 'https://app.simplelogin.io/oauth2/userinfo',
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	// you might need to change the callbackURL when deploying on production
	callbackURL: 'http://localhost:3000/continue-with-simplelogin/callback',
	// openid needs to be in scope
	scope: 'openid',
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
	return done(null, profile);
}));
// redirect user to authorization page
app.use('/continue-with-simplelogin', passport.authenticate('SimpleLogin'));
// user is redirected back with the *code*
app.use('/continue-with-simplelogin/callback',
	passport.authenticate('SimpleLogin', {
		failureRedirect: '/error'
	}), (req, res) => {
		console.log("hello world")
		var user = req.user._json
		res.send(`
    		Welcome ${user.name}! <br>
    		Your email: ${user.email} <br>
    		Avatar: <img src="${user.avatar_url}">
    	`)
	}
);
*/


// Globals
let loginButton;

const router = express.Router();


// Account Routes
router.route("/enter")
	.get((req, res) => {

		res.render("sign-up", {
			userSignInLogout: renderLoginLogoutButton(req),
			newUser: req.body.username,
		});
	})
	.post((req, res) => {

		User.findOne({
			username: req.body.username
		}, (err, userFound) => {
			if (err) {
				console.log(err)
			} else {
				if (userFound) {
					res.render("sign-in", {
						userSignInLogout: renderLoginLogoutButton(req),
						foundUser: userFound.username,
					});
				} else {
					res.render("sign-up", {
						userSignInLogout: renderLoginLogoutButton(req),
						newUser: req.body.username,
					});
				}
			}
		});
	});

router.route("/sign-up")
	.get((req, res) => {
		if (req.isAuthenticated()) {

			// Maybe the user winded up here by accident but if they really want to sign-up again they need to logout
			res.redirect("/profile");

		} else {
			res.render("sign-up", {
				userSignInLogout: renderLoginLogoutButton(req),
				newUser: req.body.username,
			})
		}
		
	})
	.post((req, res) => {
		
		// Initiate variable for `anonymousUserId` if anonymous user decides to create an account
		// We need to change ownership of all the items created under the anonymous account!
		let anonymousUserId;
		
		if (req.isAuthenticated()) {
			if (req.user.anonymous === true) {
				
				anonymousUserId = req.user._id;
				
				const user = new User({
					username: req.body.username,
					password: req.body.password,
					anonymous: false
				});

			} else {
				res.send("You must be logged out to do this.");
			}
		} else {
			const user = new User({
				username: req.body.username,
				password: req.body.password,
				anonymous: false
			});
		}

		// User.findOne({
		// 	username: req.body.username
		// }, (err, userFound) => {
		// 	if (err) {
		// 		console.log(err)
		// 	} else {
		// 		if (userFound) {
		// 			const userAlreadyExists = "<p class='username-taken help is-danger'>This username has been taken. Please choose a different one.</p>"

		// 			res.render("sign-up", {
		// 				userSignInLogout: renderLoginLogoutButton(req),
		// 				newUser: req.body.username,
		// 				userExists: userAlreadyExists
		// 			})
		// 		} else {

					User.register({ anonymous: false, username: req.body.username }, req.body.password, (err, registeredUser) => {
						if (err) {
							console.log(err);
							
							const userAlreadyExists = "<p class='username-taken help is-danger'>This username has been taken. Please choose a different one.</p>"

							res.render("sign-up", {
								userSignInLogout: renderLoginLogoutButton(req),
								newUser: req.body.username,
								userExists: userAlreadyExists
							})

						} else {
							console.log('User.register', registeredUser)
							// passport.authenticate("local", (err, user, info) => {
							// !FIX THIS DOWN HERE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							console.log('ANONYMOUS USER ID', anonymousUserId)
							
								// Entry.updateMany({ createdBy: { _id: anonymousUserId } }, {
								// 	createdBy: { _id: req.user._id }
								// }, (err, updatedEntries) => {
								// 	if (err) {
								// 		console.log(err)
								// 	} else {
								// 		updatedEntries
								// 	}
								// });

								// Comment.updateMany({ createdBy: { _id: anonymousUserId } }, {
								// 	createdBy: { _id: req.user._id }
								// }, (err, updatedEntries) => {
								// 	if (err) {
								// 		console.log(err)
								// 	}
								// });

								// renderLoginLogoutButton(req);
								// User.findOneAndDelete({ _id: anonymousUserId }, (err, deletedUser) => {
								// 	if (err) {
								// 		console.log(err);
								// 	}
								// });

								req.session.user = req.user;
								req.session.save((err) => {
									if (err) {
										console.log(err)
										return next(err)
									}
								});

								req.login(registeredUser, (err) => {
                           if (err) {
                              return next(err);
                           }
									
									// SUCCESS
									// Redirect to `/profile` but flash a modal for onboarding/introduction
									res.redirect("/profile");
									
                        });
								
								
							// });
						}
					});

		// 		}
		// 	}
		// });

	});

router.route("/sign-in")
	.get((req, res) => {
		if (req.isAuthenticated()) {
			res.redirect("profile");
		} else {
			res.render("sign-in", {
				loggedInUser: req.user,
				userSignInLogout: renderLoginLogoutButton(req),
				messages: req.flash()
			})
		}
	})
	.post((req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) return next(err);
			if (info && info.name === "IncorrectPasswordError") {

            // Send flash error to `/sign-in` route
				req.flash("error", "Username or password is incorrect.");

				req.session.save((err) => {
					if (err) return next(err)

					res.redirect("/sign-in");
				})
         }
			if (user) {
				req.login(user, (err) => {
					if (err) {
						// Send flash error to `/sign-in` route
						req.flash("error", "There was an error logging you in. Please try again momentarily.");

						req.session.save((err) => {
							if (err) return next(err)
		
							res.redirect("/sign-in");
						})
					} else {

						// SUCCESS
						req.flash("info", "You've signed in successfully.");

						req.session.user = req.user;
						req.session.save((err) => {
							if (err) return next(err);

							res.redirect("/");
						});
					}
				})
			} else {

            // Send flash error to `/sign-in` route
				req.flash("error", "Username or password is incorrect.");

				req.session.save((err) => {
					if (err) return next(err)

					res.redirect("/sign-in");
				})
         }
		})(req, res, next);
	});

router.route("/logout")
	.get((req, res) => {
		req.logout((err) => {
			if (err) {
				res.send(err);
			} else {
				res.redirect("/");
			}
		});
	})
	.post((req, res) => {
		req.logout((err) => {
			if (err) {
				res.send(err);
			} else {
				res.redirect("/");
			}
		});

	});

router.route("/delete-account")
   .get((req, res) => {
		res.redirect("/settings")
	})
   .post((req, res, next) => {

		if (req.user.anonymous) {

         // If User is anonymous
         const username = req.body.username;

         if (req.isAuthenticated()) {
            if (username === req.user.username) {
               Entry.deleteMany({ createdBy: { _id: req.user._id } }, (err) => {
                  if (err) {
                     console.log(err);
                  } else {
                     Comment.deleteMany(
                        { createdBy: { _id: req.user._id } },
                        (err) => {
                           if (err) {
                              console.log(err);
                           } else {
                              User.deleteOne({ _id: req.user._id }, (err) => {
                                 if (err) {
                                    console.log(err);
                                 } else {

												// SUCCESS
												req.flash("info", "Your account and all of its data has been successfully deleted!");

												req.session.save((err) => {
													if (err) return next(err)
								
													res.redirect("/");
												})
                                 }
                              });
                           }
                        }
                     );
                  }
               });
            } else {

					// Send flash error to `/settings` route
					req.flash("error", "Username is incorrect.");

					req.session.save((err) => {
						if (err) return next(err)
	
						res.redirect("/settings#delete-my-data");
					})
            }
         } else {

				// Send flash error to `/` route
				req.flash("error", "You must be logged in to delete an account!");

				req.session.save((err) => {
					if (err) return next(err)

					res.redirect("/");
				})
         }
      } else {
			passport.authenticate("local", (err, user, info) => {
            if (err) {
					console.log(err);
               return next(err);
            }
            if (info && info.name === "IncorrectPasswordError") {

               // Send flash error to `/settings` route
					req.flash("error", "Password is incorrect.");

					req.session.save((err) => {
						if (err) return next(err)
	
						res.redirect("/settings#delete-my-data");
					})
            }

            Entry.deleteMany({ createdBy: { _id: req.user._id } }, (err) => {
               if (err) {
                  console.log(err);
               } else {
                  Comment.deleteMany(
                     { createdBy: { _id: req.user._id } },
                     (err) => {
                        if (err) {
                           console.log(err);
                        } else {
                           User.deleteOne({ _id: req.user._id }, (err) => {
                              if (err) {
                                 console.log(err);
                              } else {

											// SUCCESS
											// Send flash info message to homepage of user account having successfully been deleted
											req.flash("info", "Your account and all of its data has been successfully deleted!");

											req.session.save((err) => {
												if (err) return next(err)
							
												res.redirect("/");
											})
                              }
                           });
                        }
                     }
                  );
               }
            });
				
            // Continue to invoke the function `passport.authenticate()` returns to follow through with the response
         })(req, res, next);
		}
		
   });

// Current user profile
router.route("/profile")
	.get((req, res) => {
		
		if (req.isAuthenticated()) {
			const sortQuery = req.query.sort;
			let sortDirections;

			console.log(req.session)

			if (sortQuery === "oldest") {
				sortDirections = { 'createdAt': 1 };
			} else {
				sortDirections = { 'createdAt': -1 };
			}
			
			Entry.find({ createdBy: req.user._id })
				.sort(sortDirections)
				.exec((err, entries) => {
					
				if (err) {
					console.log(err)
				} else {

					Comment.find({}, (err, comments) => {
                  
                  res.render("profile", {
                     currentRoute: req.originalUrl.slice(1),
                     pageTitle: "My Journal",
                     loggedInUser: req.user,
                     userSignInLogout: renderLoginLogoutButton(req),
                     entry: entries,
                     commentsLength: comments.length,
                  });
               });
				}
			});
		} else {
			res.redirect("/sign-in");
		}
	})

// Public user profiles
router.route("/profile/:username/")
	.get((req, res) => {

	})

router.route("/settings")
	.get((req, res) => {
		if (req.isAuthenticated()) {

			res.render("settings", {
				pageTitle: "Settings",
				userSignInLogout: renderLoginLogoutButton(req),
				loggedInUser: req.user,
				verifyPassword: verifyPassForm,
				messages: req.flash()
			});
		} else {
			res.redirect("/sign-in");
		}
	})

router.route("/verify-password")
	.get((req, res) => {
		res.redirect("/settings");
	})
	.post((req, res, next) => {
		if (req.isAuthenticated()) {

			passport.authenticate("local", (err, user, info) => {
            if (err) {
					console.log(err);
               return next(err);
            }
            if (info && info.name === "IncorrectPasswordError") {

					// Send flash error to `/settings` route
					req.flash("error", "Password is incorrect.");

					req.session.save((err) => {
						if (err) return next(err)
	
						res.redirect("/settings#account-management");
					})
            }

            if (req.body.reason === "changeUsername") {
					res.render("settings", {
						pageTitle: "Settings",
						userSignInLogout: renderLoginLogoutButton(req),
						loggedInUser: req.user,
						verifyPassword: verifyPassForm("change-username", user),
						changeUsernameForm: {
							isActive: "is-active",
						},
					});
				} else if (req.body.reason === "changePassword") {
					res.render("settings", {
						pageTitle: "Settings",
						userSignInLogout: renderLoginLogoutButton(req),
						loggedInUser: req.user,
						verifyPassword: verifyPassForm("change-password", user),
						changePasswordForm: {
							isActive: "is-active",
						},
					});
				} else {
					// Send flash error to `/settings` route
					req.flash("error", "No reason was provided as why you are verifying your password. Please try again.");

					req.session.save((err) => {
						if (err) return next(err)
	
						res.redirect("/settings");
					})
				}
				
            // Continue to invoke the function `passport.authenticate()` returns to follow through with the response
         })(req, res, next);

		} else {

			// Send flash error message to homepage since you're not logged in
			req.flash("error", "Oops. You must be logged in to do that.");

			req.session.save((err) => {
				if (err) return next(err)

				res.redirect("/");
			})
		}
	});

router.route("/change-username")
	.get((req, res) => {
		res.redirect("/settings");
	})
	.post((req, res) => {
		if (req.isAuthenticated()) {

			

			res.render("settings", {
				pageTitle: "Settings",
				userSignInLogout: renderLoginLogoutButton(req),
				loggedInUser: req.user,
				changeUsernameForm: {
					content: changeUsernameForm(""),
					isActive: "is-active",
				},
				changePasswordForm: {
					content: changePasswordForm(""),
				},
			});


		} else {
			res.send("Oops. You must be logged in to do that.");
		}
	});

router.route("/change-password")
	.get((req, res) => {
		res.redirect("/settings");
	})
	.post((req, res) => {
		if (req.isAuthenticated()) {

			res.render("settings", {
				pageTitle: "Settings",
				userSignInLogout: renderLoginLogoutButton(req),
				loggedInUser: req.user,
				changeUsernameForm: {
					content: changeUsernameForm(""),
				},
				changePasswordForm: {
					content: changePasswordForm(""),
					isActive: "is-active",
				},
			});

		} else {
			res.send("Oops. You must be logged in to do that.");
		}
	});

router.route("/new-password")
	.get((req, res) => {
		if (req.isAuthenticated()) {
			res.redirect("/settings");
		} else {
			res.redirect("/sign-in");
		}
	})
	.post((req, res) => {
		if (req.isAuthenticated()) {
			User.findOne({ _id: req.user._id }, (err, user) => {
				if (err) {
					console.log(err);
					res.send("There was an error verifying your request");
				} else {
					user.changePassword(req.body.oldPassword, req.body.newPassword, (err) => {
						if (err) {
							if (err.name === "IncorrectPasswordError") {
								res.render("settings", {
									errorNotification: "<div class='notification notification-nocache'>" + "Incorrect password. Please try again." + "<button class='delete delete-nocache'></button></div>",
									userSignInLogout: renderLoginLogoutButton(req),
									loggedInUser: req.user,
								});
							}
						} else {
							res.render("settings", {
								errorNotification: "<div class='notification notification-nocache'>" + "Successfully changed your password." + "<button class='delete delete-nocache'></button></div>",
								userSignInLogout: renderLoginLogoutButton(req),
								loggedInUser: req.user,
							});
						}
					});

				}
			});

		} else {
			res.send("Oops. You must be logged in to do that.");
		}

	});

router.route("/new-username")
	.get((req, res) => {
		if (req.isAuthenticated()) {
			res.redirect("/settings");
		} else {
			res.redirect("/sign-in");
		}
	})
	.post((req, res) => {
		if (req.isAuthenticated()) {
			User.findOne({
				username: req.body.username
			}, (err, userFound) => {
				if (err) {
					console.log(err)
				} else {
					if (userFound) {
						const err = `<p class='username-taken help is-danger'>This username has been taken. Please choose a different one.</p>`;

						res.render("settings", {
							pageTitle: "Settings",
							userSignInLogout: renderLoginLogoutButton(req),
							loggedInUser: req.user,
							changeUsernameForm: {
								content: changeUsernameForm(err),
								isActive: "is-active",
							},
							changePasswordForm: {
								content: changePasswordForm(""),
							},
						});
					} else {
						User.findOneAndUpdate({ _id: req.user._id }, { username: req.body.username }, (err, user) => {
							if (err) {
								console.log(err);
								res.send("There was an error verifying your request");
							} else if (user) {
								User.findByUsername(req.body.username, (err, updatedUser) => {
									req.login(updatedUser, (err) => {
										if (err) {
											res.send("There was an issue logging in. Please try again.");
										} else {
											req.session.user = req.user;
											req.session.save((err) => {
												if (err) return next(err)
											});
											res.render("settings", {
												pageTitle: "Settings",
												errorNotification: "<div class='notification notification-nocache'>" + "Successfully changed your username." + "<button class='delete delete-nocache'></button></div>",
												userSignInLogout: renderLoginLogoutButton(req),
												loggedInUser: req.user,
											});
										}
									});
								});
							}
						});

					}
				}
			});


		} else {
			res.send("Oops. You must be logged in to do that.");
		}

	});



module.exports = router;