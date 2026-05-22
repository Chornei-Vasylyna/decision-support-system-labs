import { API_ENDPOINTS } from "@/constants/api";
import { useCriteriaStore } from "@/stores/useCriteriaStore";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

// Service with validation and store management
export const criteriaService = {
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
		const data = await getJson(API_ENDPOINTS.criteria);
		useCriteriaStore.getState().setCriteria(data);
		return data;
	},

	create: async (data) => {
		const created = await sendJson(API_ENDPOINTS.criteria, "POST", data);
		useCriteriaStore.getState().addCriteria(created);
	},

	update: async (id, data) => {
		await sendJson(`${API_ENDPOINTS.criteria}/${id}`, "PUT", data);
		useCriteriaStore.getState().updateCriteria({
			id,
			...data,
		});
	},

	remove: async (id) => {
		await sendWithoutBody(`${API_ENDPOINTS.criteria}/${id}`, "DELETE");
		useCriteriaStore.getState().removeCriteria(id);
	},
};
