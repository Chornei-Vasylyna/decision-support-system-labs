import { db } from "../db/mysql.js";

export const votingRepository = {
	getAll: async () => {
		const [rows] = await db.query(
			`SELECT
				v.id,
				v.voter_id AS voterId,
				v.criterion_id AS criterionId,
				v.vote_rank AS \`rank\`,
				c.name AS criterionName
			 FROM votes v
			 INNER JOIN criteria c ON c.id = v.criterion_id
			 ORDER BY v.voter_id, v.vote_rank`,
		);

		return rows;
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
			`INSERT INTO votes (voter_id, criterion_id, vote_rank)
			 VALUES ?
			 ON DUPLICATE KEY UPDATE vote_rank = VALUES(vote_rank)`,
			[values],
		);

		return items;
	},

	removeByVoter: async (voterId) => {
		await db.query("DELETE FROM votes WHERE voter_id = ?", [voterId]);
	},
};
