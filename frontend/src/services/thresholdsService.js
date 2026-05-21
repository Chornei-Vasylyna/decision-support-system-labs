import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

// API functions
const api = {
	getAll: () => getJson(API_ENDPOINTS.thresholds),
	upsertMany: (thresholds) =>
		sendJson(API_ENDPOINTS.thresholds, "PUT", { thresholds }),
	getFeasibleSet: () => getJson(API_ENDPOINTS.thresholdsFeasible),
};

// Service
export const thresholdsService = {
	load: () => api.getAll(),

	upsertMany: (thresholds) => api.upsertMany(thresholds),

	getFeasibleSet: () => api.getFeasibleSet(),
};
