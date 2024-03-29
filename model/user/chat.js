const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({

  sender_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  receiver_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  message: {
    type: String,
    required: true,
  },

}, { timestamps: true });


module.exports = mongoose.model('Chat', ChatSchema);
