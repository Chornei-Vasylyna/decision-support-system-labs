import { alternativesRepository } from "../repositories/alternativesRepository.js";
import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";

const normalizeScore = (score) => {
	const numericScore = Number(score);

	if (!Number.isFinite(numericScore)) {
		throw new Error("Evaluation score must be a number");
	}

	return numericScore;
};

const normalizeEvaluationItem = (item) => {
	const alternativeId = Number(item?.alternativeId);
	const criterionId = Number(item?.criterionId);
	const score = normalizeScore(item?.score);

	if (!Number.isInteger(alternativeId) || alternativeId <= 0) {
		throw new Error("Evaluation alternativeId must be a positive integer");
	}

	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("Evaluation criterionId must be a positive integer");
	}

	return { alternativeId, criterionId, score };
};

const ensureReferenceExists = async (alternativeId, criterionId) => {
	const alternatives = await alternativesRepository.getAll();
	const criteria = await criteriaRepository.getAll();

	const alternativeExists = alternatives.some(
		(alternative) => alternative.id === alternativeId,
	);
	const criterionExists = criteria.some(
		(criterion) => criterion.id === criterionId,
	);

	if (!alternativeExists) {
		throw new Error(`Alternative ${alternativeId} not found`);
	}

	if (!criterionExists) {
		throw new Error(`Criterion ${criterionId} not found`);
	}
};

export const evaluationsService = {
	getAll: async () => evaluationsRepository.getAll(),
	getMatrix: async () => evaluationsRepository.getMatrix(),
	upsertMany: async (items) => {
		if (!Array.isArray(items)) {
			throw new Error("Evaluations must be an array");
		}

		const normalizedItems = items.map(normalizeEvaluationItem);

		for (const item of normalizedItems) {
			await ensureReferenceExists(item.alternativeId, item.criterionId);
		}

		return evaluationsRepository.upsertMany(normalizedItems);
	},
	removeById: async (id) => evaluationsRepository.removeById(id),
};
