const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    
    productId:[{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Products",
        require: true
    }],

    totalAmount: [{
        type: Number,
        required: true,
    }],

    userId: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    }]

}, { timestamps: true })

const paymentModel = mongoose.model("Payments", paymentSchema);

module.exports = paymentModel