const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const logger = require('morgan');
const db= require('./config/connection.js')
const dotenv = require('dotenv')
const { cloudinaryConfig } = require("./config/cloudinary");
const PORT=process.env.PORT || 3000
dotenv.config();
db();

var adminRouter = require('./routes/admin.js');
var usersRouter = require('./routes/users');
const multer = require('multer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(cloudinaryConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',  express.static(path.join(__dirname, 'public')));


//session setup
const oneHour = 1000*60*60;
app.use(session({
    secret: "key",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: oneHour}
}))



//Cache Control
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store');
  next();
})




app.use('/admin', adminRouter);
app.use('/', usersRouter);




app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};



  // render the error page
  res.status(err.status || 500);
  res.render('error');
});






app.get('/upload',(res,req)=>{
  req.render("../views/admin/img.ejs")
})


// image



//  const multer = require('cloudinary-multer');



const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage }).array('images', 10);


cloudinary.config({
url: process.env.CLOUDINARY_URLT
});

const Schema = mongoose.Schema;
const imageSchema = new Schema({
image_url: { type: [String], required: true }
});
const Image = mongoose.model('Image', imageSchema);
app.post('/upload', uploadMiddleware, async (req, res) => {
if (res.headersSent) return;
const tempFilePaths = [];
for (let i = 0; i < req.files.length; i++) {
  tempFilePaths.push('C:\Users\HP\Desktop\Home decoration project\public\images-' + i);
  fs.writeFileSync(tempFilePaths[i], req.files[i].buffer);
  const result = await cloudinary.uploader.upload(tempFilePaths[i], { resource_type: 'image' });
  if (res.headersSent) return;
  const imageUrls = result.secure_url;
  const newImage = new Image({
    image_url: imageUrls
  });
  await newImage.save((error, image) => {
    if (error) return res.status(500).json({ error: error.message });
    if (res.headersSent) return;
    return res.status(200).json({
      message: 'Upload success',
      image_url: image.image_url
    });
  });
}
});





// module.exports = app;
app.listen(PORT,()=>{console.log("SERVER START");})
