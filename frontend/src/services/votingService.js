import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson } from "@/utils/http";

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

	loadVotes: () => getJson(API_ENDPOINTS.voting),

	importFromGoogle: (form) =>
		sendJson(API_ENDPOINTS.votingImport, "POST", form),

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

	updateWeights: (criteria) =>
		sendJson(API_ENDPOINTS.weights, "PATCH", { criteria }),

	applyVotingResults: (method) =>
		sendJson(API_ENDPOINTS.weightsApplyVoting, "POST", { method }),
};
