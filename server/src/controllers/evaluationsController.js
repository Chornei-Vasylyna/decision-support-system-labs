import { evaluationsService } from "../services/evaluationsService.js";

export const evaluationsController = {
	getAll: async (_, res) => {
		try {
			const data = await evaluationsService.getAll();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Не вдалося отримати оцінки", error: error.message });
		}
	},

	getMatrix: async (_, res) => {
		try {
			const data = await evaluationsService.getMatrix();

			res.json(data);
		} catch (error) {
			res.status(500).json({
				message: "Не вдалося отримати матрицю оцінювання",
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

	importFromGoogle: async (req, res) => {
		try {
			const { url, createMissing = true } = req.body || {};

			const result = await evaluationsService.importFromGoogle({
				url,
				createMissing,
			});

			res.status(200).json({ imported: result });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	consensus: async (req, res) => {
		try {
			const { scores, method = "arithmeticMean" } = req.body || {};

			if (!Array.isArray(scores) || scores.length === 0) {
				return res
					.status(400)
					.json({ message: "Потрібен масив оцінок, і він не може бути порожнім" });
			}

			const result = await evaluationsService.consensus({ scores, method });

			res.status(200).json({ result, method, scoresCount: scores.length });
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
				.json({ message: "Не вдалося видалити оцінку", error: error.message });
		}
	},
};
