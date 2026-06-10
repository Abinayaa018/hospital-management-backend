const Appointment = require("../models/Appointment");
const createCrudController = require("./crudController");

const doctorStatuses = ["Approved", "Declined", "Completed", "In Progress"];

module.exports = createCrudController(Appointment, "appointments", {
  beforeCreate: async (payload, req) => {
    payload.createdBy = req.user.id;
    payload.status = payload.status || "Pending";
  },
  beforeUpdate: async (payload, req, res) => {
    if (req.user.role !== "Doctor") return payload;

    if (!payload.status || !doctorStatuses.includes(payload.status)) {
      res.status(403).json({ message: "Doctors may only approve, decline, or complete appointments." });
      return false;
    }

    return { status: payload.status };
  },
});
