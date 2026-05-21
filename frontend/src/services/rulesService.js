import { API_ENDPOINTS } from "@/constants/api";
import { getJson, sendJson, sendWithoutBody } from "@/utils/http";

// API functions
const api = {
	getAll: () => getJson(API_ENDPOINTS.rules),
	create: (data) => sendJson(API_ENDPOINTS.rules, "POST", data),
	update: (id, data) => sendJson(`${API_ENDPOINTS.rules}/${id}`, "PUT", data),
	remove: (id) => sendWithoutBody(`${API_ENDPOINTS.rules}/${id}`, "DELETE"),
	apply: () => sendJson(`${API_ENDPOINTS.rules}/apply`, "POST", {}),
};

// Validation constants
const ALLOWED_OPERATORS = [">", ">=", "<", "<=", "==", "!="];
const ALLOWED_ACTIONS = ["adjust_percent", "set_score", "exclude_alternative"];

// Service with validation
export const rulesService = {
	validate: (form) => {
		const errors = {};

		if (!form?.name || !form.name.trim()) {
			errors.name = "Назва правила обов'язкова";
		}

		if (!form?.criterionId) {
			errors.criterionId = "Критерій обов'язковий";
		}

		if (!form?.operator || !ALLOWED_OPERATORS.includes(form.operator)) {
			errors.operator = "Оператор невірний";
		}

		if (!Number.isFinite(Number(form?.conditionValue))) {
			errors.conditionValue = "Значення умови має бути числом";
		}

		if (!form?.actionType || !ALLOWED_ACTIONS.includes(form.actionType)) {
			errors.actionType = "Тип дії невірний";
		}

		if (!Number.isFinite(Number(form?.actionValue))) {
			errors.actionValue = "Значення дії має бути числом";
		}

		return errors;
	},

	load: () => api.getAll(),

	create: (data) => api.create(data),

	update: (id, data) => api.update(id, data),

	remove: (id) => api.remove(id),

	runEngine: () => api.apply(),
};
