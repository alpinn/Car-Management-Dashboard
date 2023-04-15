const {cars} = require("./models");
const cloudinary = require("./cloudinary");

async function handleCreateCar(req, res) {
  const fileBase64 = req.file.buffer.toString("base64");
  const file = `data:${req.file.mimetype};base64,${fileBase64}`;

    cloudinary.uploader.upload(file, async function (err, result) {
      if (!!err) {
        console.log(err);
        return res.status(400).json({
          message: "Gagal upload file!",
        });
      }

      const {title, author} = req.body;

      const car = await cars.create({title, author, coverImage: result.url});
      req.flash('info', 'Car succesfully created');
      res.redirect("/cars");
    });
}

function handleCreateCarForm(req, res) {
  res.render('cars/create');
}

function handleUpdateCarForm(req, res) {
  const car = req.car;
  res.render('cars/:id/update', {car});
}

async function handleListCars(req, res) {
  const allCars = await cars.findAll();

  res.render('cars/index', {cars: allCars, additional_data: "test test halo halo"});
}

function handleGetCar(req, res) {
  const car = req.car;

  res.status(200).json(car);
}

async function handleUpdateCar(req, res) {
  const idCar = req.params.id;
  if(!req.file){
    await cars.update(req.body, {where: {id: idCar}})
    req.flash('update', 'Car succesfully updated');
    res.redirect("/cars");
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

      const {title, author} = req.body;

      await cars.update({title, author, coverImage: result.url}, {where:{id: idCar}});
      req.flash('info', 'Car succesfully updated');
      res.redirect("/cars");
    });
}

async function handleDeleteCar(req, res) {
  const id = req.params.id;

  await cars.destroy({where:{id}});
  req.flash('delete', 'Car succesfully deleted');
  res.redirect("/cars");
}

module.exports = {
  handleCreateCar,
  handleListCars,
  handleGetCar,
  handleUpdateCar,
  handleDeleteCar,
  handleCreateCarForm,
  handleUpdateCarForm
};
