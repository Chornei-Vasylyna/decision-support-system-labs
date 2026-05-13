import { db } from "../db/mysql.js";

export const votingRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT
				v.id,
				v.voter_id AS voterId,
				v.criterion_id AS criterionId,
				v.rank,
				c.name AS criterionName
			 FROM votes v
			 INNER JOIN criteria c ON c.id = v.criterion_id
			 ORDER BY v.voter_id, v.rank`,
		);

		return rows;
	},

	getByCriterion: async (criterionId) => {
		const [rows] = await db.query(
			`SELECT voter_id AS voterId, criterion_id AS criterionId, rank
			 FROM votes
			 WHERE criterion_id = ?
			 ORDER BY voter_id, rank`,
			[criterionId],
		);

		return rows;
	},

	create: async (voterId, criterionId, rank) => {
		await db.query(
			`INSERT INTO votes (voter_id, criterion_id, rank)
			 VALUES (?, ?, ?)
			 ON DUPLICATE KEY UPDATE rank = VALUES(rank)`,
			[voterId, criterionId, rank],
		);

		return { voterId, criterionId, rank };
	},

	createMany: async (items) => {
		if (!items.length) {
			return [];
		}

		const values = items.map(({ voterId, criterionId, rank }) => [
			voterId,
			criterionId,
			rank,
		]);

		await db.query(
			`INSERT INTO votes (voter_id, criterion_id, rank)
			 VALUES ?
			 ON DUPLICATE KEY UPDATE rank = VALUES(rank)`,
			[values],
		);

		return items;
	},

	removeByVoter: async (voterId) => {
		await db.query("DELETE FROM votes WHERE voter_id = ?", [voterId]);
	},
};
