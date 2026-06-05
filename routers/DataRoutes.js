const express = require('express');
const router = express.Router();
const { Patient, Doctor, Appointment, Invoice, Medicine } = require('../Models');

// Generic CRUD factory
function crudRouter(Model) {
  const r = express.Router();
  r.get('/', async (req, res) => {
    try { res.json(await Model.find().sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ message: e.message }); }
  });
  r.post('/', async (req, res) => {
    try { res.status(201).json(await new Model(req.body).save()); }
    catch (e) { res.status(500).json({ message: e.message }); }
  });
  r.put('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
  r.delete('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
  return r;
}

router.use('/patients', crudRouter(Patient));
router.use('/doctors', crudRouter(Doctor));
router.use('/appointments', crudRouter(Appointment));
router.use('/invoices', crudRouter(Invoice));
router.use('/medicines', crudRouter(Medicine));

module.exports = router;
