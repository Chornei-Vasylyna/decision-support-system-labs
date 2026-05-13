import { alternativesService } from "../services/alternativesService.js";

export const alternativesController = {
	getAll: async (_, res) => {
		try {
			const data = await alternativesService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({
					message: "Failed to fetch alternatives",
					error: error.message,
				});
		}
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
		try {
			await alternativesService.remove(req.params.id);

			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({
					message: "Failed to remove alternative",
					error: error.message,
				});
		}
	},
};
