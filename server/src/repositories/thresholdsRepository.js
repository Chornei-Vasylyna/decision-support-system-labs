import { db } from "../db/mysql.js";

export const thresholdsRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT
				t.criterion_id AS criterionId,
				t.threshold_value AS thresholdValue,
				c.name AS criterionName,
				c.type AS criterionType
			 FROM thresholds t
			 INNER JOIN criteria c ON c.id = t.criterion_id
			 ORDER BY t.criterion_id`,
		);

		return rows;
	},

	upsertMany: async (items) => {
		if (!items.length) {
			return [];
		}

		const values = items.map(({ criterionId, thresholdValue }) => [
			criterionId,
			thresholdValue,
		]);

		await db.query(
			`INSERT INTO thresholds (criterion_id, threshold_value)
			 VALUES ?
			 ON DUPLICATE KEY UPDATE threshold_value = VALUES(threshold_value)`,
			[values],
		);

		return items;
	},
};
