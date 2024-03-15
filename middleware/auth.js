const jwt = require('jsonwebtoken');
const Admin = require("../model/admin/admin");
const User = require("../model/user/user");


//------------------ ADMIN ---------------------------
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.params.token;

    if (!token) {
      req.flash('error', 'Please login to continue');
      return res.redirect('/admin/login');
    }

    const decodedData = jwt.verify(token, process.env.SECRET_KEY);
    const admin = await Admin.findById(decodedData.id);

    if (!admin) {
      req.flash('error', 'Invalid token');
      return res.redirect('/admin/login');
    }

    req.token = token;
    req.photoLoc = admin.photo;

    if (admin.photo == "") {
      admin.photo = `${process.env.url}/assets/upload/1.png`;
    } else {
      admin.photo = `${process.env.url}/assets/upload/${admin.photo}`;
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Error in authenticateToken:', err);

    if (err.name == 'JsonWebTokenError') {
      req.flash('error', 'Invalid token');
      return res.redirect("/admin/login")
    }

    req.flash('error', 'Please login to continue');
    res.redirect('/admin/login');
  }
};


//------------------ USER ---------------------------
const userauthenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.params.token;

    if (!token) {
      req.flash('error', 'Please login to continue');
      return res.redirect('/user/login');
    }

    const decodedData = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodedData.id);

    if (!user) {
      req.flash('error', 'Invalid token');
      return res.redirect("/user/signup")
    }

    req.token = token;
    req.photoLoc = user.photo;

    if (user.photo == "") {
      user.photo = `${process.env.url}/assets/upload/1.png`;
    } else {
      user.photo = `${process.env.url}/assets/upload/${user.photo}`;
    }

    if (user.status == "inactive") {
      res.clearCookie("token");
      req.flash('error', 'Your account is inactive');
      return res.redirect('/user/login');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error in userauthenticateToken:', err);

    if (err.name == 'JsonWebTokenError') {
      req.flash('error', 'Invalid token');
      return res.redirect("/user/login");
    }

    req.flash('error', 'Please login to continue');
    return res.redirect('/user/login');
  }
};


//------------------ OTP ---------------------------
const otpauthenticateToken = (req, res, next) => {
  try {
    const otpToken = req.session.otpToken;

    if (!otpToken) {
      req.flash('error', 'Please verify OTP to continue');
      return res.redirect('/user/verifyotp');
    }

    req.token = otpToken;
    next();
  } catch (error) {
    console.error('Error in otpauthenticateToken:', error);
    req.flash('error', 'Internal server error.');
  }
};


module.exports = { 
  authenticateToken,
  userauthenticateToken,
  otpauthenticateToken
};
