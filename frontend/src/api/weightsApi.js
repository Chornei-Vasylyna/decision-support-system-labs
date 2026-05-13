import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

export const weightsApi = {
	getAll: async () => getJson(API_ENDPOINTS.weights),

	updateMany: async (criteria) =>
		sendJson(API_ENDPOINTS.weights, "PATCH", { criteria }),

	applyVotingResults: async (method) =>
		sendJson(API_ENDPOINTS.weightsApplyVoting, "POST", { method }),
};
