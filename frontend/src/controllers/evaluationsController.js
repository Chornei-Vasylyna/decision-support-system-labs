import { evaluationsApi } from "@/api/evaluationsApi";

const normalizeImportForm = (form) => ({
	url: (form?.url || "").trim(),
	spreadsheetId: (form?.spreadsheetId || "").trim(),
	gid: (form?.gid || "").toString().trim(),
	createMissing: Boolean(form?.createMissing),
});

export const evaluationsController = {
	validateImport: (form) => {
		const errors = {};
		const normalized = normalizeImportForm(form);

		if (!normalized.url && !normalized.spreadsheetId) {
			errors.url = "Вкажіть URL або spreadsheetId";
		}

		if (normalized.gid && Number.isNaN(Number(normalized.gid))) {
			errors.gid = "gid має бути числом";
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

	load: async () => evaluationsApi.getMatrix(),

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

		return evaluationsApi.updateMatrix(evaluations);
	},

	importFromGoogle: async (form) => {
		const payload = normalizeImportForm(form);
		return evaluationsApi.importFromGoogle(payload);
	},
};
