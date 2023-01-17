const jwt = require("jsonwebtoken");

const generateToken = (payload) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.TOKEN_SECRET,
      { algorithm: "HS256", expiresIn: 120_000_000 },
      (err, encoded) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(encoded);
      }
    );
  });

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      { algorithms: ["HS256"] },
      (err, payload) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(payload);
      }
    );
  });

module.exports = {
  generateToken,
  verifyToken,
};
