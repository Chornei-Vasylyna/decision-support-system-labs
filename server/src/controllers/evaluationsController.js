import { evaluationsService } from "../services/evaluationsService.js";

export const evaluationsController = {
	getAll: async (_, res) => {
		try {
			const data = await evaluationsService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to fetch evaluations", error: error.message });
		}
	},

	getMatrix: async (_, res) => {
		try {
			const data = await evaluationsService.getMatrix();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({
					message: "Failed to fetch evaluation matrix",
					error: error.message,
				});
		}
	},

	upsertMany: async (req, res) => {
		try {
			const data = await evaluationsService.upsertMany(req.body?.evaluations);

			res.status(200).json({ updated: data.length });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	removeById: async (req, res) => {
		try {
			await evaluationsService.removeById(req.params.id);

			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to remove evaluation", error: error.message });
		}
	},
};
