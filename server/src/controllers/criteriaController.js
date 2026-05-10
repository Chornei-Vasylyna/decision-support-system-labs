import { criteriaService } from "../services/criteriaService.js";

export const criteriaController = {
	getAll: async (_, res) => {
		const data = await criteriaService.getAll();

		res.json(data);
	},

	create: async (req, res) => {
		const data = await criteriaService.create(req.body);

		res.status(201).json(data);
	},

	update: async (req, res) => {
		await criteriaService.update(req.params.id, req.body);

		res.sendStatus(200);
	},

	remove: async (req, res) => {
		await criteriaService.remove(req.params.id);

		res.sendStatus(204);
	},
};
