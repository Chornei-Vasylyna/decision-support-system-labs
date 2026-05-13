import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

export const alternativesApi = {
	getAll: async () => getJson(API_ENDPOINTS.alternatives),

	create: async (data) => sendJson(API_ENDPOINTS.alternatives, "POST", data),

	update: async (id, data) =>
		sendJson(`${API_ENDPOINTS.alternatives}/${id}`, "PUT", data),

	remove: async (id) =>
		sendWithoutBody(`${API_ENDPOINTS.alternatives}/${id}`, "DELETE"),
};
