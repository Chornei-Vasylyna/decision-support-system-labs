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

const buildExportCsvUrl = ({ url }) => {
	if (!url) throw new Error("Потрібне посилання для імпорту");

	const mId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
	const mGid = url.match(/[?&]gid=(\d+)/);
	const id = mId ? mId[1] : null;
	const g = mGid ? mGid[1] : 0;
	if (!id) throw new Error("Не вдалося визначити ID аркуша з URL");
	return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${g}`;
};

const normalizeScore = (score) => {
	const numericScore = Number(score);

	if (!Number.isFinite(numericScore)) {
		throw new Error("Оцінка має бути числом");
	}

	return numericScore;
};

const normalizeEvaluationItem = (item) => {
	const alternativeId = Number(item?.alternativeId);
	const criterionId = Number(item?.criterionId);
	const score = normalizeScore(item?.score);

	if (!Number.isInteger(alternativeId) || alternativeId <= 0) {
		throw new Error("alternativeId оцінки має бути додатним цілим числом");
	}

	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("criterionId оцінки має бути додатним цілим числом");
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
		throw new Error(`Альтернативу ${alternativeId} не знайдено`);
	}

	if (!criterionExists) {
		throw new Error(`Критерій ${criterionId} не знайдено`);
	}
};

export const evaluationsService = {
	getAll: async () => evaluationsRepository.getAll(),
	getMatrix: async () => evaluationsRepository.getMatrix(),
	upsertMany: async (items) => {
		if (!Array.isArray(items)) {
			throw new Error("Оцінки мають бути масивом");
		}

		const normalizedItems = items.map(normalizeEvaluationItem);

		for (const item of normalizedItems) {
			await ensureReferenceExists(item.alternativeId, item.criterionId);
		}

		return evaluationsRepository.upsertMany(normalizedItems);
	},
	removeById: async (id) => evaluationsRepository.removeById(id),

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

		// header: [ Alternative, crit1, crit2, ... ]
		console.log(rows);
		const header = rows[0].map((h) => (h || "").toString().trim());
		if (header.length < 2)
			throw new Error("Аркуш має містити принаймні один стовпець критерію");

		const criterionNames = header.slice(1).map((h) => h || "");

		const { altByName, critByName } = await extractIdsByName();

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
			const altName = (row[0] || "").toString().trim();
			if (!altName) continue;

			const altKey = altName.toLowerCase();
			let alt = altByName.get(altKey);
			if (!alt) {
				if (!createMissing)
					throw new Error(`Альтернативу не знайдено: ${altName}`);
				alt = await alternativesRepository.create(altName, "(імпортовано)");
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

	consensus: async ({ scores, method = "arithmeticMean" }) => {
		const { consensusService } = await import("./consensusService.js");

		if (!consensusService[method]) {
			throw new Error(
				`Невідомий метод узгодження: ${method}. Доступні: arithmeticMean, geometricMean, median`,
			);
		}

		return consensusService[method](scores);
	},
};
