import { criteriaRepository } from "../repositories/criteriaRepository.js";

const normalizeCriteria = (data) => {
	const name = data?.name?.trim();
	const type = data?.type?.trim();
	const weight = Number(data?.weight);
	const description = data?.description?.trim() || "";

	if (!name) {
		throw new Error("Criterion name required");
	}

	if (!type || !["maximize", "minimize"].includes(type)) {
		throw new Error("Criterion type must be maximize or minimize");
	}

	if (!Number.isFinite(weight)) {
		throw new Error("Criterion weight must be a number");
	}

	return { name, type, weight, description };
};

export const criteriaService = {
	getAll: () => criteriaRepository.getAll(),
	create: (data) => criteriaRepository.create(normalizeCriteria(data)),
	update: async (id, data) => {
		const normalized = normalizeCriteria(data);
		const affectedRows = await criteriaRepository.update(id, normalized);

		if (!affectedRows) {
			throw new Error("Criterion not found");
		}

		return { id: Number(id), ...normalized };
	},
	remove: (id) => criteriaRepository.remove(id),
};
