import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

export const evaluationsApi = {
	getMatrix: async () => getJson(API_ENDPOINTS.evaluationsMatrix),

	updateMatrix: async (evaluations) =>
		sendJson(API_ENDPOINTS.evaluationsMatrix, "PUT", { evaluations }),

	importFromGoogle: async (data) =>
		sendJson(API_ENDPOINTS.evaluationsImport, "POST", data),
};
