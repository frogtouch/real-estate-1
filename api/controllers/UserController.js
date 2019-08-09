/* eslint-disable no-console */
const User = require('../models/User');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const httpStatus = require('http-status');
const sendResponse = require('../../helpers/response');
const UserQuery = require('../queries/user.queries');

const uploadFile = require('../../helpers/fileUpload');
const Mail = require('../services/mail.service');

const UserController = () => {
  const register = async (req, res, next) => {
    try {
      const { name, email, phone, password, password2, user_type } = req.body;

      if (password !== password2) {
        return res.json(
          sendResponse(
            httpStatus.BAD_REQUEST,
            'Passwords does not match',
            {},
            { password: 'password does not match' }
          )
        );
      }

      const userExist = await UserQuery.findByEmail(email);
      if (userExist) {
        return res.json(
          sendResponse(
            httpStatus.BAD_REQUEST,
            'email has been taken',
            {},
            { email: 'email has been taken' }
          )
        );
      }

      const user = await UserQuery.create({
        name,
        email,
        phone,
        password,
        user_type
      });

      return res.json(sendResponse(httpStatus.OK, 'success', user, null));
    } catch (err) {
      next(err);
    }
  };

  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await UserQuery.findByEmail(email);

      if (!user) {
        return res.json(
          sendResponse(
            httpStatus.NOT_FOUND,
            'User does not exist',
            {},
            { error: 'User does not exist' }
          )
        );
      }

      if (bcryptService().comparePassword(password, user.password)) {
        // to issue token with the user object, convert it to JSON
        const token = authService().issue(user.toJSON());

        return res.json(
          sendResponse(httpStatus.OK, 'success', user, null, token)
        );
      }

      return res.json(
        sendResponse(
          httpStatus.BAD_REQUEST,
          'invalid email or password',
          {},
          { error: 'invalid email or password' }
        )
      );
    } catch (err) {
      next(err);
    }
  };

  const forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      // const user = await UserQuery.findByEmail(email);
      // if (user) {
      // Compose email and send to user email address
      const mailResult = await new Mail()
        .from()
        .to(email)
        .subject(`Password Reset`)
        .html('<p>Password reset link</p>')
        .send();

      console.log(mailResult);
      // }
    } catch (error) {}
  };

  const validate = (req, res) => {
    const { token } = req.body;

    authService().verify(token, err => {
      if (err) {
        return res.json(
          sendResponse(
            httpStatus.UNAUTHORIZED,
            'Invalid Token!',
            {},
            { error: 'Invalid Token!' }
          )
        );
      }

      return res.status(200).json({ isvalid: true });
    });
  };

  const getAll = async (req, res) => {
    try {
      const users = await User.findAll();

      return res.json(sendResponse(httpStatus.OK, 'success!', users, null));
    } catch (err) {
      next(err);
    }
  };

  const fileUpload = async (req, res) => {
    return await uploadFile(req, res);
  };

  return {
    register,
    login,
    validate,
    getAll,
    fileUpload,
    forgotPassword
  };
};

module.exports = UserController;
