const mongoose = require('mongoose');
const User = require(__dirname + "/user.js");

const entryCommentSchema = new mongoose.Schema({
	createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
	},
	commentContent: {
		type: String,
		required: [true]
	},
});

module.exports = mongoose.model("Comment", entryCommentSchema);