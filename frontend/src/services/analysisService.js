import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

// Service
const AGGREGATION_METHODS = ["additive", "cautious", "multiplicative"];

export const analysisService = {
	methods: AGGREGATION_METHODS,

	run: (method) =>
		getJson(
			`${API_ENDPOINTS.analysisRanking}?method=${encodeURIComponent(method)}`,
		),

	getScenarios: () => getJson(API_ENDPOINTS.scenarios),

	applyScenario: (id) =>
		sendJson(`${API_ENDPOINTS.scenarios}/${id}/evaluate`, "POST", {}),

	runSensitivity: (params) =>
		sendJson(API_ENDPOINTS.sensitivity, "POST", params),
};
