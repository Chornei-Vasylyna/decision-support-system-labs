import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

const api = {
	getMatrix: () => getJson(API_ENDPOINTS.evaluationsMatrix),
	updateMatrix: (evaluations) =>
		sendJson(API_ENDPOINTS.evaluationsMatrix, "PUT", { evaluations }),
	importFromGoogle: (data) =>
		sendJson(API_ENDPOINTS.evaluationsImport, "POST", data),
	consensus: (scores, method = "arithmeticMean") =>
		sendJson(API_ENDPOINTS.evaluationsConsensus, "POST", { scores, method }),
};

const normalizeImportForm = (form) => ({
	url: (form?.url || "").trim(),
	createMissing: Boolean(form?.createMissing),
});

export const evaluationsService = {
	validateImport: (form) => {
		const errors = {};
		const normalized = normalizeImportForm(form);

		if (!normalized.url) {
			errors.url = "Вкажіть URL";
		}

		return errors;
	},

	validateMatrix: (matrixData) => {
		const errors = {};
		const rows = matrixData?.matrix || [];

		for (const row of rows) {
			for (const [criterionId, value] of Object.entries(row.scores || {})) {
				const numeric = Number(value);
				if (!Number.isFinite(numeric)) {
					errors[`${row.alternative.id}-${criterionId}`] =
						"Кожна клітинка має бути числом";
				}
			}
		}

		return errors;
	},

	load: () => api.getMatrix(),

	saveMatrix: async (matrixData) => {
		const evaluations = [];

		for (const row of matrixData?.matrix || []) {
			for (const [criterionId, value] of Object.entries(row.scores || {})) {
				evaluations.push({
					alternativeId: row.alternative.id,
					criterionId: Number(criterionId),
					score: Number(value),
				});
			}
		}

		return api.updateMatrix(evaluations);
	},

	importFromGoogle: (form) => {
		const payload = normalizeImportForm(form);
		return api.importFromGoogle(payload);
	},

	consensus: (scores, method) => api.consensus(scores, method),
};
