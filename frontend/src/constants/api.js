const API_BASE_URL = "http://localhost:3000/api";

export const API_ENDPOINTS = {
	alternatives: `${API_BASE_URL}/alternatives`,
	evaluationsImport: `${API_BASE_URL}/evaluations/import-google`,
	evaluationsMatrix: `${API_BASE_URL}/evaluations/matrix`,
	evaluationsConsensus: `${API_BASE_URL}/evaluations/consensus`,
	criteria: `${API_BASE_URL}/criteria`,
	voting: `${API_BASE_URL}/voting`,
	votingImport: `${API_BASE_URL}/voting/import-google`,
	votingMethods: `${API_BASE_URL}/voting/method`,
	weights: `${API_BASE_URL}/weights`,
	weightsApplyVoting: `${API_BASE_URL}/weights/apply-voting`,
	analysisRanking: `${API_BASE_URL}/analysis/ranking`,
	scenarios: `${API_BASE_URL}/scenarios`,
	sensitivity: `${API_BASE_URL}/sensitivity`,
	rules: `${API_BASE_URL}/rules`,
	thresholds: `${API_BASE_URL}/thresholds`,
	thresholdsFeasible: `${API_BASE_URL}/thresholds/feasible`,
	explanation: `${API_BASE_URL}/explanation`,
};
