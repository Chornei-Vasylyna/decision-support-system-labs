import { parse } from "csv-parse/sync";
import { alternativesRepository } from "../repositories/alternativesRepository.js";
import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";

const extractIdsByName = async () => {
	const alternatives = await alternativesRepository.getAll();
	const criteria = await criteriaRepository.getAll();

	const altByName = new Map(
		alternatives.map((a) => [a.name.trim().toLowerCase(), a]),
	);
	const critByName = new Map(
		criteria.map((c) => [c.name.trim().toLowerCase(), c]),
	);

	return { altByName, critByName };
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

const normalizeScore = (score) => {
	const numericScore = Number(score);

	if (!Number.isFinite(numericScore)) {
		throw new Error("Evaluation score must be a number");
	}

	return numericScore;
};

const normalizeEvaluationItem = (item) => {
	const alternativeId = Number(item?.alternativeId);
	const criterionId = Number(item?.criterionId);
	const score = normalizeScore(item?.score);

	if (!Number.isInteger(alternativeId) || alternativeId <= 0) {
		throw new Error("Evaluation alternativeId must be a positive integer");
	}

	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("Evaluation criterionId must be a positive integer");
	}

	return { alternativeId, criterionId, score };
};

const ensureReferenceExists = async (alternativeId, criterionId) => {
	const alternatives = await alternativesRepository.getAll();
	const criteria = await criteriaRepository.getAll();

	const alternativeExists = alternatives.some(
		(alternative) => alternative.id === alternativeId,
	);
	const criterionExists = criteria.some(
		(criterion) => criterion.id === criterionId,
	);

	if (!alternativeExists) {
		throw new Error(`Alternative ${alternativeId} not found`);
	}

	if (!criterionExists) {
		throw new Error(`Criterion ${criterionId} not found`);
	}
};

export const evaluationsService = {
	getAll: async () => evaluationsRepository.getAll(),
	getMatrix: async () => evaluationsRepository.getMatrix(),
	upsertMany: async (items) => {
		if (!Array.isArray(items)) {
			throw new Error("Evaluations must be an array");
		}

		const normalizedItems = items.map(normalizeEvaluationItem);

		for (const item of normalizedItems) {
			await ensureReferenceExists(item.alternativeId, item.criterionId);
		}

		return evaluationsRepository.upsertMany(normalizedItems);
	},
	removeById: async (id) => evaluationsRepository.removeById(id),

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

		// header: [ Alternative, crit1, crit2, ... ]
		const header = rows[0].map((h) => (h || "").toString().trim());
		if (header.length < 2)
			throw new Error("Sheet must have at least one criterion column");

		const criterionNames = header.slice(1).map((h) => h || "");

		const { altByName, critByName } = await extractIdsByName();

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
			const altName = (row[0] || "").toString().trim();
			if (!altName) continue;

			const altKey = altName.toLowerCase();
			let alt = altByName.get(altKey);
			if (!alt) {
				if (!createMissing)
					throw new Error(`Alternative not found: ${altName}`);
				alt = await alternativesRepository.create(altName, "(imported)");
				altByName.set(altKey, alt);
			}

			for (let c = 0; c < criteriaIdList.length; c++) {
				const cell = (row[c + 1] || "").toString().trim();
				if (cell === "") continue; // skip empties
				const score = Number(cell.replace(",", "."));
				if (!Number.isFinite(score)) continue;

				items.push({
					alternativeId: alt.id,
					criterionId: criteriaIdList[c],
					score,
				});
			}
		}

		if (!items.length) return 0;

		await evaluationsRepository.upsertMany(items);

		return items.length;
	},
};
