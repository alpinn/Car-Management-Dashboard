const express = require("express");
const PORT = process.env.PORT || 8000;
const router = require("./routes/routes.js");
// const middleware = require("./middleware");
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
const PUBLIC_DIRECTORY = path.join(__dirname, "public");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.use(express.static(publicPath));

app.get("/", async (req, res) => {
  const car = await cars.findAll();
  res.render("index", { cars: car });
});

app.get("/createCar", (req, res) => {
  res.render("createCar");
});

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
    // req.flash('info', 'Car succesfully created');
    res.redirect("/");
  });
  // res.("createCar")
});

app.get("/updateCar/:id", async (req, res) => {
  const car = await cars.findOne({ where: { id: req.params.id } });
  res.render("updateCar", { car: car });
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  await cars.destroy({ where: { id } });
  // req.flash('delete', 'Car succesfully deleted');
  res.redirect("/");
});

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
    // req.flash('info', 'Car succesfully updated');
    res.redirect("/");
  });
});

// app.post("/cars", handler.handleCreateCar);
// app.get("/cars", handler.handleListCars);
// app.get("/cars/:id", middleware.setCar, handler.handleGetCar);
// app.put("/cars/:id", middleware.setCar, handler.handleUpdateCar);
// app.delete("/cars/:id", middleware.setCar, handler.handleDeleteCar);

app.listen(PORT, () => {
  console.log(`Server listen on port http://localhost:${PORT}`);
});
