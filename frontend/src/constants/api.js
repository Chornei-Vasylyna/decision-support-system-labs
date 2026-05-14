const API_BASE_URL = "http://localhost:3000";

export const API_ENDPOINTS = {
	alternatives: `${API_BASE_URL}/alternatives`,
	evaluationsImport: `${API_BASE_URL}/evaluations/import-google`,
	evaluationsMatrix: `${API_BASE_URL}/evaluations/matrix`,
	criteria: `${API_BASE_URL}/criteria`,
	voting: `${API_BASE_URL}/voting`,
	votingImport: `${API_BASE_URL}/voting/import-google`,
	votingMethods: `${API_BASE_URL}/voting/method`,
	weights: `${API_BASE_URL}/weights`,
	weightsApplyVoting: `${API_BASE_URL}/weights/apply-voting`,
	analysis: `${API_BASE_URL}/analysis`,
	analysisRun: `${API_BASE_URL}/analysis/run`,
	scenarios: `${API_BASE_URL}/scenarios`,
	sensitivity: `${API_BASE_URL}/sensitivity`,
	rules: `${API_BASE_URL}/rules`,
	explanation: `${API_BASE_URL}/explanation`,
};
