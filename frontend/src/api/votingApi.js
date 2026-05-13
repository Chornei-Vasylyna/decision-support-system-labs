import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

export const votingApi = {
	getAll: async () => getJson(API_ENDPOINTS.voting),

	importFromGoogle: async (data) =>
		sendJson(API_ENDPOINTS.votingImport, "POST", data),

	getMethodResult: async (method) =>
		getJson(`${API_ENDPOINTS.votingMethods}/${method}`),

	removeByVoter: async (voterId) =>
		sendWithoutBody(`${API_ENDPOINTS.voting}/${voterId}`, "DELETE"),
};
