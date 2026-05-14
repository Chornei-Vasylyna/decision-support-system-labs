import { explanationApi } from "@/api/explanationApi";

export const explanationController = {
	load: async () => explanationApi.get(),
};
