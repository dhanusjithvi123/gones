const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const cartSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'user'
    },
    cartItems:[{
        productId:{
            type:mongoose.SchemaTypes.ObjectId,  required:true,
        },
        qty:{
            type:Number,
            required:true,
            default:1,
        },

    }],
    discoundamount:{
        type:Number
    },
    total: {
        type: Number,
    
      }
})

module.exports = mongoose.model('carts',cartSchema) 
