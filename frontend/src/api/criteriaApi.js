import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

export const criteriaApi = {
	getAll: async () => getJson(API_ENDPOINTS.criteria),

	create: async (data) => sendJson(API_ENDPOINTS.criteria, "POST", data),

	update: async (id, data) =>
		sendWithoutBody(`${API_ENDPOINTS.criteria}/${id}`, "PUT", data),

	remove: async (id) =>
		sendWithoutBody(`${API_ENDPOINTS.criteria}/${id}`, "DELETE"),
};
