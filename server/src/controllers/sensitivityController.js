import { sensitivityService } from "../services/sensitivityService.js";

export const sensitivityController = {
	analyzeWeights: async (req, res) => {
		try {
			const { method, step } = req.body || {};
			const data = await sensitivityService.analyzeWeights({ method, step });
			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
