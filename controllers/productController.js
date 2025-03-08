const productModel = require('../models/productModel')
const userModel = require('../models/userModel')


exports.createProduct = async (req, res) => {
    try {
        
        const {userId} = req.params

        const {productName,productQuantity,ProductPrice} = req.body

        const user = await userModel.findById(userId)
        if(!user) {
            return res.status(404).json({message: 'user not found'})
        }

        const newData = new productModel({
            productName,
            productQuantity,
            ProductPrice,
            // productId,
            // userId : user.fullName

        })

        await newData.save()
        

        res.status(200).json({message: 'product has been created successfully', data: newData})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message:'internal server error'})
    }
}




exports.getAllProducts = async (req, res) => {
    try {
        const product = await productModel.find()

        res.status(200).json({message: 'all products in the database', data:product})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: 'internal server error'})
    }
}



exports.getOneProduct = async (req, res) => {
    try {
        const {userId} =req.params

        const user = await userModel.findById(userId)
        if(!user) {
            return res.status(404).json({message: 'user not found'})
        }

        const userProduct = await productModel.findById(userId).populate('userId', ["fullName", "email", "gender"])

        if(!userProduct) {
            return res.status(404).json({message: 'product not found'})
        }

        res.status(200).json({message: `product for the user below` ,data: userProduct})

    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: 'internal server error'})
    }
}



exports.updateProduct = async (req, res) => {
    try {
        const {userId} =req.params

        const user = await userModel.findById(userId)
        if(!user) {
            return res.status(404).json({message: 'user not found'})
 
        }
        const {productName,productQuantity,ProductPrice} = req.body

        const data = {
            productName,
            productQuantity,
            ProductPrice
        }

        await data.save()

        const updatedProduct = await productModel.findByIdAndUpdate('userId', data, {new: true})

        res.status(200).json({message: `user has been updated successfully`, data: updatedProduct})


    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: 'internal server error'})
    }
}




exports.deleteProduct = async (req, res) => {
    try {
        const {productId } = req.params

        const product = await productModel.findById(productId).populate("userId", ["fullName", "email", "gender"])
        if(!product) {
            return res.status({message: 'product not found'})
        }


        const deleteProduct = await productModel.findByIdAndDelete(productId)

        res.status(200).json({message: 'product has been deleted successfully', data: deleteProduct})


    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: 'internal server error'})
    }
}