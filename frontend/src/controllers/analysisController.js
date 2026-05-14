import { analysisApi } from "@/api/analysisApi";

const aggregationMethods = ["additive", "cautious", "multiplicative"];

export const analysisController = {
	methods: aggregationMethods,

	run: async (method) => analysisApi.run(method),

	getLastResult: async () => analysisApi.getLastResult(),

	getScenarios: async () => analysisApi.getScenarios(),

	applyScenario: async (id) => analysisApi.applyScenario(id),

	runSensitivity: async (params) => analysisApi.runSensitivity(params),
};
