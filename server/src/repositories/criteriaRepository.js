import { db } from "../db/mysql.js";

export const criteriaRepository = {
	getAll: async () => {
		const [rows] = await db.query("SELECT * FROM criteria");
		return rows;
	},

	create: async (data) => {
		const [result] = await db.query(
			`INSERT INTO criteria
     (name, type, weight, description)
     VALUES (?, ?, ?, ?)`,
			[data.name, data.type, data.weight, data.description],
		);

		return {
			id: result.insertId,
			...data,
		};
	},

	update: async (id, data) => {
		await db.query(
			`UPDATE criteria
       SET name=?, type=?, weight=?
       WHERE id=?`,
			[data.name, data.type, data.weight, id],
		);
	},

	remove: async (id) => {
		await db.query("DELETE FROM criteria WHERE id=?", [id]);
	},
};
