import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

// Service
export const thresholdsService = {
	load: () => getJson(API_ENDPOINTS.thresholds),

	upsertMany: (thresholds) =>
		sendJson(API_ENDPOINTS.thresholds, "PUT", { thresholds }),

	getFeasibleSet: () => getJson(API_ENDPOINTS.thresholdsFeasible),
};
