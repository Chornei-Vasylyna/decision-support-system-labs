import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { buildScores, rankItems } from "../utils/aggregation.js";

const EPSILON = 1e-9;

export const analysisService = {
	getRanking: async () => {
		const criteria = await criteriaRepository.getAll();
		const evaluations = await evaluationsRepository.getAll();

		if (!criteria.length) {
			throw new Error("Немає доступних критеріїв");
		}

		if (!evaluations.length) {
			throw new Error("Немає доступних оцінок");
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
