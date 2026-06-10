const Medicine = require("../models/Medicine");
const createCrudController = require("./crudController");

module.exports = createCrudController(Medicine, "medicines");
