const mongoose = require('mongoose');

const UserSchema =  mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be 6 characters or longer']
    },

    email: {
        type: String,
        trim: true,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      },

    city:String,
    
    phone: {
        type: String,
        trim: true,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },  
    isProfilecomplete:{
        type:Boolean,
        default:false
    },
    gender: {
        type: String,
    },
    photo:{
        type:String,
        default:"default.jpg"
    },
    status: {
        type: String,
        default: 'active'
    },
    is_online: {
        type: Boolean,
        default: false,
    },
    isOtpVerified: {
        type:Boolean,
        default:false
    }, 
    otp: {
        type: String,
        trim: true
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);







