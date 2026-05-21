import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

// API functions
const votingApi = {
	getAll: () => getJson(API_ENDPOINTS.voting),
	importFromGoogle: (data) =>
		sendJson(API_ENDPOINTS.votingImport, "POST", data),
	getMethodResult: (method) => {
		const methodRoutes = {
			simpleMajority: "simple-majority",
			bordaCount: "borda-count",
			condorcet: "condorcet",
			approvalVoting: "approval",
		};

		const route = methodRoutes[method];
		if (!route) {
			throw new Error(`Unsupported voting method: ${method}`);
		}

		return getJson(`${API_ENDPOINTS.votingMethods}/${route}`);
	},
};

const weightsApi = {
	getAll: () => getJson(API_ENDPOINTS.weights),
	updateMany: (criteria) =>
		sendJson(API_ENDPOINTS.weights, "PATCH", { criteria }),
	applyVotingResults: (method) =>
		sendJson(API_ENDPOINTS.weightsApplyVoting, "POST", { method }),
};

// Validation constants
const VOTING_METHODS = [
	"simpleMajority",
	"bordaCount",
	"condorcet",
	"approvalVoting",
];

// Service with validation
export const votingService = {
	methods: VOTING_METHODS,

	validateImport: (form) => {
		const errors = {};

		if (!form?.url?.trim()) {
			errors.url = "Вкажіть URL";
		}

		return errors;
	},

	validateWeights: (criteria) => {
		const errors = {};

		criteria.forEach((criterion) => {
			const weight = Number(criterion.weight);
			if (Number.isNaN(weight)) {
				errors[criterion.id] = "Вага має бути числом";
			}
		});

		return errors;
	},

	loadVotes: () => votingApi.getAll(),

	importFromGoogle: (form) => votingApi.importFromGoogle(form),

	getMethodResult: (method) => votingApi.getMethodResult(method),

	updateWeights: (criteria) => weightsApi.updateMany(criteria),

	applyVotingResults: (method) => weightsApi.applyVotingResults(method),
};
