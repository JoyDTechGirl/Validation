const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { registerUser, verifyUser, loginUser, forgetUserPassword, resetUserPassword, changeUserPassword } = require('../controllers/userController');
const { authenticate, adminAuth } = require('../middlewares/authentication');


const router = require('express').Router();

router.post('/user', registerUser);
router.get('/verify/user/:token', verifyUser);
router.post('/login/user/', loginUser);
router.post('/forgot=password/user', forgetUserPassword);
router.post('/reset=password/user/:token', resetUserPassword);
router.post('/change/password/user/:id', changeUserPassword);

router.post("/payment",authenticate, initializePayment)

router.get("/payment/:reference",verifyPayment)

module.exports = router