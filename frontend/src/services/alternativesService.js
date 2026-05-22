import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

export const alternativesService = {
	validate: (form) => {
		const errors = {};

		if (!form?.name?.trim()) {
			errors.name = "Назва альтернативи обов'язкова";
		}

		return errors;
	},

	load: () => getJson(API_ENDPOINTS.alternatives),

	create: (payload) => sendJson(API_ENDPOINTS.alternatives, "POST", payload),

	update: (id, payload) =>
		sendJson(`${API_ENDPOINTS.alternatives}/${id}`, "PUT", payload),

	remove: (id) =>
		sendWithoutBody(`${API_ENDPOINTS.alternatives}/${id}`, "DELETE"),
};
