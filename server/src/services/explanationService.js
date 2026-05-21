import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { analysisService } from "./analysisService.js";
import { rulesService } from "./rulesService.js";
import { thresholdsService } from "./thresholdsService.js";

const EPSILON = 1e-9;

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

const buildCriterionTrace = ({
	method,
	criteria,
	evaluations,
	alternativeId,
}) => {
	const alternativeIds = [
		...new Set(evaluations.map((row) => row.alternativeId)),
	];

	const trace = criteria.map((criterion) => {
		const normalizedMap = normalizeByCriterion(
			criterion,
			evaluations,
			alternativeIds,
		);
		const normalizedScore = normalizedMap.get(alternativeId) ?? 0;
		const rawItem = evaluations.find(
			(row) =>
				row.alternativeId === alternativeId && row.criterionId === criterion.id,
		);
		const rawScore = Number(rawItem?.score);
		const weight = Number(criterion.weight) || 0;

		let contribution = 0;
		if (method === "additive") {
			contribution = weight * normalizedScore;
		} else if (method === "cautious") {
			contribution = Math.min(1, weight * normalizedScore);
		} else {
			contribution = Math.max(normalizedScore, EPSILON) ** Math.max(weight, 0);
		}

		return {
			criterionId: criterion.id,
			criterionName: criterion.name,
			criterionType: criterion.type,
			rawScore: Number.isFinite(rawScore) ? rawScore : null,
			normalizedScore,
			weight,
			contribution,
		};
	});

	return trace.sort((a, b) => b.contribution - a.contribution);
};

export const explanationService = {
	getDecisionExplanation: async ({ method = "additive" } = {}) => {
		const selectedMethod = ["additive", "cautious", "multiplicative"].includes(
			method,
		)
			? method
			: "additive";

		const [ranking, criteria, evaluations, rulesResult, feasibleSet] =
			await Promise.all([
				analysisService.getRanking(),
				criteriaRepository.getAll(),
				evaluationsRepository.getAll(),
				rulesService.apply({ persist: false }),
				thresholdsService.getFeasibleSet(),
			]);

		const methodRanking = ranking[selectedMethod] || [];
		if (!methodRanking.length) {
			throw new Error("Немає доступних даних ранжування");
		}

		const best = methodRanking[0];
		const alternativeRow = evaluations.find(
			(row) => row.alternativeId === best.alternativeId,
		);
		const alternativeName =
				alternativeRow?.alternativeName || `Альтернатива ${best.alternativeId}`;

		const criterionTrace = buildCriterionTrace({
			method: selectedMethod,
			criteria,
			evaluations,
			alternativeId: best.alternativeId,
		});

		const topInfluentialCriteria = criterionTrace.slice(0, 3);
		const appliedToBest = rulesResult.appliedRules.filter(
			(item) => item.alternativeId === best.alternativeId,
		);
		const excludedByThresholds = feasibleSet.excludedAlternatives.find(
			(item) => item.alternative.id === best.alternativeId,
		);

		return {
			method: selectedMethod,
			selectedAlternative: {
				id: best.alternativeId,
				name: alternativeName,
				score: best.score,
				rank: best.rank,
			},
			ranking: methodRanking,
			topInfluentialCriteria,
			criterionTrace,
			rules: {
				appliedRulesCount: appliedToBest.length,
				appliedRules: appliedToBest,
				excludedByRule: rulesResult.excludedAlternatives.some(
					(item) => item.alternativeId === best.alternativeId,
				),
			},
			thresholds: {
				isFeasible: !excludedByThresholds,
				reasons: excludedByThresholds?.failedCriteria || [],
			},
			summary: {
				message: `Альтернативу "${alternativeName}" обрано методом "${selectedMethod}" на основі найвищої інтегральної оцінки та зважених внесків критеріїв.`,
			},
		};
	},
};
