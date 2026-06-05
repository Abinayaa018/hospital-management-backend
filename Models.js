const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: String, age: Number, gender: String,
  phone: String, email: String, status: String,
  lastVisit: String, condition: String
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  name: String, specialty: String, phone: String,
  email: String, status: String, patients: Number,
  rating: Number, experience: String
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patientName: String, doctorName: String, date: String,
  time: String, type: String, status: String, department: String
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  patientName: String, date: String, amount: Number,
  status: String, items: [String]
}, { timestamps: true });

const medicineSchema = new mongoose.Schema({
  name: String, category: String, stock: Number,
  unit: String, price: Number, supplier: String,
  expiry: String, status: String
}, { timestamps: true });

module.exports = {
  Patient: mongoose.model('Patient', patientSchema),
  Doctor: mongoose.model('Doctor', doctorSchema),
  Appointment: mongoose.model('Appointment', appointmentSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Medicine: mongoose.model('Medicine', medicineSchema),
};
