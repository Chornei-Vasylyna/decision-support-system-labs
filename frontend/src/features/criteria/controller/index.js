import { criteriaApi } from "@/features/criteria/api";
import { useCriteriaStore } from "@/features/criteria/store";

export const criteriaController = {
	load: async () => {
		const data = await criteriaApi.getAll();

		useCriteriaStore.getState().setCriteria(data);
	},

	create: async (data) => {
		const created = await criteriaApi.create(data);

		useCriteriaStore.getState().addCriteria(created);
	},

	update: async (id, data) => {
		await criteriaApi.update(id, data);

		useCriteriaStore.getState().updateCriteria({
			id,
			...data,
		});
	},

	remove: async (id) => {
		await criteriaApi.remove(id);

		useCriteriaStore.getState().removeCriteria(id);
	},
};
