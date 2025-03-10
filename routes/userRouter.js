const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { registerUser, verifyUser, loginUser, forgetUserPassword, resetUserPassword, changeUserPassword } = require('../controllers/userController');
const { authenticate, adminAuth } = require('../middlewares/authentication');

const passport = require('passport')


const router = require('express').Router();

router.post('/user', registerUser);
router.get('/verify/user/:token', verifyUser);
router.post('/login/user/', loginUser);
router.post('/forgot=password/user', forgetUserPassword);
router.post('/reset=password/user/:token', resetUserPassword);
router.post('/change/password/user/:id', changeUserPassword);

router.post("/payment",authenticate, initializePayment)

router.get("/payment/:reference",verifyPayment)

router.get('/my-google',passport.authenticate('google',{scope: ['profile','email']}))

router.get('/auth/google/callback',passport.authenticate('google'),async(req,res) => {
  // console.log(req.user)
  const token = await jwt.sign({userId: req.user._id},process.env.JWT_SECRET,{expiresIn: '1days'})
  
  res.status(200).json({message: 'User Has Been authentication',token,user:req.user})
})

router.get('/',(req,res) => {
  res.send('Love me jeje')
});


module.exports = router