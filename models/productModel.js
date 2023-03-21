const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const productSchema = new mongoose.Schema({

  
    productName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Stock: {
        type: Number,
        required: true
    },
    category:{ 
        type:mongoose.Schema.Types.ObjectId,
      
    },
    image_url: { type:Array},
    flag: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    blockedDate: {
        type: Date,
        default: Date.now
    },
        
    
},{timestamps:true})

module.exports = mongoose.model('Products', productSchema);