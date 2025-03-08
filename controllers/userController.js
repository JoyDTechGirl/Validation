const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verify, reset } = require('../helper/html');
const { send_mail } = require('../middlewares/nodemailer');
const {validate} = require('../utils/validation')
const joi = require('joi');
const { registerUserSchema} = require('../Validation/user');


exports.registerUser = async (req, res) => {
  try {

    const validatedData = await validate(req.body,registerUserSchema);
    console.log('Validated Data:', validatedData);
    // const { fullName, email, gender, password, confirmPassword } = req.body;
    const { fullName, email, gender, password} = validatedData;
    // console.log('Raw Request Body:', req.body);
    console.log('Validated Data:', validatedData);


    if (!fullName || !email || !gender || !password) {
      return res.status(400).json({
        message: 'Input required for all field'
      })
    };

    // if (password !== confirmPassword) {
    //   return res.status(400).json({
    //     message: 'Password does not match'
    //   })
    // };

    const existingEmail = await userModel.findOne({ email: email.toLowerCase() });

    if (existingEmail.length === 1) {
      return res.status(400).json({
        message: `${email.toLowerCase()} already exist`
      })
    };

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedRound);

    const user = new userModel({
      fullName,
      email,
      gender,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5mins' });
    const link = `${req.protocol}://${req.get('host')}/api/v1/verify/user/${token}`;
    const firstName = user.fullName.split(' ')[0];

    const mailOptions = {
      email: user.email,
      subject: 'Account Verification',
      html: verify(link, firstName)
    };

    await send_mail(mailOptions);
    await user.save();
    res.status(201).json({
      message: 'Account registered successfully',
      data: user
    });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({
      message: 'internal Server Error',data:error.message
    })
  }
};


exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        message: 'Token not found'
      })
    };

    jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
      if (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          const { userId } = jwt.decode(token);
          const user = await userModel.findById(userId);

          if (!user) {
            return res.status(404).json({
              message: 'Account not found'
            })
          };

          if (user.isVerified === true) {
            return res.status(400).json({
              message: 'Account is verified already'
            })
          };

          const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5mins' });
          const link = `${req.protocol}://${req.get('host')}/api/v1/verify/user/${newToken}`;
          const firstName = user.fullName.split(' ')[0];

          const mailOptions = {
            email: user.email,
            subject: 'Resend: Account Verification',
            html: verify(link, firstName)
          };

          await send_mail(mailOptions);
          res.status(200).json({
            message: 'Session expired: Link has been sent to email address'
          })
        }
      } else {
        const user = await userModel.findById(payload.userId);

        if (!user) {
          return res.status(404).json({
            message: 'Account not found'
          })
        };

        if (user.isVerified === true) {
          return res.status(400).json({
            message: 'Account is verified already'
          })
        };

        user.isVerified = true;
        await user.save();

        res.status(200).json({
          message: 'Account verified successfully'
        })
      }
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session expired: link has been sent to email address'
      })
    }
    res.status(500).json({
      message: 'Error Verifying user'
    })
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Please enter your email address'
      })
    };

    if (!password) {
      return res.status(400).json({
        message: 'Please your password'
      })
    };

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: 'Account not found'
      })
    };

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        message: 'Incorrect password'
      })
    };

    if (user.isVerified === false) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5mins' });
      const link = `${req.protocol}://${req.get('host')}/api/v1/verify/user/${token}`;
      const firstName = user.fullName.split(' ')[0];

      const mailOptions = {
        email: user.email,
        subject: 'Account Verification',
        html: verify(link, firstName)
      };

      await send_mail(mailOptions);
      return res.status(400).json({
        message: 'Account is not verified, link has been sent to email address'
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1day' });

    res.status(200).json({
      message: 'Account login successfull',
      token
    })
  } catch (error) {
    console.log(error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session expired. Please login again'
      })
    }
    res.status(500).json({
      message: 'Error Logging user In'
    })
  }
};


exports.forgetUserPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5mins' });
    const link = `${req.protocol}://${req.get('host')}/api/v1/reset=password/user/${token}`; // consumed post link
    const firstName = user.fullName.split(' ')[0];

    const mailOptions = {
      email: user.email,
      subject: 'Reset Password',
      html: reset(link, firstName)
    };

    await send_mail(mailOptions);
    return res.status(200).json({
      message: 'Link has been sent to email address'
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Forgot password failed'
    })
  }
};


exports.resetUserPassword = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        message: 'Token not found'
      })
    };

    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match'
      })
    };

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltedRound);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session expired. Please enter your email to resend link'
      })
    };
    res.status(500).json({
      message: 'Error resetting password'
    })
  }
};


exports.changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Incorrect password'
      })
    };

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match'
      })
    };

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltedRound);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password change successfully'
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error Changing Password'
    })
  }
};