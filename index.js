const express = require("express");
const PORT = process.env.PORT || 8000;
const router = require("./routes/routes.js");
const cors = require("cors");
const app = express();
const path = require("path");
const dir = path.resolve();
const viewPath = path.join(dir, "views");
const publicPath = path.join(dir, "public");
const { cars } = require("./models");
const uploadOnMemory = require("./uploadOnMemory.js");
const cloudinary = require("./cloudinary/cloudinary.js");

// Pasang JSON Parser middleware
app.use(express.json());
app.set("views", viewPath);
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(express.static(publicPath));

// Ini yang baru
//Home
app.get("/", async (req, res) => {
  const car = await cars.findAll();
  return res.render("index", { cars: car });
});

// Create Page
app.get("/createCar", (req, res) => {
  return res.render("createCar");
});

// Create Process
app.post("/createCar", uploadOnMemory.single("image"), (req, res) => {
  console.log(req.file);
  const fileBase64 = req.file.buffer.toString("base64");
  const file = `data:${req.file.mimetype};base64,${fileBase64}`;

  cloudinary.uploader.upload(file, async function (err, result) {
    if (!!err) {
      console.log(err);
      return res.status(400).json({
        message: "Gagal upload file!",
      });
    }

    const { name, price, size } = req.body;

    const car = await cars.create({ name, price, size, image: result.url });
    return res.redirect("/");
  });
});

// Update Page
app.get("/updateCar/:id", async (req, res) => {
  const car = await cars.findOne({ where: { id: req.params.id } });
  return res.render("updateCar", { car: car });
});

// Update Process
app.post("/updateCar/:id", uploadOnMemory.single("image"), async (req, res) => {
  const idCar = req.params.id;
  if (!req.file) {
    await cars.update(req.body, { where: { id: idCar } });
    // req.flash('update', 'Car succesfully updated');
    res.redirect("/");
    return;
  }
  const fileBase64 = req.file.buffer.toString("base64");
  const file = `data:${req.file.mimetype};base64,${fileBase64}`;

  cloudinary.uploader.upload(file, async function (err, result) {
    if (!!err) {
      console.log(err);
      return res.status(400).json({
        message: "Gagal upload file!",
      });
    }

    const { name, price, size } = req.body;

    await cars.update(
      { name, price, size, image: result.url },
      { where: { id: idCar } }
    );
    return res.redirect("/");
  });
});

// Delete Process
app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await cars.destroy({ where: { id } });
  return res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server listen on port http://localhost:${PORT}`);
});
