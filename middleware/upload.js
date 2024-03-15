const multer = require("multer");
const path=require("path");


const storage = multer.diskStorage({
    destination: path.join(__dirname, "../public/assets/upload"),
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
});
  
const upload = multer({
    limits: {
      fileSize: 4 * 1024 * 1024, // 4 MB limit
    },
    
    fileFilter: (req, file, cb) => {
      const allowedFileTypes = /jpg|jpeg|png|gif/i;
      const isFileSupported = allowedFileTypes.test(file.mimetype);
      
      if (!isFileSupported) {
        return cb(new Error("File is not supported"), false);
      }
  
      cb(null, true);
    },
});
  


module.exports =multer({storage,upload});