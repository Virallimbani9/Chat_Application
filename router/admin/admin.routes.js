const express = require("express");
const router=express.Router()
const adminCon=require('../../controller/admin/adminCon')
const {authenticateToken,otpauthenticateToken} = require('../../middleware/auth');
const upload = require("../../middleware/upload");

// -------------------------- INDEX --------------------------
router.get('/index',authenticateToken ,adminCon.index)

// -------------------------- SIGN --------------------------
router.get('/signup',adminCon.getSignUp)
router.post('/signup',adminCon.signUp)

// -------------------------- LOGIN --------------------------
router.get('/login',adminCon.getLogIn)
router.get('/logout',adminCon.logOut)
router.post('/login',adminCon.logIn)

// -------------------------- OTP --------------------------
router.get('/getSendotp',authenticateToken,adminCon.getSendOtp)
router.post('/sendotp',authenticateToken,adminCon.sendOtp)

router.get('/getVerifyotp',otpauthenticateToken,authenticateToken,adminCon.getVerifyOtp)
router.post('/verifyotp',otpauthenticateToken,authenticateToken,adminCon.verifyOtp)

// -------------------------- PROFILE --------------------------
router.get('/profile',authenticateToken,adminCon.profile)

// -------------------------- UPDATE PROFILE --------------------------
router.get('/updateprofile',authenticateToken,adminCon.getUpdateProfile)
router.post('/updatedprofile',authenticateToken,upload.single('photo'),adminCon.updatedProfile)

// -------------------------- CHANGE PASSWORD --------------------------
router.get('/changepassword',authenticateToken,adminCon.getPassword)
router.post('/changedpassword',authenticateToken,adminCon.changedPassword)

// -------------------------- FORGET PASSWORD --------------------------
router.get('/forgetpassword',adminCon.getForgetPassword)
router.post('/forgetedpassword',adminCon.forgetedPassword)

// -------------------------- RESET PASSWORD --------------------------
router.get('/resetpassword/:token',adminCon.getResetPassword)
router.post('/resetedpassword/:token',adminCon.resetedPassword)

// -------------------------- USER --------------------------
router.get('/getuserlist',authenticateToken,adminCon.getUserList)
router.get('/getuserdata',authenticateToken,adminCon.getUserData)

// -------------------------- VIEW USER DATA ----------------------
router.get('/viewuserdata/:id',authenticateToken,adminCon.viewUserData)

// -------------------------- UPDATE STATUS ----------------------
router.post('/updatestatus/:id',authenticateToken,adminCon.updateStatus)

// -------------------------- DELETE USER ----------------------
router.delete('/deleteuser/:id',authenticateToken,adminCon.deleteUser)



module.exports=router