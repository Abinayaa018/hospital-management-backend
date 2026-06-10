const Invoice = require("../models/Invoice");
const createCrudController = require("./crudController");

module.exports = createCrudController(Invoice, "invoices");
