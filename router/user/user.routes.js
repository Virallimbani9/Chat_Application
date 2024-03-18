const express = require("express");
const router=express.Router()
const userCon=require('../../controller/user/userCon')
const {userauthenticateToken,otpauthenticateToken} = require('../../middleware/auth');
const upload = require("../../middleware/upload");


// -------------------------- INDEX --------------------------
router.get('/index' ,userauthenticateToken,userCon.index)

// -------------------------- SIGN --------------------------
router.get('/signup',userCon.getSignUp)
router.post('/signup',userCon.signUp)

// -------------------------- LOGIN --------------------------
router.get('/login',userCon.getLogIn)
router.get('/logout',userCon.logOut)
router.post('/login',userCon.logIn)

// -------------------------- OTP --------------------------
router.get('/getSendotp',userauthenticateToken,userCon.getSendOtp)
router.post('/sendotp',userauthenticateToken,userCon.sendOtp)

router.get('/getVerifyotp',otpauthenticateToken,userauthenticateToken,userCon.getVerifyOtp)
router.post('/verifyotp',otpauthenticateToken,userauthenticateToken,userCon.verifyOtp)

// -------------------------- PROFILE --------------------------
router.get('/profile',userauthenticateToken,userCon.profile)

// -------------------------- PROFILE UPDATE --------------------------
router.get('/updateprofile',userauthenticateToken,userCon.getUpdaetProfile)
router.post('/updatedprofile',userauthenticateToken,upload.single('photo'),userCon.updatedProfile)

// -------------------------- CHANGE PASSWORD --------------------------
router.get('/changepassword',userauthenticateToken,userCon.getPassword)
router.post('/changedpassword',userauthenticateToken,userCon.changedPassword)

// -------------------------- FORGET PASSWORD --------------------------
router.get('/forgetpassword',userCon.getForgetPassword)
router.post('/forgetedpassword',userCon.forgetPassword)

// -------------------------- RESET PASSWORD --------------------------
router.get('/resetpassword/:token',userCon.getResetPassword)
router.post('/resetedpassword/:token',userCon.resetedPassword)

// -------------------------- CHAT --------------------------
router.post('/savechat',userauthenticateToken,userCon.saveChat)

// -------------------------- GROUP --------------------------
router.get('/group',userauthenticateToken,userCon.getGroup)
router.post('/creategroup',userauthenticateToken,upload.single('photo'),userCon.createGroup)

// -------------------------- MEMBER --------------------------
router.post('/getmember',userauthenticateToken,userCon.getMember)

// -------------------------- ADD MEMBER --------------------------
router.post('/addmember',userauthenticateToken,userCon.addMember)

// -------------------------- UPDATE GROUP -------------------------
router.post('/updategroup',userauthenticateToken,upload.single('photo'),userCon.updateGroup)

//----------------------------- DELETE GROUP ----------------------
router.post("/deletegroup", userauthenticateToken , userCon.deleteGroup);

// ------------------------------ SHARE GROUP ------------------------
router.get("/share-group/:id",userauthenticateToken,userCon.shareGroup)

//------------------------------- JOIN GROUP --------------------------
router.post("/join-group",userauthenticateToken,userCon.joinGroup)

//-------------------------------- GROUP CHAT -------------------------
router.get("/group-chat",userauthenticateToken,userCon.getGroupChat)


module.exports=router