const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Comment = require(__dirname + "/comment.js");
const Entry = require(__dirname + "/entry.js");

const User = new mongoose.Schema({
   username: {
      type: String,
      required: true,
   },
   password: {
      type: String,
   },
   anonymous: {
      type: Boolean,
      required: true,
   },
   accountCreationDate: {
      type: Date,
      default: Date.now
   },
   // entries: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Entry" }],
   // comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }]
});

User.virtual('entries', {
   ref: 'Entry',
   localField: '_id', 
   foreignField: 'createdBy',
   count: true
});

User.virtual('comments', {
   ref: 'Comment',
   localField: '_id', 
   foreignField: 'createdBy',
   count: true
});

User.set('toObject', { virtuals: true }, { getters: true });
User.set('toJSON', { virtuals: true }, { getters: true });

// Passport for user
User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);