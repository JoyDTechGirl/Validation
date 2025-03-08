const mongoose = require("mongoose");

const productSChema = new mongoose.Schema({
    
    productName: {
        type: String,
        require: true
    },

    productQuantity: {
        type: Number,
        required: true,
    },

    ProductPrice: {
        type: Number,
        required: true,
        
    },

    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    }

}, { timestamps: true })

const productModel = mongoose.model("Products", productSChema);

module.exports = productModel