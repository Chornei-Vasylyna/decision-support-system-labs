import { rulesApi } from "@/api/rulesApi";

export const rulesController = {
	validate: (form) => {
		const errors = {};
		if (!form?.name || !form.name.trim())
			errors.name = "Назва правила обов'язкова";
		if (!form?.condition || !form.condition.trim())
			errors.condition = "Умова (IF) обов'язкова";
		if (!form?.action || !form.action.trim())
			errors.action = "Дія (THEN) обов'язкова";
		return errors;
	},

	load: async () => {
		return await rulesApi.getAll();
	},

	create: async (data) => {
		return await rulesApi.create(data);
	},

	update: async (id, data) => {
		return await rulesApi.update(id, data);
	},

	remove: async (id) => {
		return await rulesApi.remove(id);
	},

	runEngine: async () => rulesApi.run(),
};
