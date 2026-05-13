import { db } from "../db/mysql.js";

export const alternativesRepository = {
	getAll: async () => {
		const [rows] = await db.query("SELECT * FROM alternatives ORDER BY id");

		return rows;
	},

	create: async (name, description) => {
		const [result] = await db.query(
			"INSERT INTO alternatives(name, description) VALUES (?, ?)",
			[name, description],
		);

		return {
			id: result.insertId,
			name,
			description,
		};
	},

	update: async (id, name, description) => {
		const [result] = await db.query(
			"UPDATE alternatives SET name = ?, description = ? WHERE id = ?",
			[name, description, id],
		);

		return result.affectedRows;
	},

	remove: async (id) => {
		await db.query("DELETE FROM alternatives WHERE id = ?", [id]);
	},
};
