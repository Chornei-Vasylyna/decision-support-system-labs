import { criteriaRepository } from "../repositories/criteriaRepository.js";

const normalizeCriteria = (data) => {
	const name = data?.name?.trim();
	const type = data?.type?.trim();
	const weight = Number(data?.weight);
	const description = data?.description?.trim() || "";

	if (!name) {
		throw new Error("Потрібна назва критерію");
	}

	if (!type || !["maximize", "minimize"].includes(type)) {
		throw new Error("Тип критерію має бути maximize або minimize");
	}

	if (!Number.isFinite(weight)) {
		throw new Error("Вага критерію має бути числом");
	}

	return { name, type, weight, description };
};

const validateWeightsLimit = async (newWeight, excludeId = null) => {
	const criteria = await criteriaRepository.getAll();

	const totalWeight = criteria.reduce((sum, criterion) => {
		if (excludeId && criterion.id === Number(excludeId)) {
			return sum;
		}

		return sum + Number(criterion.weight);
	}, 0);

	if (totalWeight + newWeight > 1) {
		throw new Error("Сума ваг не має перевищувати 1");
	}
};

export const criteriaService = {
	getAll: () => criteriaRepository.getAll(),
	create: async (data) => {
		const normalized = normalizeCriteria(data);
		await validateWeightsLimit(normalized.weight);
		return criteriaRepository.create(normalized);
	},
	update: async (id, data) => {
		const normalized = normalizeCriteria(data);
		await validateWeightsLimit(normalized.weight, id);
		const affectedRows = await criteriaRepository.update(id, normalized);

		if (!affectedRows) {
			throw new Error("Criterion not found");
		}

		return { id: Number(id), ...normalized };
	},
	remove: (id) => criteriaRepository.remove(id),
};
