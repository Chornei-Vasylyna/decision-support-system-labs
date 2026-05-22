import { API_ENDPOINTS } from "@/constants/api";
import { getJson } from "@/utils/http";

// Service
export const explanationService = {
	load: () => getJson(`${API_ENDPOINTS.explanation}/decision`),
};
