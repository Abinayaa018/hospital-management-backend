const { formatResponse } = require("../utils/formatters");

function createCrudController(Model, resource, options = {}) {
  return {
    getAll: async (req, res, next) => {
      try {
        const docs = await Model.find().sort({ createdAt: -1 });
        res.json(formatResponse(docs));
      } catch (error) {
        next(error);
      }
    },

    create: async (req, res, next) => {
      try {
        const payload = { ...req.body };

        if (options.beforeCreate) {
          await options.beforeCreate(payload, req);
        }

        const saved = await new Model(payload).save();
        res.status(201).json(formatResponse(saved));
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        let payload = { ...req.body };

        if (options.beforeUpdate) {
          const result = await options.beforeUpdate(payload, req, res);
          if (result === false) return;
          if (result) payload = result;
        }

        const doc = await Model.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!doc) return res.status(404).json({ message: "Not found" });
        res.json(formatResponse(doc));
      } catch (error) {
        next(error);
      }
    },

    remove: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted successfully" });
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCrudController;
