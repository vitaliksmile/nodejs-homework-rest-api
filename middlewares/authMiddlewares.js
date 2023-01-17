const { verifyToken } = require("../token");
const { User } = require("../services/schemas/userSchema");

const authMiddlewares = async (req, res, next) => {
  const token = req.headers.authorization.splice(7);
  try {
    const { id } = await verifyToken(token);
    const userId = await User.findById(id);
    if (!userId) {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
      });
      return;
    }
    req.user = userId;
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Not authorized",
    });
  }
};
module.exports = { authMiddlewares };
