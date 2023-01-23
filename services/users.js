const { User, registerSchema, loginSchema } = require("./schemas/userSchema");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signup = async (req, res, next) => {
  const { email, password, verificationToken } = req.body;
  const { error } = registerSchema.validate(req.body);
  const avatarUrl = gravatar.url(email);

  const msg = {
    to: email,
    from: "vitaliksmile777@gmail.com",
    subject: "Please, confirm you email",
    text: `/users/verify/${verificationToken}`,
    html: `<a href='http://localhost:3000/users/verify/${verificationToken}'>Confirm email</a>`,
  };
  await sgMail.send(msg);

  if (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect login or password",
      data: "Bad request",
    });
    return;
  }

  const user = await User.findOne({ email });

  if (user) {
    res.status(409).json({
      status: "error",
      code: 409,
      message: "Email in use",
      data: "Conflict",
    });
    return;
  }

  try {
    const verificationToken = uuidv4();
    const newUser = new User({ email, avatarUrl, verificationToken });
    newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      user: {
        email,
        subscription: newUser.subscription,
        avatarUrl,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        status: "error",
        code: 409,
        message: "Email in use",
        data: "Conflict",
      });
      return;
    }
    next(error);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const { error } = loginSchema.validate(req.body);

  if (!user.verify) {
    res.status(401).json({ message: "Not verified user" });
    return;
  }

  if (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect login or password",
      data: "Bad request",
    });
    return;
  }
  if (!user || !user.comparePassword(password)) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
      data: "Unauthorized",
    });
    return;
  }

  const token = await generateToken({ id: user._id });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token: token,
    user: {
      email,
      password,
    },
  });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json({ message: "No Content" });
};
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    status: "success",
    code: 200,
    user: {
      email: email,
      subscription: subscription,
    },
  });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );
  res.json({
    email: result.email,
    subscription: result.subscription,
  });
};
const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path } = req.file;
  const result = await Jimp.read(path);
  result.resize(250, 250).write(`public/avatars/${_id}`);
  await fs.unlink(path);
  await User.findByIdAndUpdate(_id, { avatarURL: `/avatars/${_id}` });
  res.status(200).json({ avatarURL: `/avatars/${_id}` });
};

const verifyToken = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await findOneAndUpdate(
    { verificationToken, verify: false },
    { verificationToken: null, verify: true },
    { new: true }
  );
  if (!user) {
    res.status(404).json({
      status: "Not found",
      code: 4004,
      message: "User not found",
    });
  }
  res.status(200).json({
    status: "OK",
    code: 200,
    message: "Verification successful",
  });
};

const verifyEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "missing required field email" });
  }
  const { verificationToken, verify } = await findOne({ email });
  if (verify) {
    res.status(400).json({ message: "Verification has already been passed" });
  }
  const msg = {
    to: email,
    from: "vitaliksmile777@gmail.com",
    subject: "Please, confirm you email",
    text: `/users/verify/:${verificationToken}`,
    html: `<a href='http://localhost:3000/users/verify/:${verificationToken}'>Confirm</a>`,
  };
  await sgMail.send(msg);
  res.status(200).json({ message: "Verification email sent" });
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
  verifyToken,
  verifyEmail,
};
