const mongoose = require('mongoose');
const Schema   = mongoose.Schema

const orderSchema = new mongoose.Schema({

  userId:{
    type:mongoose.SchemaTypes.ObjectId,
},
    orderItems: [{
      
        productId:{
          type:mongoose.SchemaTypes.ObjectId,  required:true,

      },
      quantity: {
        type: Number,
      }, 
    }],
    orderStatus: {
      type: String,
      default: 'pending'
    },
    paymentStatus: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    itemsPrice: {
      type: Number,
    },
    shippingPrice: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    Qtystatus: {
      type: Boolean,
      default: true
    },
    deliveredAt: {
      type: Date
    },

  
    name: {
      type: String,
    },

    shop: {
      type: String,
      
    },

    state: {
      type: String,  
      

    },
    city: {
      type: String,


    },
    street: {
      type: String,  


    },
   
    code: {
      type: Number,    


    },
    mobile: {
      type: Number,   


    },
    email: {
      type: String,   

    },


    paymentMethod:{type:String},

    order_id:{
      type: String,
    }

    

  }, {
    timestamps: true
  });


const order= mongoose.model("order",orderSchema)
module.exports = order;