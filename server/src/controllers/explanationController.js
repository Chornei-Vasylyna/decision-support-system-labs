import { explanationService } from "../services/explanationService.js";

export const explanationController = {
	getDecisionExplanation: async (req, res) => {
		try {
			const { method } = req.query || {};
			const data = await explanationService.getDecisionExplanation({ method });

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
