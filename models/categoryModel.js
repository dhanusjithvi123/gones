const mongoose = require('mongoose');



const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true 
    },
    iBlocked:{
        type:Boolean,
      
        default:false
     }

})





const category = mongoose.model('Category',categorySchema);


module.exports = category