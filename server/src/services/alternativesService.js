import { alternativesRepository } from "../repositories/alternativesRepository.js";

export const alternativesService = {
	getAll: async () => {
		return await alternativesRepository.getAll();
	},

	create: async (name, description) => {
		if (!name?.trim()) {
			throw new Error("Alternative name required");
		}

		return await alternativesRepository.create(
			name.trim(),
			description?.trim() || "",
		);
	},

	update: async (id, name, description) => {
		if (!id) {
			throw new Error("Alternative id required");
		}

		if (!name?.trim()) {
			throw new Error("Alternative name required");
		}

		const affectedRows = await alternativesRepository.update(
			id,
			name.trim(),
			description?.trim() || "",
		);

		if (!affectedRows) {
			throw new Error("Alternative not found");
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
