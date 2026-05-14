import { API_ENDPOINTS } from "@/constants/api";
import { getJson } from "@/utils/http";

export const explanationApi = {
	get: async () => getJson(API_ENDPOINTS.explanation),
};
