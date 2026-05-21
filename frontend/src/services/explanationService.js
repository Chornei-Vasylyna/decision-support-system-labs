import { API_ENDPOINTS } from "@/constants/api";
import { getJson } from "@/utils/http";

// API functions
const api = {
	get: () => getJson(`${API_ENDPOINTS.explanation}/decision`),
};

// Service
export const explanationService = {
	get: () => api.get(),

	load: () => api.get(),
};
