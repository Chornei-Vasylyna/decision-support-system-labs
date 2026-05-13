import { criteriaApi } from "@/api/criteriaApi";
import { useCriteriaStore } from "@/stores/useCriteriaStore";

export const criteriaController = {
	validate: (form) => {
		const errors = {};

		if (!form?.name?.trim()) {
			errors.name = "Назва критерію обов'язкова";
		}

		if (!form?.type || !["maximize", "minimize"].includes(form.type)) {
			errors.type = "Оберіть тип критерію";
		}

		if (form?.weight === "" || Number.isNaN(Number(form?.weight))) {
			errors.weight = "Вага має бути числом";
		}

		return errors;
	},

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
