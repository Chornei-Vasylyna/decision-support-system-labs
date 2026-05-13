import { weightsService } from "../services/weightsService.js";

export const weightsController = {
	getAll: async (_, res) => {
		try {
			const data = await weightsService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to fetch criteria", error: error.message });
		}
	},

	updateMany: async (req, res) => {
		try {
			const data = await weightsService.updateMany(req.body?.criteria);

			res.json({ updated: data.length, criteria: data });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	applyVotingResults: async (req, res) => {
		try {
			const { method } = req.body || {};
			const data = await weightsService.applyVotingResults(method);

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
