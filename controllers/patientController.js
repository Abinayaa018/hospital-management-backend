const Patient = require("../models/Patient");
const createCrudController = require("./crudController");

module.exports = createCrudController(Patient, "patients");
