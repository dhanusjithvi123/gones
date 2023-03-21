const multer = require('multer');
const path = require('path')

// Multer (file upload setup)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/product");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
        console.log(file.fieldname + Date.now() + path.extname(file.originalname));
    },
  });

const upload =multer({ storage:storage }).array("image", 10)

module.exports = {upload}