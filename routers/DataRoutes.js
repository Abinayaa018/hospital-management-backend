const express = require('express');
const router = express.Router();
const { Patient, Doctor, Appointment, Invoice, Medicine } = require('../Models');
const { authenticate, requireRole } = require('../auth');

const INDIAN_NUMBER_FORMAT = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91 ${digits.slice(1, 6)} ${digits.slice(6)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return phone;
}

function formatIndianCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return value;
  return `₹${INDIAN_NUMBER_FORMAT.format(Number(value))}`;
}

function formatDocument(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const data = doc.toObject ? doc.toObject() : { ...doc };

  if (typeof data.phone === 'string') {
    data.phone = formatIndianPhone(data.phone);
  }
  if (typeof data.amount === 'number') {
    data.amountINR = formatIndianCurrency(data.amount);
  }
  if (typeof data.price === 'number') {
    data.priceINR = formatIndianCurrency(data.price);
  }
  return data;
}

function formatResponse(value) {
  if (Array.isArray(value)) return value.map(formatDocument);
  return formatDocument(value);
}

function crudRouter(Model, resource) {
  const r = express.Router();
  r.use(authenticate);

  r.get('/', async (req, res) => {
    try {
      const docs = await Model.find().sort({ createdAt: -1 });
      res.json(formatResponse(docs));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  r.post('/', requireRole(resource === 'appointments' ? ['Admin', 'Doctor'] : ['Admin']), async (req, res) => {
    try {
      const payload = { ...req.body };
      if (req.user.role === 'Doctor' && resource === 'appointments') {
        payload.status = payload.status || 'Scheduled';
      }
      const saved = await new Model(payload).save();
      res.status(201).json(formatResponse(saved));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  r.put('/:id', requireRole(resource === 'appointments' ? ['Admin', 'Doctor'] : ['Admin']), async (req, res) => {
    try {
      if (req.user.role === 'Doctor' && resource === 'appointments') {
        const allowedStatuses = ['Approved', 'Declined', 'Scheduled', 'Confirmed', 'Pending', 'In Progress', 'Completed'];
        const { status } = req.body;
        if (!status || !allowedStatuses.includes(status)) {
          return res.status(403).json({ message: 'Doctors may only update appointment status.' });
        }
        const updated = await Model.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Not found' });
        return res.json(formatResponse(updated));
      }

      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(formatResponse(doc));
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  r.delete('/:id', requireRole(['Admin']), async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  return r;
}

router.use('/patients', crudRouter(Patient, 'patients'));
router.use('/doctors', crudRouter(Doctor, 'doctors'));
router.use('/appointments', crudRouter(Appointment, 'appointments'));
router.use('/invoices', crudRouter(Invoice, 'invoices'));
router.use('/medicines', crudRouter(Medicine, 'medicines'));

module.exports = router;
