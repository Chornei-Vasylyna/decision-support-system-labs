import { db } from "../db/mysql.js";

const parseConfig = (raw) => {
	if (!raw) {
		return {};
	}

	if (typeof raw === "object") {
		return raw;
	}

	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
};

export const scenariosRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT id, name, description, config_json AS configJson
			 FROM scenarios
			 ORDER BY id`,
		);

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			description: row.description,
			config: parseConfig(row.configJson),
		}));
	},

	getById: async (id) => {
		const [rows] = await db.query(
			`SELECT id, name, description, config_json AS configJson
			 FROM scenarios
			 WHERE id = ?`,
			[id],
		);

		if (!rows.length) {
			return null;
		}

		const row = rows[0];
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			config: parseConfig(row.configJson),
		};
	},

	create: async ({ name, description, config }) => {
		const [result] = await db.query(
			`INSERT INTO scenarios (name, description, config_json)
			 VALUES (?, ?, ?)`,
			[name, description, JSON.stringify(config || {})],
		);

		return {
			id: result.insertId,
			name,
			description,
			config: config || {},
		};
	},

	update: async (id, { name, description, config }) => {
		const [result] = await db.query(
			`UPDATE scenarios
			 SET name = ?, description = ?, config_json = ?
			 WHERE id = ?`,
			[name, description, JSON.stringify(config || {}), id],
		);

		return result.affectedRows;
	},

	remove: async (id) => {
		await db.query("DELETE FROM scenarios WHERE id = ?", [id]);
	},
};
