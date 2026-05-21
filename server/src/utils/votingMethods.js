// Voting methods implementations
export const simpleMajority = async (votes) => {
	if (!votes.length) {
		throw new Error("Немає доступних голосів");
	}

	const voteCount = new Map();

	for (const vote of votes) {
		const key = vote.criterionId;
		voteCount.set(key, (voteCount.get(key) || 0) + 1);
	}

	const ranked = Array.from(voteCount.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([criterionId, count]) => ({ criterionId, votes: count }));

	return { method: "Проста більшість", ranked };
};

export const bordaCount = async (votes, criteriaRepository) => {
	if (!votes.length) {
		throw new Error("Немає доступних голосів");
	}

	const criteria = await criteriaRepository.getAll();
	if (!criteria.length) {
		throw new Error("Немає доступних критеріїв");
	}

	const votesByCriterion = new Map();
	for (const crit of criteria) {
		votesByCriterion.set(crit.id, []);
	}

	for (const vote of votes) {
		if (votesByCriterion.has(vote.criterionId)) {
			votesByCriterion.get(vote.criterionId).push(vote.rank);
		}
	}

	const scores = new Map();

	for (const [criterionId, ranks] of votesByCriterion.entries()) {
		let score = 0;
		const maxRank = Math.max(...ranks, 1);

		for (const rank of ranks) {
			score += maxRank - rank + 1;
		}

		scores.set(criterionId, score);
	}

	const ranked = Array.from(scores.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([criterionId, score]) => ({ criterionId, bordaScore: score }));

	return { method: "Метод Борда", ranked };
};

export const condorcet = async (votes, criteriaRepository) => {
	if (!votes.length) {
		throw new Error("Немає доступних голосів");
	}

	const criteria = await criteriaRepository.getAll();
	if (criteria.length < 2) {
		throw new Error("Для методу Кондорсе потрібно щонайменше 2 критерії");
	}

	const votesByVoter = new Map();

	for (const vote of votes) {
		if (!votesByVoter.has(vote.voterId)) {
			votesByVoter.set(vote.voterId, []);
		}

		votesByVoter
			.get(vote.voterId)
			.push({ criterionId: vote.criterionId, rank: vote.rank });
	}

	const wins = new Map();

	for (const crit of criteria) {
		wins.set(crit.id, 0);
	}

	for (const [_, voterRanks] of votesByVoter.entries()) {
		for (let i = 0; i < voterRanks.length; i++) {
			for (let j = i + 1; j < voterRanks.length; j++) {
				const a = voterRanks[i];
				const b = voterRanks[j];

				if (a.rank < b.rank) {
					wins.set(a.criterionId, wins.get(a.criterionId) + 1);
				} else if (b.rank < a.rank) {
					wins.set(b.criterionId, wins.get(b.criterionId) + 1);
				}
			}
		}
	}

	const ranked = Array.from(wins.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([criterionId, condorcetWins]) => ({ criterionId, condorcetWins }));

	return { method: "Кондорсе", ranked };
};

export const approvalVoting = async (votes) => {
	if (!votes.length) {
		throw new Error("Немає доступних голосів");
	}

	const approvals = new Map();

	for (const vote of votes) {
		if (vote.rank === 1) {
			approvals.set(
				vote.criterionId,
				(approvals.get(vote.criterionId) || 0) + 1,
			);
		}
	}

	const ranked = Array.from(approvals.entries())
		.sort((a, b) => b[1] - a[1])
		.map(([criterionId, approvalCount]) => ({
			criterionId,
			approvals: approvalCount,
		}));

	return { method: "Відкрите голосування", ranked };
};
