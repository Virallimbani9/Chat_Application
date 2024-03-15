const mongoose = require("mongoose");

const GroupSchema = mongoose.Schema({


  creator_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: "default.jpg",
    required: true,
  },
  limit:{
    type:Number,
    required:true
  }
}, { timestamps: true });


module.exports = mongoose.model('Group', GroupSchema);
