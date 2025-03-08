const joi = require('joi')

exports.registerUserSchema = joi.object().keys({
  fullName: joi.string().min(3).max(10).required(),
  email: joi.string().trim().email().max(8).required(),
  // username: joi.string().min(3).max(20).require(),
  password: joi.string().trim().required(),
  gender: joi.string().trim().valid('Male','Female').required(),
  // confirmPassword: joi.string().trim().min(3).max(20).required()
  // phoneNumber: joi.string().trim().require(),
});


exports.loginSchema = joi.object().keys({
  email:joi.string().trim().min(6).max(8).email().required(),
  password:joi.string().trim().min(6).max(8).required()
});