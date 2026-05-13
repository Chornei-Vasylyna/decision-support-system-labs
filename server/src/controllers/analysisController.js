import { analysisService } from "../services/analysisService.js";

export const analysisController = {
	getRanking: async (_, res) => {
		try {
			const data = await analysisService.getRanking();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
