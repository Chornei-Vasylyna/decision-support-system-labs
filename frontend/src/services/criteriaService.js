import { API_ENDPOINTS } from "@/constants/api";
import { useCriteriaStore } from "@/stores/useCriteriaStore";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

// API functions
const api = {
	getAll: () => getJson(API_ENDPOINTS.criteria),
	create: (data) => sendJson(API_ENDPOINTS.criteria, "POST", data),
	update: (id, data) =>
		sendJson(`${API_ENDPOINTS.criteria}/${id}`, "PUT", data),
	remove: (id) => sendWithoutBody(`${API_ENDPOINTS.criteria}/${id}`, "DELETE"),
};

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
		const data = await api.getAll();
		useCriteriaStore.getState().setCriteria(data);
	},

	create: async (data) => {
		const created = await api.create(data);
		useCriteriaStore.getState().addCriteria(created);
	},

	update: async (id, data) => {
		await api.update(id, data);
		useCriteriaStore.getState().updateCriteria({
			id,
			...data,
		});
	},

	remove: async (id) => {
		await api.remove(id);
		useCriteriaStore.getState().removeCriteria(id);
	},
};
