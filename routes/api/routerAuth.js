const express = require("express");
const { authMiddlewares } = require("../../middlewares/authMiddlewares");
const {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
} = require("../../services/users");

const router = express.Router();

router.post("/register", signup);
router.get("/login", login);
router.post("/logout", authMiddlewares, logout);
router.get("/current", authMiddlewares, getCurrent);
router.patch("/", updateSubscription);

module.exports = router;
