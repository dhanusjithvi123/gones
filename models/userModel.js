

const mongoose=require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;



const userSchema = new mongoose.Schema({
    
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        
    },
     mobile: {
        type: Number,
        required: true
    },
    password : {
        type: String,
        required: true

    },

    coupondata:[{
      coupons:String
     }],

    addressDetails:[
        {
         Fullname:{type:String},

         email:{type:String},
      
         mobile:{type:Number},
      
         city:{type:String},
         
         company:{type:String},
      
         state:{type:String},
      
         postal_code:{type:Number},
      
         houseaddress:{
            type:String
         },
            }
      ],
    status:{
        type: Boolean,
        default:true
    },
    isBlocked:{
        type:Boolean,
        default:false
     }

}, {timestamps:true});
module.exports = mongoose.model('users',userSchema)
