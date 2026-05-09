import { alternativesService } from "../services/alternativesService.js";

export const alternativesController = {
  getAll: async (_, res) => {
    const data = await alternativesService.getAll();

    res.json(data);
  },

  create: async (req, res) => {
    try {
      const { name, description } = req.body;

      const data = await alternativesService.create(name, description);

      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  remove: async (req, res) => {
    await alternativesService.remove(req.params.id);

    res.sendStatus(204);
  },
};
