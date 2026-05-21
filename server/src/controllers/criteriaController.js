import { criteriaService } from "../services/criteriaService.js";

export const criteriaController = {
	getAll: async (_, res) => {
		try {
			const data = await criteriaService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Не вдалося отримати критерії", error: error.message });
		}
	},

	create: async (req, res) => {
		try {
			const data = await criteriaService.create(req.body);

			res.status(201).json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	update: async (req, res) => {
		try {
			const data = await criteriaService.update(req.params.id, req.body);

			res.json(data);
		} catch (error) {
			const status = error.message === "Criterion not found" ? 404 : 400;

			res.status(status).json({ message: error.message });
		}
	},

	remove: async (req, res) => {
		try {
			await criteriaService.remove(req.params.id);

			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Не вдалося видалити критерій", error: error.message });
		}
	},
};
