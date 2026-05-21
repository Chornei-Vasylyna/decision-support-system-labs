import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { scenariosRepository } from "../repositories/scenariosRepository.js";

import {
	applyThresholds,
	computeScores,
	normalizeWeights,
} from "../utils/scoring.js";

const evaluateConfig = async (config = {}) => {
	const [criteriaBase, evaluations] = await Promise.all([
		criteriaRepository.getAll(),
		evaluationsRepository.getAll(),
	]);

	if (!criteriaBase.length) {
		throw new Error("Немає доступних критеріїв");
	}
	if (!evaluations.length) {
		throw new Error("Немає доступних оцінок");
	}

	const criteria = criteriaBase.map((criterion) => ({ ...criterion }));

	if (Array.isArray(config.weightOverrides)) {
		const overrides = new Map(
			config.weightOverrides.map((item) => [
				Number(item.criterionId),
				Number(item.weight),
			]),
		);
		for (const criterion of criteria) {
			const override = overrides.get(criterion.id);
			if (Number.isFinite(override) && override >= 0) {
				criterion.weight = override;
			}
		}
	}

	const normalizedCriteria = normalizeWeights(criteria);
	const criteriaById = new Map(
		normalizedCriteria.map((criterion) => [criterion.id, criterion]),
	);
	const method = ["additive", "cautious", "multiplicative"].includes(
		config.method,
	)
		? config.method
		: "additive";

	const ranking = computeScores({
		criteria: normalizedCriteria,
		evaluations,
		method,
	});
	const thresholdResult = applyThresholds({
		ranking,
		evaluations,
		thresholds: config.thresholdOverrides || [],
		criteriaById,
	});

	return {
		method,
		criteria: normalizedCriteria.map((criterion) => ({
			id: criterion.id,
			name: criterion.name,
			weight: Number(criterion.weight),
		})),
		ranking,
		feasibleRanking: thresholdResult.feasibleRanking,
		excludedAlternatives: thresholdResult.excluded,
		bestAlternative: thresholdResult.feasibleRanking[0] || ranking[0] || null,
	};
};

export const sensitivityService = {
	analyzeWeights: async ({ method = "additive", step = 0.1 } = {}) => {
		const [criteriaBase, evaluations] = await Promise.all([
			criteriaRepository.getAll(),
			evaluationsRepository.getAll(),
		]);

		if (!criteriaBase.length) {
			throw new Error("Немає доступних критеріїв");
		}
		if (!evaluations.length) {
			throw new Error("Немає доступних оцінок");
		}

		const selectedMethod = ["additive", "cautious", "multiplicative"].includes(
			method,
		)
			? method
			: "additive";
		const delta = Number(step);
		if (!Number.isFinite(delta) || delta <= 0) {
			throw new Error("step має бути додатним числом");
		}

		const baselineCriteria = normalizeWeights(
			criteriaBase.map((criterion) => ({ ...criterion })),
		);
		const baselineRanking = computeScores({
			criteria: baselineCriteria,
			evaluations,
			method: selectedMethod,
		});
		const baselineWinner = baselineRanking[0] || null;

		const impacts = [];

		for (const criterion of baselineCriteria) {
			for (const direction of ["up", "down"]) {
				const adjusted = baselineCriteria.map((item) => ({ ...item }));
				const target = adjusted.find((item) => item.id === criterion.id);
				if (!target) {
					continue;
				}

				if (direction === "up") {
					target.weight = target.weight * (1 + delta);
				} else {
					target.weight = Math.max(0, target.weight * (1 - delta));
				}

				const normalizedAdjusted = normalizeWeights(adjusted);
				const ranking = computeScores({
					criteria: normalizedAdjusted,
					evaluations,
					method: selectedMethod,
				});
				const winner = ranking[0] || null;

				impacts.push({
					criterionId: criterion.id,
					criterionName: criterion.name,
					direction,
					step: delta,
					winner,
					winnerChanged:
						Boolean(winner && baselineWinner) &&
						winner.alternativeId !== baselineWinner.alternativeId,
				});
			}
		}

		return {
			method: selectedMethod,
			baseline: {
				winner: baselineWinner,
				ranking: baselineRanking,
			},
			impacts,
		};
	},

	getScenarios: async () => scenariosRepository.getAll(),

	createScenario: async ({ name, description = "", config = {} }) => {
		const normalizedName = (name || "").toString().trim();
		if (!normalizedName) {
			throw new Error("Потрібна назва сценарію");
		}

		return scenariosRepository.create({
			name: normalizedName,
			description: (description || "").toString().trim(),
			config,
		});
	},

	updateScenario: async (id, { name, description = "", config = {} }) => {
		const normalizedName = (name || "").toString().trim();
		if (!normalizedName) {
			throw new Error("Потрібна назва сценарію");
		}

		const affectedRows = await scenariosRepository.update(id, {
			name: normalizedName,
			description: (description || "").toString().trim(),
			config,
		});
		if (!affectedRows) {
			throw new Error("Сценарій не знайдено");
		}

		return { id: Number(id), name: normalizedName, description, config };
	},

	removeScenario: async (id) => {
		await scenariosRepository.remove(id);
	},

	evaluateScenarioById: async (id) => {
		const scenario = await scenariosRepository.getById(id);
		if (!scenario) {
			throw new Error("Сценарій не знайдено");
		}

		const result = await evaluateConfig(scenario.config || {});
		return {
			scenario,
			result,
		};
	},

	evaluateAdHocScenario: async (config) => {
		return evaluateConfig(config || {});
	},
};
