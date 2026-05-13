import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { scenariosRepository } from "../repositories/scenariosRepository.js";

const EPSILON = 1e-9;

const normalizeWeights = (criteria) => {
	const total = criteria.reduce(
		(sum, criterion) => sum + (Number(criterion.weight) || 0),
		0,
	);
	if (total <= 0) {
		return criteria.map((criterion) => ({ ...criterion, weight: 0 }));
	}

	return criteria.map((criterion) => ({
		...criterion,
		weight: (Number(criterion.weight) || 0) / total,
	}));
};

const normalizeByCriterion = (criterion, evaluations, alternativeIds) => {
	const values = alternativeIds
		.map((alternativeId) => {
			const item = evaluations.find(
				(row) =>
					row.alternativeId === alternativeId &&
					row.criterionId === criterion.id,
			);
			return Number(item?.score);
		})
		.filter((value) => Number.isFinite(value));

	if (!values.length) {
		return new Map(alternativeIds.map((alternativeId) => [alternativeId, 0]));
	}

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min;
	const normalized = new Map();

	for (const alternativeId of alternativeIds) {
		const item = evaluations.find(
			(row) =>
				row.alternativeId === alternativeId && row.criterionId === criterion.id,
		);
		const raw = Number(item?.score);

		if (!Number.isFinite(raw)) {
			normalized.set(alternativeId, 0);
			continue;
		}

		if (range === 0) {
			normalized.set(alternativeId, 1);
			continue;
		}

		const value =
			criterion.type === "minimize" ? (max - raw) / range : (raw - min) / range;
		normalized.set(alternativeId, Math.max(0, Math.min(1, value)));
	}

	return normalized;
};

const computeScores = ({ criteria, evaluations, method }) => {
	const alternativeIds = [
		...new Set(evaluations.map((row) => row.alternativeId)),
	];
	const scoreMap = new Map(
		alternativeIds.map((alternativeId) => [
			alternativeId,
			method === "additive" ? 0 : 1,
		]),
	);

	for (const criterion of criteria) {
		const normalized = normalizeByCriterion(
			criterion,
			evaluations,
			alternativeIds,
		);
		const weight = Number(criterion.weight) || 0;

		for (const alternativeId of alternativeIds) {
			const value = normalized.get(alternativeId) ?? 0;
			const current = scoreMap.get(alternativeId);

			if (method === "additive") {
				scoreMap.set(alternativeId, current + weight * value);
			} else if (method === "cautious") {
				scoreMap.set(alternativeId, Math.min(current, weight * value));
			} else {
				scoreMap.set(
					alternativeId,
					current * Math.max(value, EPSILON) ** Math.max(weight, 0),
				);
			}
		}
	}

	const ranking = [...scoreMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([alternativeId, score], index) => ({
			rank: index + 1,
			alternativeId,
			score,
		}));

	return ranking;
};

const applyThresholds = ({
	ranking,
	evaluations,
	thresholds,
	criteriaById,
}) => {
	if (!Array.isArray(thresholds) || !thresholds.length) {
		return {
			feasibleRanking: ranking,
			excluded: [],
		};
	}

	const thresholdMap = new Map(
		thresholds.map((item) => [
			Number(item.criterionId),
			Number(item.thresholdValue),
		]),
	);

	const excludedSet = new Map();

	for (const row of evaluations) {
		const thresholdValue = thresholdMap.get(row.criterionId);
		if (!Number.isFinite(thresholdValue)) {
			continue;
		}

		const score = Number(row.score);
		const criterion = criteriaById.get(row.criterionId);
		if (!criterion || !Number.isFinite(score)) {
			continue;
		}

		const failed =
			(criterion.type === "maximize" && score < thresholdValue) ||
			(criterion.type === "minimize" && score > thresholdValue);

		if (failed) {
			excludedSet.set(row.alternativeId, {
				alternativeId: row.alternativeId,
				alternativeName: row.alternativeName,
				reason: `${criterion.name} threshold failed`,
			});
		}
	}

	const feasibleRanking = ranking.filter(
		(item) => !excludedSet.has(item.alternativeId),
	);

	return {
		feasibleRanking,
		excluded: Array.from(excludedSet.values()),
	};
};

const evaluateConfig = async (config = {}) => {
	const [criteriaBase, evaluations] = await Promise.all([
		criteriaRepository.getAll(),
		evaluationsRepository.getAll(),
	]);

	if (!criteriaBase.length) {
		throw new Error("No criteria available");
	}
	if (!evaluations.length) {
		throw new Error("No evaluations available");
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
			throw new Error("No criteria available");
		}
		if (!evaluations.length) {
			throw new Error("No evaluations available");
		}

		const selectedMethod = ["additive", "cautious", "multiplicative"].includes(
			method,
		)
			? method
			: "additive";
		const delta = Number(step);
		if (!Number.isFinite(delta) || delta <= 0) {
			throw new Error("step must be a positive number");
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
			throw new Error("Scenario name required");
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
			throw new Error("Scenario name required");
		}

		const affectedRows = await scenariosRepository.update(id, {
			name: normalizedName,
			description: (description || "").toString().trim(),
			config,
		});
		if (!affectedRows) {
			throw new Error("Scenario not found");
		}

		return { id: Number(id), name: normalizedName, description, config };
	},

	removeScenario: async (id) => {
		await scenariosRepository.remove(id);
	},

	evaluateScenarioById: async (id) => {
		const scenario = await scenariosRepository.getById(id);
		if (!scenario) {
			throw new Error("Scenario not found");
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
