const Admin = require("../../model/admin/admin");
const User = require("../../model/user/user");
const query = require("../../model/admin/userQuery");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require("../../utils/mail");
const fs = require("fs");
const path = require("path");


// -------------------------- SIGN --------------------------
const getSignUp = (req, res) => {
  try {
    res.render('pages/admin/pages-signup');
  } catch (error) {
    console.error('Error rendering admin signup page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/login');
  }
};

const signUp = async (req, res) => {
  const { name, password, email, city, phone, gender } = req.body;

  try {
  
    if (!name || !password || !email || !city || !phone) {
      req.flash('error', 'Please fill all the required fields');
      return res.redirect('/admin/signup');
    }

    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters long');
      return res.redirect('/admin/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      req.flash('error', 'Email is already in use. Please use a different email.');
      return res.redirect('/admin/signup');
    }

    const newAdmin = new Admin({ name, password: hashedPassword, email, phone, city, gender });
    await newAdmin.save();

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Error in signup:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/signup');
  }
};


// -------------------------- LOGIN --------------------------
const getLogIn = (req, res) => {
  try {
    res.render('pages/admin/pages-login');
  } catch (error) {
    console.error('Error rendering admin login page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/login'); 
  }
};

const logIn = async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign({ id: admin._id }, process.env.SECRET_KEY);
      res.cookie("token", token);

      if (admin.isOtpVerified == false) {
        req.flash('info', 'Please verify your OTP.');
        return res.redirect('/admin/getsendotp');
      }

      req.flash('success', 'Login successful.');
      res.redirect('/admin/index');
    } else {
      req.flash('error', 'Invalid username or password.');
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    req.flash('error', 'Error logging in.');
    res.redirect('/admin/login');
  }
};

const logOut = async (req, res) => {
  try {
      
      res.clearCookie("token");
      
      req.flash('success', 'Logout successful.');
      res.redirect('/admin/login');
  } catch (error) {
      
      req.flash('error', 'Error logging out.');
      res.redirect('/admin/login');
  }
};


// ---------------------------- OTP --------------------------------
const getSendOtp = (req, res) => {
  try {
    res.render('pages/admin/sendOtp');
  } catch (error) {
    console.error('Error rendering admin sendOtp page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/login'); 
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      req.flash('error', 'Admin not found.');
      return res.redirect('/admin/login');
    }

    if (admin.email !== email) {
      req.flash('error', 'Invalid email.');
      return res.redirect('/admin/getsendotp');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpToken = jwt.sign({ adminId: admin._id, otp }, process.env.OTP_SECRET_KEY, { expiresIn: '1m' });

    req.session.otpToken = otpToken;

    const option = {
      email: admin.email,
      subject: 'OTP for Verification',
      message: `Your Name is ${admin.name} And Your OTP for Verification is ${otp}`,
    };

    sendMail(option);

    req.flash('success', 'OTP sent successfully.');
    res.redirect("/admin/getverifyotp");
  } catch (error) {
    console.error('Error sending OTP:', error);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/getsendotp');
  }
};

const getVerifyOtp = (req, res) => {
  try {
    res.render('pages/admin/verifyOtp');
  } catch (error) {
    console.error('Error rendering admin verifyOtp page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/user/sendotp'); 
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.session.otpToken;

  try {
    const decoded = jwt.verify(token, process.env.OTP_SECRET_KEY);
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      req.flash('error', 'Admin not found.');
      return res.redirect('/admin/login');
    }

    if (decoded.otp == otp) {
      await Admin.findByIdAndUpdate(req.admin._id, { isOtpVerified: true });
      req.flash('success', 'OTP verification successful.');
      return res.redirect('/admin/index');
    } else {
      req.flash('error', 'Invalid OTP. Please try again.');
      return res.redirect('/admin/getverifyotp');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    req.flash('error', 'Internal Server Error.');
    res.redirect('/admin/login');
  }
};


// -------------------------- INDEX --------------------------
const index = async (req, res) => {
  try {
    const count = await User.countDocuments();
    const data = req.admin;
    res.render('pages/admin/index', { data, count });
  } catch (error) {
    console.error('Error rendering admin index page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/login');
  }
};


// -------------------------- PROFILE --------------------------
const profile = (req, res) => {
  try {
    res.render('pages/admin/profile', { data: req.admin });
  } catch (error) {
    console.error('Error rendering admin profile page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/index');
  }
};


// -------------------------- UPDATE PROFILE --------------------------
const getUpdateProfile = (req, res) => {
  try {
    res.render('pages/admin/updateprofile', { data: req.admin });
  } catch (error) {
    console.error('Error rendering admin updateprofile page:', error.message);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/profile');
  }
};

const updatedProfile = async (req, res) => {
  const { name, email, city, phone } = req.body;
  try {
    const orgPath = path.join(__dirname, '../../public/assets/upload');
    const photoLoc1 = req.photoLoc ? `${orgPath}/${req.photoLoc}` : null;
    const exists = photoLoc1 ? fs.existsSync(photoLoc1) : false;

    const updatedAdminData = {
      name,
      email,
      phone,
      city,
      isProfilecomplete: true
    };

    if (req.file) {
      updatedAdminData.photo = req.file.filename;

      if (exists) {
        fs.unlinkSync(photoLoc1);
      }
    }

    const admin = await Admin.findByIdAndUpdate(req.user._id, updatedAdminData, { new: true });
    await admin.save();

    req.flash('success', 'Profile updated successfully.');
    res.redirect('/admin/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'Error updating profile.');
    res.redirect('/admin/updateprofile');
  }
};


// -------------------------- CHANGE PASSWORD --------------------------
const getPassword = async (req, res) => {
  try {
    const { admin } = req;
    res.render('pages/admin/changepassword', { data: admin });
  } catch (error) {
    console.error('Error in getPassword:', error);
    res.status(500).send('Internal Server Error');
  }
};

const changedPassword = async (req, res) => {
  try {
      const { password, newPassword, confirmPassword } = req.body;
      const adminId = req.admin._id;
      const admin = await Admin.findById(adminId);

      const valid = await bcrypt.compare(password, admin.password);

      if (!admin || !valid) {

          req.flash('error', 'Invalid current password.');
          return res.redirect('/admin/changepassword');
      } else if (newPassword !== confirmPassword) {
        
          req.flash('error', 'New password and confirm password do not match.');
          return res.redirect('/admin/changepassword');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedPassword;
      await admin.save();

      req.flash('success', 'Password changed successfully. Please login with your new password. ');
      res.clearCookie("token");
      res.redirect('/admin/logout');
  } catch (error) {
      
      req.flash('error', 'Internal server error.');
      res.redirect('/admin/changepassword');
  }
};


// -------------------------- FORGET PASSWORD --------------------------
const getForgetPassword = async (req, res) => {
  try {
    res.render('pages/admin/forgetpassword');
  } catch (error) {
    console.error('Error in getForgetPassword:', error);
    res.status(500).send('Internal Server Error');
  }
};

const forgetedPassword = async (req, res) => {
 try {
  const { email } = req.body;
  
  const admin = await Admin.findOne({ email:email });
  
  if(!admin){
    req.flash('error', 'Email not found. Please enter a valid email address.');
    return res.redirect('/admin/forgetpassword'); 
  }
  const token = jwt.sign({ id: admin._id },process.env.SECRET_KEY,{expiresIn: '1m'});
 
  await sendMail({
    email:admin.email,
    subject:"Reset Password",
    message: `Hi ${admin.name}, Please click on the link below to reset your password."http://localhost:3000/admin/resetpassword/${token}" Reset Password Thanks`,
  }) 
  req.flash('success', 'Password reset link sent to your email. Please check your inbox.');
  res.redirect('/admin/login');
}
catch (error) {
  console.error('Error in forgetedPassword:', error);
  req.flash('error', 'Internal server error.');
  res.redirect('/admin/forgetpassword');
}}


// -------------------------- RESET PASSWORD --------------------------
const getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    res.render('pages/admin/resetpassword', { data: token });
  } catch (error) {
    console.error('Error in getResetPassword:', error);
    res.status(500).send('Internal Server Error');
  }
};

const resetedPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const token = req.params.token;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      req.flash('error', 'Invalid reset password link. Please try again.');
      return res.redirect('/admin/resetpassword/:token');
    }
    else if(newPassword != confirmPassword){
      req.flash('error', 'New password and confirm password do not match.');
      return res.redirect('/admin/resetpassword/:token')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    req.flash('success', 'Password reset successful. Please login with your new password.');
    res.redirect('/admin/login');
  } catch (error) {
  
    req.flash('error', 'Internal server error.');
    res.redirect(`/admin/resetpassword/${token}`);
  }
};


// ------------------ GET USER LIST ----------------------
const getUserList = async (req, res) => {
  try {
    const data = req.admin;
    const userdata = await User.find();
    res.render("pages/admin/userlist", { data, userdata });
  } catch (error) {
    console.error('Error in getUserList:', error);
    res.status(500).send('Internal Server Error');
  }
};


// ------------------ GET USER DATA ----------------------
const getUserData = async (req, res) => {

  try {
    let data, regex;
    const limit = parseInt(req.query.length) || 10;
    const skip = parseInt(req.query.start) || 0;
    const searchValue = req.query.search.value.trim();
    regex = new RegExp(searchValue, "");

    if(searchValue == ""){
      data = await query.findData({}, {}, skip, limit);
      const recordTotal = await query.countData({});
      res.json({ 
        data: data,
        recordsTotal: recordTotal,
        recordsFiltered: recordTotal });
  }
  else
  {
    data = await query.findData(
      {
        $or: [
          { name: regex },
          { phone: regex },
          { city: regex },
          { gender: regex },
          { desgnation: regex },
          { salary:regex},
        ],
      },
      {},
      skip,
      limit
    );

    const recordTotal = await query.countData({});

    res.json({
      data: data,
      recordsTotal: recordTotal,
      recordsFiltered: recordTotal,
    });
  }
  } 
  catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// ------------------ VIEW EMPLOYEE DATA ----------------------
const viewUserData = async (req, res) => {
  try {
    const data = req.admin;
    const id = req.params.id;
    const userdata = await User.findById(id);

    if (!userdata) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/userlist');
    }

    res.render("pages/admin/viewuserdata", { userdata, data });
  } catch (error) {
    console.error('Error in viewUserData:', error);
    res.status(500).send('Internal Server Error');
  }
};


// ------------------ UPDATE STATUS ----------------------
const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const userdata = await User.findById(id);

    if (!userdata) {
      return res.status(404).json({ error: 'User not found' });
    }

    userdata.status = (userdata.status === "active") ? "inactive" : "active";
    await userdata.save();

    res.json({ userdata });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// ------------------ DELETE USER ----------------------
const deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
    index,
    getSignUp,
    signUp,
    getLogIn,
    logIn,
    logOut,
    getSendOtp,
    sendOtp,
    getVerifyOtp,
    verifyOtp,
    profile,
    getUpdateProfile,
    updatedProfile,
    getPassword,
    changedPassword,
    getForgetPassword,
    forgetedPassword,
    getResetPassword,
    resetedPassword,
    getUserList,
    getUserData,
    viewUserData,
    updateStatus,
    deleteUser
}
