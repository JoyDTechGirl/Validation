const paymentModel = require("../models/paymentModel");
const axios = require("axios");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const apiUrl = 'https://api.paystack.co/transaction/initialize'

// console.log(process.env.PAYSTACK_SECRET);


exports.initializePayment = async (req, res) => {
   
    try {

//          const products = req.body.items.filter((x)=> {
//             return x}
//             )

//             for (let index = 0; index < products.length; index++) {
//                 const element =await productModel.findOne({ _id:products[index]});
//                 const totalPrice = Object.values(element).reduce((sum, item) => sum + (item.ProductPrice || 0), 0);

// console.log("Total Product Price:", totalPrice);
              

//             }

const products = req.body.items.filter((x) => x);

let totalPrice = 0; // Initialize total price

// Loop through each product and fetch from DB
for (let index = 0; index < products.length; index++) {
    const product = await productModel.findOne({ _id: products[index] });

    if (product && product.ProductPrice) {
        totalPrice += product.ProductPrice; // Add product price to total
    }
}

console.log("Total Product Price:", totalPrice);


    //    for (let index = 0; index < req.body.items.length; index++) {

    //     console.log("i am the id",index)
    //         const products =await productModel.findById(index)
    //         return products
    //     } 

        // const getAllProduct = await productModel.find()
        const email= await userModel.findOne({_id:req.user.userId})
        console.log(email)
        const createPayment = await axios.post(apiUrl, { email: email.email, amount: totalPrice*10 },{ headers:{ Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`}})
        // console.log(createPayment);

        res.status(201).json({
            authorizationUrl: createPayment.data.data.authorization_url
        })


        // res.redirect(createPayment.data.data.authorization_url)
        

    } catch (error) {
        console.log(error)
        
        res.status(500).json({
            message: "Internal server Error"
        })
    }
}


exports.verifyPayment = async(req,res) => {
    try{
        const reference = req.params.reference

        const createPayment = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,{ headers:{ Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`}})
        console.log(createPayment);

        res.status(201).json({
            authorizationUrl: createPayment.data.data.authorization_url
        })

    }catch(error){
        console.log(error.message)
        res.status(500).json({message: 'Internal Server Error'})
    }
}