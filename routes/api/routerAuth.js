const express = require("express");
const multer = require("multer");
const { authMiddlewares } = require("../../middlewares/authMiddlewares");
const {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
  verifyToken,
  verifyEmail,
} = require("../../services/users");

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/register", signup);
router.get("/login", login);
router.post("/logout", authMiddlewares, logout);
router.get("/current", authMiddlewares, getCurrent);
router.patch("/", updateSubscription);
router.patch(
  "/avatars",
  authMiddlewares,
  upload.single("avatar"),
  updateAvatar
);
router.get("/verify/:verificationToken", verifyToken);
router.post("/verify", verifyEmail);
module.exports = router;
