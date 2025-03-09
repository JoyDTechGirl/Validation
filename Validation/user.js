const joi = require('joi')

exports.registerUserSchema = joi.object().keys({
  fullName: joi.string().min(3).max(10).required(),
  email: joi.string().trim().email().max(8).required(),
  password: joi.string().trim().required(),
  gender: joi.string().trim().valid('Male','Female').required()
});


exports.loginSchema = joi.object().keys({
  email:joi.string().trim().min(6).max(8).email().required(),
  password:joi.string().trim().min(6).max(8).required()
});