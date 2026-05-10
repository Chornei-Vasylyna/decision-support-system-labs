import { criteriaRepository } from "../repositories/criteriaRepository.js";

export const criteriaService = {
	getAll: () => criteriaRepository.getAll(),
	create: (data) => criteriaRepository.create(data),
	update: (id, data) => criteriaRepository.update(id, data),
	remove: (id) => criteriaRepository.remove(id),
};
