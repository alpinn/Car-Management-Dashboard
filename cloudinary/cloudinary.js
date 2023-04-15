require("dotenv").config();
const cloudinary = require("cloudinary").v2;

//Get from Cloudinary Dashboard
cloudinary.config({
  cloud_name: "dbz8mkqui",
  api_key: "794659227212113",
  api_secret: "r0tRSjRYJyQZATGUjSfgsdbH658",
  secure: true,
});

module.exports = cloudinary;