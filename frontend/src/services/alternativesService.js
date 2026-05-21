import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

const api = {
	getAll: () => getJson(API_ENDPOINTS.alternatives),
	create: (data) => sendJson(API_ENDPOINTS.alternatives, "POST", data),
	update: (id, data) =>
		sendJson(`${API_ENDPOINTS.alternatives}/${id}`, "PUT", data),
	remove: (id) =>
		sendWithoutBody(`${API_ENDPOINTS.alternatives}/${id}`, "DELETE"),
};

export const alternativesService = {
	validate: (form) => {
		const errors = {};

		if (!form?.name?.trim()) {
			errors.name = "Назва альтернативи обов'язкова";
		}

		return errors;
	},

	load: async () => {
		return api.getAll();
	},

	create: async (payload) => {
		return api.create(payload);
	},

	update: async (id, payload) => {
		return api.update(id, payload);
	},

	remove: async (id) => {
		return api.remove(id);
	},
};
