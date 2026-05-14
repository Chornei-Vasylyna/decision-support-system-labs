import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

export const analysisApi = {
	run: async (method) =>
		getJson(
			`${API_ENDPOINTS.analysisRun}?method=${encodeURIComponent(method)}`,
		),

	getLastResult: async () => getJson(API_ENDPOINTS.analysis),

	getScenarios: async () => getJson(API_ENDPOINTS.scenarios),

	applyScenario: async (id) =>
		sendJson(`${API_ENDPOINTS.scenarios}/${id}/apply`, "POST", {}),

	runSensitivity: async (params) =>
		sendJson(API_ENDPOINTS.sensitivity, "POST", params),
};
