import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

// API functions
const api = {
	getRanking: (method) =>
		getJson(
			`${API_ENDPOINTS.analysisRanking}?method=${encodeURIComponent(method)}`,
		),
	getScenarios: () => getJson(API_ENDPOINTS.scenarios),
	evaluateScenario: (id) =>
		sendJson(`${API_ENDPOINTS.scenarios}/${id}/evaluate`, "POST", {}),
	runSensitivity: (params) =>
		sendJson(API_ENDPOINTS.sensitivity, "POST", params),
};

// Service
const AGGREGATION_METHODS = ["additive", "cautious", "multiplicative"];

export const analysisService = {
	methods: AGGREGATION_METHODS,

	run: (method) => api.getRanking(method),

	getScenarios: () => api.getScenarios(),

	applyScenario: (id) => api.evaluateScenario(id),

	runSensitivity: (params) => api.runSensitivity(params),
};
