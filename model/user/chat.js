const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({

  sender_id: {
    type: mongoose.Types.ObjectId,
    ref: "userCredential",
  },

  receiver_id: {
    type: mongoose.Types.ObjectId,
    ref: "userCredential",
  },

  message: {
    type: String,
    required: true,
  },

}, { timestamps: true });


module.exports = mongoose.model('Chat', ChatSchema);
