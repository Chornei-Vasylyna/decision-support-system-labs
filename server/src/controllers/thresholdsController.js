import { thresholdsService } from "../services/thresholdsService.js";

export const thresholdsController = {
	getAll: async (_, res) => {
		try {
			const data = await thresholdsService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to fetch thresholds", error: error.message });
		}
	},

	upsertMany: async (req, res) => {
		try {
			const data = await thresholdsService.upsertMany(req.body?.thresholds);

			res.json({ updated: data.length, thresholds: data });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	getFeasibleSet: async (_, res) => {
		try {
			const data = await thresholdsService.getFeasibleSet();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
