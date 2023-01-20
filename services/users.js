const { User, registerSchema, loginSchema } = require("./schemas/userSchema");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const Jimp = require("jimp");

const signup = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = registerSchema.validate(req.body);
  const avatarUrl = gravatar.url(email);
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
    const newUser = new User({ email, avatarUrl });
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
  result.cover(250, 250).write(`public/avatars/${_id}`);
  await fs.unlink(path);
  await User.findByIdAndUpdate(_id, { avatarURL: `/avatars/${_id}` });
  res.status(200).json({ avatarURL: `/avatars/${_id}` });
};
module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
};
