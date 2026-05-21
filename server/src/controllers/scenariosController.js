import { sensitivityService } from "../services/sensitivityService.js";

export const scenariosController = {
	getAll: async (_, res) => {
		try {
			const data = await sensitivityService.getScenarios();
			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Не вдалося отримати сценарії", error: error.message });
		}
	},

	create: async (req, res) => {
		try {
			const data = await sensitivityService.createScenario(req.body || {});
			res.status(201).json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	update: async (req, res) => {
		try {
			const data = await sensitivityService.updateScenario(
				req.params.id,
				req.body || {},
			);
			res.json(data);
		} catch (error) {
			const status = error.message === "Scenario not found" ? 404 : 400;
			res.status(status).json({ message: error.message });
		}
	},

	remove: async (req, res) => {
		try {
			await sensitivityService.removeScenario(req.params.id);
			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Не вдалося видалити сценарій", error: error.message });
		}
	},

	evaluateById: async (req, res) => {
		try {
			const data = await sensitivityService.evaluateScenarioById(req.params.id);
			res.json(data);
		} catch (error) {
			const status = error.message === "Scenario not found" ? 404 : 400;
			res.status(status).json({ message: error.message });
		}
	},

	evaluateAdHoc: async (req, res) => {
		try {
			const data = await sensitivityService.evaluateAdHocScenario(
				req.body || {},
			);
			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},
};
