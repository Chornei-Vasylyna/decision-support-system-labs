import { votingApi } from "@/api/votingApi";
import { weightsApi } from "@/api/weightsApi";

const votingMethods = [
	"simpleMajority",
	"bordaCount",
	"condorcet",
	"approvalVoting",
];

export const votingController = {
	methods: votingMethods,

	validateImport: (form) => {
		const errors = {};

		if (!form?.url?.trim() && !form?.spreadsheetId?.trim()) {
			errors.url = "Вкажіть URL або spreadsheetId";
		}

		if (form?.gid && Number.isNaN(Number(form.gid))) {
			errors.gid = "gid має бути числом";
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

	loadVotes: async () => votingApi.getAll(),

	importFromGoogle: async (form) => votingApi.importFromGoogle(form),

	getMethodResult: async (method) => votingApi.getMethodResult(method),

	updateWeights: async (criteria) => weightsApi.updateMany(criteria),

	applyVotingResults: async (method) => weightsApi.applyVotingResults(method),
};
