const mongoose = require("mongoose");

const MemberSchema = mongoose.Schema({

    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    group_id: {
        type: mongoose.Types.ObjectId,
        ref: "Group",
    },
}, { timestamps: true });


module.exports = mongoose.model('Member', MemberSchema);
