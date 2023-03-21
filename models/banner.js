const mongoose = require('mongoose')
const bannerSchema = new mongoose.Schema(
    {
     bannerText:{
        type:String,
        required:true,
     },
         
     image:{
      type: [],
    },
     isDeleted:{
        type:Boolean,
       default:false
     },
     
    },

    
    );

    module.exports = mongoose.model('banner',bannerSchema)