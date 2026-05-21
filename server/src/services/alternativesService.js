import { alternativesRepository } from "../repositories/alternativesRepository.js";

export const alternativesService = {
	getAll: async () => {
		return await alternativesRepository.getAll();
	},

	create: async (name, description) => {
		if (!name?.trim()) {
			throw new Error("Потрібна назва альтернативи");
		}

		return await alternativesRepository.create(
			name.trim(),
			description?.trim() || "",
		);
	},

	update: async (id, name, description) => {
		if (!id) {
			throw new Error("Потрібен ID альтернативи");
		}

		if (!name?.trim()) {
			throw new Error("Потрібна назва альтернативи");
		}

		const affectedRows = await alternativesRepository.update(
			id,
			name.trim(),
			description?.trim() || "",
		);

		if (!affectedRows) {
			throw new Error("Альтернативу не знайдено");
		}

		return {
			id: Number(id),
			name: name.trim(),
			description: description?.trim() || "",
		};
	},

	remove: async (id) => {
		return await alternativesRepository.remove(id);
	},
};
