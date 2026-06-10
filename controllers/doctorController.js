const Doctor = require("../models/Doctor");
const createCrudController = require("./crudController");

module.exports = createCrudController(Doctor, "doctors");
