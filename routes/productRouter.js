const { createProduct, getAllProducts, getOneProduct, updateProduct, deleteProduct } = require('../controllers/productController')

const router = require('express').Router()

router.post('/createProduct/:userId', createProduct)

router.get('/getAllProducts', getAllProducts)

router.get('/getOneProduct/:userId', getOneProduct)

router.put('/updateProduct/:userId', updateProduct)

router.delete('/deleteProduct/:productId', deleteProduct)

module.exports = router