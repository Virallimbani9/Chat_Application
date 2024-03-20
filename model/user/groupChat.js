const mongoose = require("mongoose");

const GroupChatSchema = mongoose.Schema({

  sender_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  group_id: {
    type: mongoose.Types.ObjectId,
    ref: "Group",
  },

  message: {
    type: String,
    required: true,
  },

}, { timestamps: true });


module.exports = mongoose.model('GroupChat', GroupChatSchema);
