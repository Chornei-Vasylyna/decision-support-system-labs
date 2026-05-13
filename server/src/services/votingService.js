import { parse } from "csv-parse/sync";
import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { votingRepository } from "../repositories/votingRepository.js";

const normalizeVote = (vote) => {
	const voterId = Number(vote?.voterId);
	const criterionId = Number(vote?.criterionId);
	const rank = Number(vote?.rank);

	if (!Number.isInteger(voterId) || voterId <= 0) {
		throw new Error("Vote voterId must be a positive integer");
	}

	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("Vote criterionId must be a positive integer");
	}

	if (!Number.isInteger(rank) || rank <= 0) {
		throw new Error("Vote rank must be a positive integer");
	}

	return { voterId, criterionId, rank };
};

export const votingService = {
	getAllVotes: async () => votingRepository.getAll(),

	createVote: async (voterId, criterionId, rank) => {
		const normalized = normalizeVote({ voterId, criterionId, rank });

		return votingRepository.create(
			normalized.voterId,
			normalized.criterionId,
			normalized.rank,
		);
	},

	createVotes: async (votes) => {
		if (!Array.isArray(votes)) {
			throw new Error("Votes must be an array");
		}

		const normalized = votes.map(normalizeVote);

		return votingRepository.createMany(normalized);
	},

	// Method 1: Simple Majority - criterion with most votes wins
	simpleMajority: async () => {
		const votes = await votingRepository.getAll();

		if (!votes.length) {
			throw new Error("No votes available");
		}

		const voteCount = new Map();

		for (const vote of votes) {
			const key = vote.criterionId;
			voteCount.set(key, (voteCount.get(key) || 0) + 1);
		}

		const ranked = Array.from(voteCount.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([criterionId, count]) => ({ criterionId, votes: count }));

		return { method: "Simple Majority", ranked };
	},

	// Method 2: Borda Count - rank-based scoring
	bordaCount: async () => {
		const votes = await votingRepository.getAll();

		if (!votes.length) {
			throw new Error("No votes available");
		}

		const criteria = await criteriaRepository.getAll();
		if (!criteria.length) {
			throw new Error("No criteria available");
		}

		// Group votes by criterion
		const votesByCriterion = new Map();
		for (const crit of criteria) {
			votesByCriterion.set(crit.id, []);
		}

		for (const vote of votes) {
			if (votesByCriterion.has(vote.criterionId)) {
				votesByCriterion.get(vote.criterionId).push(vote.rank);
			}
		}

		// Calculate Borda score: lower rank = higher score
		const scores = new Map();

		for (const [criterionId, ranks] of votesByCriterion.entries()) {
			let score = 0;

			// Find max rank to reverse scoring
			const maxRank = Math.max(...ranks, 1);

			for (const rank of ranks) {
				score += maxRank - rank + 1; // reverse scoring
			}

			scores.set(criterionId, score);
		}

		const ranked = Array.from(scores.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([criterionId, score]) => ({ criterionId, bordaScore: score }));

		return { method: "Borda Count", ranked };
	},

	// Method 3: Condorcet - pairwise comparisons
	condorcet: async () => {
		const votes = await votingRepository.getAll();

		if (!votes.length) {
			throw new Error("No votes available");
		}

		const criteria = await criteriaRepository.getAll();
		if (criteria.length < 2) {
			throw new Error("At least 2 criteria required for Condorcet");
		}

		// Group votes by voter
		const votesByVoter = new Map();

		for (const vote of votes) {
			if (!votesByVoter.has(vote.voterId)) {
				votesByVoter.set(vote.voterId, []);
			}

			votesByVoter
				.get(vote.voterId)
				.push({ criterionId: vote.criterionId, rank: vote.rank });
		}

		// Pairwise comparison: count wins
		const wins = new Map();

		for (const crit of criteria) {
			wins.set(crit.id, 0);
		}

		for (const [_, voterRanks] of votesByVoter.entries()) {
			for (let i = 0; i < voterRanks.length; i++) {
				for (let j = i + 1; j < voterRanks.length; j++) {
					const a = voterRanks[i];
					const b = voterRanks[j];

					// lower rank wins
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

		return { method: "Condorcet", ranked };
	},

	// Method 4: Approval Voting - criteria with rank 1 are approved
	approvalVoting: async () => {
		const votes = await votingRepository.getAll();

		if (!votes.length) {
			throw new Error("No votes available");
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

		return { method: "Approval Voting", ranked };
	},

	importFromGoogle: async ({
		url,
		spreadsheetId,
		gid,
		createMissing = true,
	}) => {
		const csvUrl = buildExportCsvUrl({ url, spreadsheetId, gid });

		const resp = await fetch(csvUrl);
		if (!resp.ok) {
			throw new Error(
				`Failed to fetch sheet: ${resp.status} ${resp.statusText}`,
			);
		}

		const text = await resp.text();
		const rows = parse(text, { bom: true, skip_empty_lines: true });

		if (!rows.length) throw new Error("Empty sheet");

		// header: [ Voter, crit1, crit2, ... ]
		const header = rows[0].map((h) => (h || "").toString().trim());
		if (header.length < 2)
			throw new Error("Sheet must have at least one criterion column");

		const criterionNames = header.slice(1).map((h) => h || "");

		const criteria = await criteriaRepository.getAll();
		const critByName = new Map(
			criteria.map((c) => [c.name.trim().toLowerCase(), c]),
		);

		// ensure criteria exist
		const criteriaIdList = [];
		for (const cname of criterionNames) {
			const key = cname.trim().toLowerCase();
			let crit = critByName.get(key);
			if (!crit) {
				if (!createMissing) throw new Error(`Criterion not found: ${cname}`);
				crit = await criteriaRepository.create({
					name: cname,
					type: "maximize",
					weight: 1,
					description: "(imported)",
				});
				critByName.set(key, crit);
			}
			criteriaIdList.push(crit.id);
		}

		const items = [];
		// iterate rows
		for (let r = 1; r < rows.length; r++) {
			const row = rows[r];
			if (!row.length) continue;
			const voterName = (row[0] || "").toString().trim();
			if (!voterName) continue;

			// Use hash of voter name as voterId
			const voterId = hashString(voterName);

			for (let c = 0; c < criteriaIdList.length; c++) {
				const cell = (row[c + 1] || "").toString().trim();
				if (cell === "") continue; // skip empties
				const rank = Number(cell.replace(",", "."));
				if (!Number.isInteger(rank) || rank <= 0) continue;

				items.push({ voterId, criterionId: criteriaIdList[c], rank });
			}
		}

		if (!items.length) return 0;

		await votingRepository.createMany(items);

		return items.length;
	},

	removeVotesByVoter: async (voterId) => {
		await votingRepository.removeByVoter(voterId);
	},
};

const buildExportCsvUrl = ({ url, spreadsheetId, gid }) => {
	if (url) {
		const mId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
		const mGid = url.match(/[?&]gid=(\d+)/);
		const id = mId ? mId[1] : null;
		const g = mGid ? mGid[1] : gid;
		if (!id) throw new Error("Cannot parse spreadsheetId from url");
		return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${g || 0}`;
	}

	if (!spreadsheetId) throw new Error("spreadsheetId or url required");
	return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid || 0}`;
};

// Simple hash function for voter names
const hashString = (str) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return (Math.abs(hash) % 1000000) + 1; // return positive number > 0
};
