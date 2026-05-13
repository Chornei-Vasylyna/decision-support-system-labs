import { db } from "../db/mysql.js";

export const rulesRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT
				r.id,
				r.name,
				r.criterion_id AS criterionId,
				r.operator,
				r.condition_value AS conditionValue,
				r.action_type AS actionType,
				r.action_value AS actionValue,
				r.is_active AS isActive,
				c.name AS criterionName
			 FROM rules r
			 INNER JOIN criteria c ON c.id = r.criterion_id
			 ORDER BY r.id`,
		);

		return rows;
	},

	create: async (rule) => {
		const [result] = await db.query(
			`INSERT INTO rules
			 (name, criterion_id, operator, condition_value, action_type, action_value, is_active)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				rule.name,
				rule.criterionId,
				rule.operator,
				rule.conditionValue,
				rule.actionType,
				rule.actionValue,
				rule.isActive,
			],
		);

		return { id: result.insertId, ...rule };
	},

	update: async (id, rule) => {
		const [result] = await db.query(
			`UPDATE rules
			 SET name = ?, criterion_id = ?, operator = ?, condition_value = ?,
			 action_type = ?, action_value = ?, is_active = ?
			 WHERE id = ?`,
			[
				rule.name,
				rule.criterionId,
				rule.operator,
				rule.conditionValue,
				rule.actionType,
				rule.actionValue,
				rule.isActive,
				id,
			],
		);

		return result.affectedRows;
	},

	remove: async (id) => {
		await db.query("DELETE FROM rules WHERE id = ?", [id]);
	},
};
