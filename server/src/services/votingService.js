import { parse } from "csv-parse/sync";
import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { votingRepository } from "../repositories/votingRepository.js";
import {
	approvalVoting,
	bordaCount,
	condorcet,
	simpleMajority,
} from "../utils/votingMethods.js";

const normalizeVote = (vote) => {
	const voterId = Number(vote?.voterId);
	const criterionId = Number(vote?.criterionId);
	const rank = Number(vote?.rank);

	if (!Number.isInteger(voterId) || voterId <= 0) {
		throw new Error("voterId голосу має бути додатним цілим числом");
	}

	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("criterionId голосу має бути додатним цілим числом");
	}

	if (!Number.isInteger(rank) || rank <= 0) {
		throw new Error("rank голосу має бути додатним цілим числом");
	}

	return { voterId, criterionId, rank };
};

const buildExportCsvUrl = ({ url }) => {
	if (!url) throw new Error("Потрібне посилання для імпорту");

	const mId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
	const mGid = url.match(/[?&]gid=(\d+)/);
	const id = mId ? mId[1] : null;
	const g = mGid ? mGid[1] : 0;
	if (!id) throw new Error("Не вдалося визначити ID аркуша з URL");
	return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${g}`;
};

const hashString = (str) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return (Math.abs(hash) % 1000000) + 1;
};

export const votingService = {
	getAllVotes: async () => votingRepository.getAll(),

	createVotes: async (votes) => {
		if (!Array.isArray(votes)) {
			throw new Error("Голоси мають бути масивом");
		}

		const normalized = votes.map(normalizeVote);

		return votingRepository.createMany(normalized);
	},

	simpleMajority: async () => {
		const votes = await votingRepository.getAll();
		return simpleMajority(votes, criteriaRepository);
	},

	bordaCount: async () => {
		const votes = await votingRepository.getAll();
		return bordaCount(votes, criteriaRepository);
	},

	condorcet: async () => {
		const votes = await votingRepository.getAll();
		return condorcet(votes, criteriaRepository);
	},

	approvalVoting: async () => {
		const votes = await votingRepository.getAll();
		return approvalVoting(votes, criteriaRepository);
	},

	importFromGoogle: async ({ url, createMissing = true }) => {
		const csvUrl = buildExportCsvUrl({ url });

		const resp = await fetch(csvUrl);
		if (!resp.ok) {
			throw new Error(
				`Не вдалося отримати аркуш: ${resp.status} ${resp.statusText}`,
			);
		}

		const text = await resp.text();
		const rows = parse(text, { bom: true, skip_empty_lines: true });

		if (!rows.length) throw new Error("Аркуш порожній");

		// header: [ Voter, crit1, crit2, ... ]
		const header = rows[0].map((h) => (h || "").toString().trim());
		if (header.length < 2)
			throw new Error("Аркуш має містити принаймні один стовпець критерію");

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
				if (!createMissing) throw new Error(`Критерій не знайдено: ${cname}`);
				crit = await criteriaRepository.create({
					name: cname,
					type: "maximize",
					weight: 1,
					description: "(імпортовано)",
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
			const scoredCriteria = [];

			for (let c = 0; c < criteriaIdList.length; c++) {
				const cell = (row[c + 1] || "").toString().trim();
				if (cell === "") continue; // skip empties
				const score = Number(cell.replace(",", "."));
				if (!Number.isFinite(score)) continue;

				scoredCriteria.push({
					criterionId: criteriaIdList[c],
					score,
					order: c,
				});
			}

			scoredCriteria
				.sort((a, b) => b.score - a.score || a.order - b.order)
				.forEach((item, index) => {
					items.push({
						voterId,
						criterionId: item.criterionId,
						rank: index + 1,
					});
				});
		}

		if (!items.length) return 0;

		await votingRepository.createMany(items);

		return items.length;
	},

	removeVotesByVoter: async (voterId) => {
		await votingRepository.removeByVoter(voterId);
	},
};
