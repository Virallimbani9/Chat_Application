const User = require('../../model/user/user');
const Chat = require('../../model/user/chat');
const Group = require('../../model/user/group');
const Member = require('../../model/user/member');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require("../../utils/mail");
const fs = require("fs");
const path = require("path");
const { group } = require('console');
const { ObjectId } = require('mongoose').Types;

// -------------------------- SIGN --------------------------
const getSignUp = (req, res) => {
  try {
    res.render('pages/user/pages-signup');
  } catch (error) {
    console.error('Error rendering signup page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/signup');
  }
};

const signUp = async (req, res) => {
  const { name, password, email, city, phone, gender } = req.body;

  try {
  
    if (!name || !password || !email || !city || !phone) {
      req.flash('error', 'Please fill all the required fields');
      return res.redirect('/user/signup');
    }

    if (password.length <= 6) {
      req.flash('error', 'Password must be at least 6 characters long');
      return res.redirect('/user/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already in use. Please use a different email.');
      return res.redirect('/user/signup');
    }

    const newUser = new User({ name, password: hashedPassword, email, phone, city, gender });
    await newUser.save();

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error in signup:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/signup');
  }
};


// -------------------------- LOGIN --------------------------
const getLogIn = (req, res) => {
  try {
    res.render('pages/user/pages-login');
  } catch (error) {
    console.error('Error rendering login page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/login');
  }
};

const logIn = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
      
      res.cookie('user', JSON.stringify(user));
      res.cookie('token', token);

      if (user.isOtpVerified == false) {
        req.flash('info', 'Please verify your OTP.');
        return res.redirect('/user/getsendotp');
      }

      req.flash('success', 'Login successful.');
      return res.redirect('/user/index');

    } else {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/user/login');
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    req.flash('error', 'Error logging in.');
    res.redirect('/user/login');
  }
};
  
const logOut = async (req, res) => {
  try {
  
    res.clearCookie('user');
    res.clearCookie('token');

    req.flash('success', 'Logout successful.');
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error logging out:', error.message);
    req.flash('error', 'Error logging out.');
    res.redirect('/user/login');
  }
};


// -------------------------- OTP --------------------------
const getSendOtp = (req, res) => {
  try {
    res.render('pages/user/sendOtp');
  } catch (error) {
    console.error('Error rendering sendOtp page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/getsendotp');
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/user/login');
    }

    if (user.email !== email) {
      req.flash('error', 'Invalid email.');
      return res.redirect('/user/sendotp');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpToken = jwt.sign({ userId: user._id, otp }, process.env.OTP_SECRET_KEY, { expiresIn: '1m' });

    req.session.otpToken = otpToken;

    const mailOptions = {
      email: user.email,
      subject: 'OTP for Verification',
      message: `Hello ${user.name}, your OTP for verification is ${otp}`,
    };

    await sendMail(mailOptions);

    req.flash('success', 'OTP sent successfully.');
    res.redirect('/user/getverifyotp');
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    req.flash('error', 'Something went wrong while sending OTP.');
    res.redirect('/user/login');
  }
};


const getVerifyOtp = (req, res) => {
  try {
    res.render('pages/user/verifyOtp', { user: req.user });
  } catch (error) {
    console.error('Error rendering verifyOtp page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/verifyotp');
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.session.otpToken;

    if (!token) {
      req.flash('error', 'Session expired. Please resend OTP.');
      return res.redirect('/user/getsendotp');
    }

    const decoded = jwt.verify(token, process.env.OTP_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/user/login');
    }

    if (decoded.otp == otp) {
      await User.findByIdAndUpdate(user._id, { isOtpVerified: true });

      req.flash('success', 'OTP verified successfully.');
      return res.redirect('/user/index');
    } else {
      req.flash('error', 'Invalid OTP.');
      return res.redirect('/user/getverifyotp');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    req.flash('error', 'Internal Server Error.');
    return res.redirect('/user/login');
  }
};


// -------------------------- INDEX --------------------------
const index = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    const data = req.user;

    res.render('pages/user/index', { data, users });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    req.flash('error', 'Internal Server Error.');
    res.redirect('/user/login');
  }
};


// -------------------------- PROFILE --------------------------
const profile = async (req, res) => {
  try {
    const data = req.user;
    res.render('pages/user/profile', { data });
  } catch (error) {
    console.error('Error rendering profile page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/index');
  }
};


// -------------------------- PROFILE UPDATE --------------------------
const getUpdaetProfile = async (req, res) => {
  res.render('pages/user/updateprofile',{data:req.user})
}

const updatedProfile = async (req, res) => {
  const { name, email, city, phone } = req.body;
  try {
    const orgPath = path.join(__dirname, '../../public/assets/upload');
    const photoLoc1 = req.photoLoc ? `${orgPath}/${req.photoLoc}` : null;
    const exists = photoLoc1 ? fs.existsSync(photoLoc1) : false;

    const updatedUserData = {
      name,
      email,
      phone,
      city,
      isProfilecomplete: true
    };

    if (req.file) {
      updatedUserData.photo = req.file.filename;

      if (exists) {
        fs.unlinkSync(photoLoc1);
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updatedUserData, { new: true });
    await user.save();

    req.flash('success', 'Profile updated successfully.');
    res.redirect('/user/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'Error updating profile.');
    res.redirect('/user/updateprofile');
  }
};


// -------------------------- CHANGE PASSWORD --------------------------
const getPassword = (req, res) => {
  try {
    res.render('pages/user/changepassword', { data: req.user });
  } catch (error) {
    console.error('Error rendering changepassword page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/index');
  }
};

const changedPassword = async (req, res) => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      req.flash('error', 'Invalid current password.');
      return res.redirect('/user/changepassword');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirm password do not match.');
      return res.redirect('/user/changepassword');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.clearCookie('token');

    req.flash('success', 'Password changed successfully. Please log in with your new password.');
    res.redirect('/user/logout');
  } catch (error) {
    console.error('Error changing password:', error);
    req.flash('error', 'Internal server error.');
    res.redirect('/user/changepassword');
  }
};


// -------------------------- FORGET PASSWORD --------------------------
const getForgetPassword = (req, res) => {
  try {
    res.render('pages/user/forgetpassword');
  } catch (error) {
    console.error('Error rendering forgetpassword page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/login'); 
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Email not found. Please enter a valid email address.');
      return res.redirect('/user/forgetpassword');
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1m' });

    sendMail({
      email: user.email,
      subject: 'Reset Password',
      message: `Hi ${user.name}, Please click on the link below to reset your password. "http://localhost:3000/user/resetpassword/${token}" Reset Password Thanks`,
    });

    req.flash('success', 'Password reset link sent to your email. Please check your inbox.');
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    req.flash('error', 'Internal server error.');
    res.redirect('/user/forgetpassword');
  }
};


// -------------------------- RESET PASSWORD --------------------------
const getResetPassword = (req, res) => {
  try {
    const token = req.params.token;
    res.render('pages/user/resetpassword', { data: token });
  } catch (error) {
    console.error('Error rendering resetpassword page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/forgotpassword');
  }
};

const resetedPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const token = req.params.token;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      req.flash('error', 'Invalid reset password link. Please try again.');
      return res.redirect(`/user/resetpassword/${token}`);
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirm password do not match.');
      return res.redirect(`/user/resetpassword/${token}`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    req.flash('success', 'Password reset successful. Please login with your new password.');
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error resetting password:', error);
    req.flash('error', 'Internal server error.');
    res.redirect(`/user/resetpassword/${token}`);
  }
};


// -------------------------- CHAT --------------------------
const saveChat = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    const chat = new Chat({
      sender_id,
      receiver_id,
      message,
    });

    const newChat = await chat.save();

    res.status(200).send({ success: true, message: "Chat inserted", data: newChat });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(400).send({ success: false, message: "Failed to save chat." });
  }
};


// -------------------------- GROUP --------------------------
const getGroup = async (req, res) => {
  try {
    const group = await Group.find({ creator_id: req.user._id });
    res.render('pages/user/group', { data: req.user, group: group});
  } catch (error) {
    console.error('Error rendering group page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/index');
  }
}

const createGroup = async (req, res) => {
  try {
    const { name, limit } = req.body;
    const creator_id = req.user._id;
    const photo = req.file.filename;

    const group = new Group({
      creator_id,
      name,
      photo,
      limit,
    });

    await group.save();

    req.flash('success', 'Group created successfully.');
    res.redirect('/user/group' , { data: req.user, group: group});
  } catch (error) {
    console.error('Error creating group:', error);
    req.flash('error', 'Error creating group.');
    res.redirect('/user/group');
  }
}


// -------------------------- MEMBER --------------------------
const getMember = async (req, res) => {
  try {
    const member = await User.aggregate([
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: 'user_id',
          pipeline: [ 
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$group_id",new ObjectId(req.body.group_id)] },
                  ]
                }
              },
            },
          ],
          as: 'member',
        },
      },
      {
        $match: {
          "_id": { $nin: [new ObjectId(req.user._id)] },
        },
      },
    ]);

    res.status(200).send({ success: true, message: "Member found", data: member });
  } catch (error) {
    console.error('Error rendering member page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/index');
  }
}


// -------------------------- ADD MEMBER ----------------------
const addMember = async (req, res) => {
  try {
    const { members, limit, group_id } = req.body;
  
    if (!members) {
      return res.status(400).send({ success: false, message: "Please select at least one member." });
    }

    if (members.length > parseInt(limit)) {
      return res.status(400).send({ success: false, message: `You can add only ${limit} members.` });
    }
    
    await Member.deleteMany({ group_id });

    const memberData = members.map(user_id => ({ group_id, user_id }));
    await Member.insertMany(memberData);

    res.status(200).send({ success: true, message: "Member added successfully." });
  } catch (error) {
    console.error('Error rendering member page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/group');
  }
};


// -------------------------- UPDATE GROUP -------------------------
const updateGroup = async (req, res) => {
  try {
    const limit = parseInt(req.body.limit);
    const lastLimit = parseInt(req.body.last_limit);
    const groupId = req.body.id;

    if (isNaN(limit) || isNaN(lastLimit) || !groupId) {
      throw new Error('Invalid input parameters');
    }

    if (limit < lastLimit) {
      await Member.deleteMany({ group_id: groupId });  
    }

    const updateObj = {
      name: req.body.name,
      limit: limit
    };

    if (req.file) {
      updateObj.photo = req.file.filename;
    }

    await Group.findByIdAndUpdate(groupId, updateObj);
    res.status(200).send({ success: true, message: "Update successfully." });
    
  } catch (error) {
    console.error('Error updating group:', error);
    req.flash('error', 'Error updating group.');
    return res.redirect('/user/group');
  }
};


//------------------------- DELETE GROUP --------------------------
const deleteGroup = async (req, res) => {
  try{
    await Group.deleteOne({_id:req.body.id})
    await Member.deleteMany({group_id:req.body.id});

    res.status(200).send({ success: true, message: "Delete successfully." });
  }catch(error){
    console.error('Error deleting group:', error);
    req.flash('error', 'Error deleting group.');
    return res.redirect('/user/group');
  }
}


//------------------------- SHARE GROUP ---------------------------
const shareGroup = async (req, res) => {
  try {
    var groupData = await Group.findOne({ _id: req.params.id });
    var data = req.user;
    
    if (!groupData) {
      res.render('pages/user/error', { message: "No such group exists!" });
    } else if (req.user === undefined) {
      res.render('pages/user/error', { message: 'Please login to continue!' });
    } else {

      var totalMember = await Member.find({ group_id: req.params.id }).countDocuments();
      var available = groupData.limit - totalMember;
      var isOwner = groupData.creator_id.toString() === req.user._id.toString();
      var isJoined = await Member.find({ group_id: req.params.id, user_id: req.user._id }).countDocuments();

      res.render('pages/user/shareLink', { group: groupData, totalMember: totalMember, available: available, isOwner: isOwner, isJoined: isJoined, data: data });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}


//------------------------- JOIN GROUP -----------------------------
const joinGroup = async (req ,res) =>{
  try{
    const member = new Member({
      group_id:req.body.group_id,
      user_id:req.user._id
    })
    await member.save();
    res.status(200).send({success:true,message:'JOIN!!!!!!!!!!!!!!!'})
  }catch(error){
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}


//-------------------------------- GROUP CHAT -----------------------
const getGroupChat = async (req,res) =>{
  try{
    var data = req.user;
    const myGroup = await Group.find({creator_id: req.user._id})
    const joinedGroup = await  Member.find({user_id : req.user._id}).populate("group_id");

    res.render('pages/user/groupChat',{myGroup:myGroup,joinedGroup:joinedGroup,data:data});
  }catch(error){
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
}



module.exports = {
    index,
    signUp,
    getSignUp,
    logIn,
    getLogIn,
    logOut,
    getSendOtp,
    sendOtp,
    getVerifyOtp,
    verifyOtp,
    profile,
    getUpdaetProfile,
    updatedProfile,
    getPassword,
    changedPassword,
    getForgetPassword,
    forgetPassword,
    getResetPassword,
    resetedPassword,
    saveChat,
    getGroup,
    createGroup,
    getMember,
    addMember,
    updateGroup,
    deleteGroup,
    shareGroup,
    joinGroup,
    getGroupChat
}

