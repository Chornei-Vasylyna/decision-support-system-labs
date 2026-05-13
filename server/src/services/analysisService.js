import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";

const EPSILON = 1e-9;

const normalizeCriterionValues = (criterionId, evaluations, alternativeIds) => {
	const values = alternativeIds
		.map((alternativeId) => {
			const evaluation = evaluations.find(
				(item) =>
					item.alternativeId === alternativeId &&
					item.criterionId === criterionId,
			);

			return Number(evaluation?.score);
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
		const evaluation = evaluations.find(
			(item) =>
				item.alternativeId === alternativeId &&
				item.criterionId === criterionId,
		);
		const rawValue = Number(evaluation?.score);
		if (!Number.isFinite(rawValue)) {
			normalized.set(alternativeId, 0);
			continue;
		}

		if (range === 0) {
			normalized.set(alternativeId, 1);
			continue;
		}

		const criterion = evaluations.find(
			(item) => item.criterionId === criterionId,
		);
		const type = criterion?.criterionType || "maximize";
		const normalizedValue =
			type === "minimize" ? (max - rawValue) / range : (rawValue - min) / range;

		normalized.set(alternativeId, Math.max(0, Math.min(1, normalizedValue)));
	}

	return normalized;
};

const buildNormalizedMatrix = (criteria, evaluations) => {
	const alternativeIds = [
		...new Set(evaluations.map((evaluation) => evaluation.alternativeId)),
	];

	const byCriterion = new Map();

	for (const criterion of criteria) {
		byCriterion.set(
			criterion.id,
			normalizeCriterionValues(criterion.id, evaluations, alternativeIds),
		);
	}

	return { alternativeIds, byCriterion };
};

const getWeightMap = (criteria) => {
	return new Map(
		criteria.map((criterion) => [criterion.id, Number(criterion.weight) || 0]),
	);
};

const rankItems = (scores) => {
	return [...scores.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([alternativeId, score], index) => ({
			rank: index + 1,
			alternativeId,
			score,
		}));
};

const buildScores = (criteria, evaluations, reducer) => {
	const { alternativeIds, byCriterion } = buildNormalizedMatrix(
		criteria,
		evaluations,
	);
	const weightMap = getWeightMap(criteria);
	const scores = new Map(
		alternativeIds.map((alternativeId) => [alternativeId, reducer.init()]),
	);

	for (const criterion of criteria) {
		const criterionWeights = byCriterion.get(criterion.id) || new Map();
		const weight = weightMap.get(criterion.id) || 0;

		for (const alternativeId of alternativeIds) {
			const normalizedScore = criterionWeights.get(alternativeId) ?? 0;
			scores.set(
				alternativeId,
				reducer.step(scores.get(alternativeId), normalizedScore, weight),
			);
		}
	}

	return scores;
};

export const analysisService = {
	getRanking: async () => {
		const criteria = await criteriaRepository.getAll();
		const evaluations = await evaluationsRepository.getAll();

		if (!criteria.length) {
			throw new Error("No criteria available");
		}

		if (!evaluations.length) {
			throw new Error("No evaluations available");
		}

		const additiveScores = buildScores(criteria, evaluations, {
			init: () => 0,
			step: (current, normalizedScore, weight) =>
				current + weight * normalizedScore,
		});

		const cautiousScores = buildScores(criteria, evaluations, {
			init: () => 1,
			step: (current, normalizedScore, weight) =>
				Math.min(current, weight * normalizedScore),
		});

		const multiplicativeScores = buildScores(criteria, evaluations, {
			init: () => 1,
			step: (current, normalizedScore, weight) =>
				current * Math.max(normalizedScore, EPSILON) ** Math.max(weight, 0),
		});

		return {
			additive: rankItems(additiveScores),
			cautious: rankItems(cautiousScores),
			multiplicative: rankItems(multiplicativeScores),
		};
	},
};
