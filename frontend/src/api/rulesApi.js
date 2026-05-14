import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

export const rulesApi = {
	getAll: async () => getJson(API_ENDPOINTS.rules),
	create: async (data) => sendJson(API_ENDPOINTS.rules, "POST", data),
	update: async (id, data) =>
		sendJson(`${API_ENDPOINTS.rules}/${id}`, "PUT", data),
	remove: async (id) =>
		sendWithoutBody(`${API_ENDPOINTS.rules}/${id}`, "DELETE"),
	run: async () => sendJson(`${API_ENDPOINTS.rules}/run`, "POST", {}),
};
