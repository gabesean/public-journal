const mongoose = require('mongoose');
const User = require(__dirname + "/user.js");
const Comment = require(__dirname + "/entry.js");

const journalEntrySchema = new mongoose.Schema({
   createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
   },
   entryTitle: {
      type: String,
      required: [true, "You cannot submit an entry with an empty title."],
      maxlength: [
         82,
         "Your title is too long. It must be under 82 characters.",
      ],
   },
   entryContent: {
      type: String,
      required: [true, "You cannot submit an entry with no content."],
      minlength: [
         2,
         "Your content is too short. It must be at least 2 characters."
      ]
   },
   entryComments: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
});

// SETTING ENTRY EXPIRY TO SIX HOURS
journalEntrySchema.index({ "createdAt": 1 }, { expireAfterSeconds: 21600 });

module.exports = mongoose.model("Entry", journalEntrySchema);