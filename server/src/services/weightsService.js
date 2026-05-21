import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { votingService } from "./votingService.js";

const normalizeWeights = (items) => {
	const total = items.reduce((sum, item) => sum + item.weight, 0);

	if (total <= 0) {
		throw new Error("Сумарна вага має бути більшою за нуль");
	}

	return items.map((item) => ({
		...item,
		weight: item.weight / total,
	}));
};

const extractScores = (ranking, method) => {
	return ranking.map((item) => {
		if (method === "simpleMajority") {
			return { criterionId: item.criterionId, weight: Number(item.votes) || 0 };
		}

		if (method === "bordaCount") {
			return {
				criterionId: item.criterionId,
				weight: Number(item.bordaScore) || 0,
			};
		}

		if (method === "condorcet") {
			return {
				criterionId: item.criterionId,
				weight: Number(item.condorcetWins) || 0,
			};
		}

		if (method === "approvalVoting") {
			return {
				criterionId: item.criterionId,
				weight: Number(item.approvals) || 0,
			};
		}

		return { criterionId: item.criterionId, weight: 0 };
	});
};

const getVotingResult = async (method) => {
	switch (method) {
		case "simpleMajority":
			return votingService.simpleMajority();
		case "bordaCount":
			return votingService.bordaCount();
		case "condorcet":
			return votingService.condorcet();
		case "approvalVoting":
			return votingService.approvalVoting();
		default:
			throw new Error("Некоректний метод голосування");
	}
};

export const weightsService = {
	getAll: async () => criteriaRepository.getAll(),

	updateMany: async (criteria) => {
		if (!Array.isArray(criteria) || !criteria.length) {
			throw new Error("Потрібен масив критеріїв, і він не може бути порожнім");
		}

		const updates = criteria.map((item) => {
			const id = Number(item?.id);
			const weight = Number(item?.weight);

			if (!Number.isInteger(id) || id <= 0) {
				throw new Error("ID критерію має бути додатним цілим числом");
			}

			if (!Number.isFinite(weight) || weight < 0) {
				throw new Error("Вага має бути невід'ємним числом");
			}

			return { id, weight };
		});

		for (const item of updates) {
			const affectedRows = await criteriaRepository.updateWeight(
				item.id,
				item.weight,
			);
			if (!affectedRows) {
				throw new Error(`Критерій ${item.id} не знайдено`);
			}
		}

		return updates;
	},

	applyVotingResults: async (method) => {
		const votingResult = await getVotingResult(method);
		if (!votingResult?.ranked?.length) {
			throw new Error("Немає доступних результатів голосування");
		}

		const weightedItems = extractScores(votingResult.ranked, method);
		const normalized = normalizeWeights(weightedItems);

		for (const item of normalized) {
			const affectedRows = await criteriaRepository.updateWeight(
				item.criterionId,
				item.weight,
			);
			if (!affectedRows) {
				throw new Error(`Критерій ${item.criterionId} не знайдено`);
			}
		}

		return {
			method,
			weights: normalized,
		};
	},
};
