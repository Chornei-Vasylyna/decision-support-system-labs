import { db } from "../db/mysql.js";

export const evaluationsRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT
				e.id,
				e.alternative_id AS alternativeId,
				e.criterion_id AS criterionId,
				e.score,
				a.name AS alternativeName,
				c.name AS criterionName,
				c.type AS criterionType
			 FROM evaluations e
			 INNER JOIN alternatives a ON a.id = e.alternative_id
			 INNER JOIN criteria c ON c.id = e.criterion_id
			 ORDER BY e.alternative_id, e.criterion_id`,
		);

		return rows;
	},

	getMatrix: async () => {
		const [alternatives] = await db.query(
			"SELECT id, name, description FROM alternatives ORDER BY id",
		);
		const [criteria] = await db.query(
			"SELECT id, name, type, weight, description FROM criteria ORDER BY id",
		);
		const [evaluations] = await db.query(
			"SELECT alternative_id AS alternativeId, criterion_id AS criterionId, score FROM evaluations",
		);

		const matrix = alternatives.map((alternative) => {
			const scores = {};

			for (const criterion of criteria) {
				scores[criterion.id] = null;
			}

			for (const evaluation of evaluations) {
				if (evaluation.alternativeId === alternative.id) {
					scores[evaluation.criterionId] = evaluation.score;
				}
			}

			return {
				alternative,
				scores,
			};
		});

		return { alternatives, criteria, matrix };
	},

	upsertMany: async (items) => {
		if (!items.length) {
			return [];
		}

		const values = items.map(({ alternativeId, criterionId, score }) => [
			alternativeId,
			criterionId,
			score,
		]);

		await db.query(
			`INSERT INTO evaluations (alternative_id, criterion_id, score)
			 VALUES ?
			 ON DUPLICATE KEY UPDATE score = VALUES(score)`,
			[values],
		);

		return items;
	},

	removeById: async (id) => {
		await db.query("DELETE FROM evaluations WHERE id = ?", [id]);
	},
};
