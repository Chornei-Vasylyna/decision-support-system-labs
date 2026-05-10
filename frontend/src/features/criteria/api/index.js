const BASE = "http://localhost:3000/criteria";

export const criteriaApi = {
	getAll: async () => {
		const res = await fetch(BASE);
		return res.json();
	},

	create: async (data) => {
		const res = await fetch(BASE, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		return res.json();
	},

	update: async (id, data) => {
		await fetch(`${BASE}/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	},

	remove: async (id) => {
		await fetch(`${BASE}/${id}`, {
			method: "DELETE",
		});
	},
};
