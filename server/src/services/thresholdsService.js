import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { thresholdsRepository } from "../repositories/thresholdsRepository.js";

const normalizeThresholds = (thresholds) => {
	if (!Array.isArray(thresholds) || !thresholds.length) {
		throw new Error("Thresholds array required and must not be empty");
	}

	return thresholds.map((item) => {
		const criterionId = Number(item?.criterionId);
		const thresholdValue = Number(item?.thresholdValue);

		if (!Number.isInteger(criterionId) || criterionId <= 0) {
			throw new Error("criterionId must be a positive integer");
		}

		if (!Number.isFinite(thresholdValue)) {
			throw new Error("thresholdValue must be a number");
		}

		return { criterionId, thresholdValue };
	});
};

export const thresholdsService = {
	getAll: async () => thresholdsRepository.getAll(),

	upsertMany: async (thresholds) => {
		const normalized = normalizeThresholds(thresholds);
		const criteria = await criteriaRepository.getAll();
		const criteriaSet = new Set(criteria.map((criterion) => criterion.id));

		for (const item of normalized) {
			if (!criteriaSet.has(item.criterionId)) {
				throw new Error(`Criterion ${item.criterionId} not found`);
			}
		}

		return thresholdsRepository.upsertMany(normalized);
	},

	getFeasibleSet: async () => {
		const [thresholds, matrixData] = await Promise.all([
			thresholdsRepository.getAll(),
			evaluationsRepository.getMatrix(),
		]);

		if (!thresholds.length) {
			return {
				thresholdsApplied: 0,
				feasibleAlternatives: matrixData.alternatives,
				excludedAlternatives: [],
			};
		}

		const thresholdMap = new Map(
			thresholds.map((item) => [item.criterionId, item]),
		);

		const feasibleAlternatives = [];
		const excludedAlternatives = [];

		for (const row of matrixData.matrix) {
			const failedCriteria = [];

			for (const [criterionIdString, score] of Object.entries(row.scores)) {
				const criterionId = Number(criterionIdString);
				const threshold = thresholdMap.get(criterionId);

				if (!threshold) {
					continue;
				}

				const numericScore = Number(score);
				if (!Number.isFinite(numericScore)) {
					failedCriteria.push({
						criterionId,
						criterionName: threshold.criterionName,
						reason: "No score",
					});
					continue;
				}

				if (
					(threshold.criterionType === "maximize" &&
						numericScore < threshold.thresholdValue) ||
					(threshold.criterionType === "minimize" &&
						numericScore > threshold.thresholdValue)
				) {
					failedCriteria.push({
						criterionId,
						criterionName: threshold.criterionName,
						score: numericScore,
						thresholdValue: threshold.thresholdValue,
						criterionType: threshold.criterionType,
					});
				}
			}

			if (failedCriteria.length) {
				excludedAlternatives.push({
					alternative: row.alternative,
					failedCriteria,
				});
			} else {
				feasibleAlternatives.push(row.alternative);
			}
		}

		return {
			thresholdsApplied: thresholds.length,
			feasibleAlternatives,
			excludedAlternatives,
		};
	},
};
