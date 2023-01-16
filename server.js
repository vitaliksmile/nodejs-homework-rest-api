const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log("Database connection successful"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});
