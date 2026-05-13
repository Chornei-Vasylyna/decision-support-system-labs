import { rulesService } from "../services/rulesService.js";

export const rulesController = {
	getAll: async (_, res) => {
		try {
			const data = await rulesService.getAll();
			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to fetch rules", error: error.message });
		}
	},

	create: async (req, res) => {
		try {
			const data = await rulesService.create(req.body);
			res.status(201).json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	update: async (req, res) => {
		try {
			const data = await rulesService.update(req.params.id, req.body);
			res.json(data);
		} catch (error) {
			const status = error.message === "Rule not found" ? 404 : 400;
			res.status(status).json({ message: error.message });
		}
	},

	remove: async (req, res) => {
		try {
			await rulesService.remove(req.params.id);
			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to remove rule", error: error.message });
		}
	},

	apply: async (req, res) => {
		try {
			const { persist = false } = req.body || {};
			const data = await rulesService.apply({ persist: Boolean(persist) });
			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
