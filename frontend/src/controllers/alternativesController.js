import { alternativesApi } from "@/api/alternativesApi";
import { useAlternativesStore } from "@/stores/useAlternativesStore";

export const alternativesController = {
	validate: (form) => {
		const errors = {};

		if (!form?.name?.trim()) {
			errors.name = "Назва альтернативи обов'язкова";
		}

		return errors;
	},

	load: async () => {
		const data = await alternativesApi.getAll();

		useAlternativesStore.getState().setAlternatives(data);
	},

	create: async (payload) => {
		const newAlternative = await alternativesApi.create(payload);

		useAlternativesStore.getState().addAlternative(newAlternative);
	},

	update: async (id, payload) => {
		const updatedAlternative = await alternativesApi.update(id, payload);

		useAlternativesStore.getState().updateAlternative({
			id: Number(id),
			...updatedAlternative,
		});
	},

	remove: async (id) => {
		await alternativesApi.remove(id);

		useAlternativesStore.getState().removeAlternative(id);
	},
};
