// Scoring and normalization utilities for analysis and sensitivity
const EPSILON = 1e-9;

export const normalizeByCriterion = (
	criterion,
	evaluations,
	alternativeIds,
) => {
	const values = alternativeIds
		.map((alternativeId) => {
			const item = evaluations.find(
				(row) =>
					row.alternativeId === alternativeId &&
					row.criterionId === criterion.id,
			);
			return Number(item?.score);
		})
		.filter((value) => Number.isFinite(value));

	if (!values.length) {
		return new Map(alternativeIds.map((alternativeId) => [alternativeId, 0]));
	}

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min;
	const normalized = new Map();

	for (const alternativeId of alternativeIds) {
		const item = evaluations.find(
			(row) =>
				row.alternativeId === alternativeId && row.criterionId === criterion.id,
		);
		const raw = Number(item?.score);

		if (!Number.isFinite(raw)) {
			normalized.set(alternativeId, 0);
			continue;
		}

		if (range === 0) {
			normalized.set(alternativeId, 1);
			continue;
		}

		const value =
			criterion.type === "minimize" ? (max - raw) / range : (raw - min) / range;
		normalized.set(alternativeId, Math.max(0, Math.min(1, value)));
	}

	return normalized;
};

export const normalizeWeights = (criteria) => {
	const total = criteria.reduce(
		(sum, criterion) => sum + (Number(criterion.weight) || 0),
		0,
	);
	if (total <= 0) {
		return criteria.map((criterion) => ({ ...criterion, weight: 0 }));
	}

	return criteria.map((criterion) => ({
		...criterion,
		weight: (Number(criterion.weight) || 0) / total,
	}));
};

export const computeScores = ({ criteria, evaluations, method }) => {
	const alternativeIds = [
		...new Set(evaluations.map((row) => row.alternativeId)),
	];
	const scoreMap = new Map(
		alternativeIds.map((alternativeId) => [
			alternativeId,
			method === "additive" ? 0 : 1,
		]),
	);

	for (const criterion of criteria) {
		const normalized = normalizeByCriterion(
			criterion,
			evaluations,
			alternativeIds,
		);
		const weight = Number(criterion.weight) || 0;

		for (const alternativeId of alternativeIds) {
			const value = normalized.get(alternativeId) ?? 0;
			const current = scoreMap.get(alternativeId);

			if (method === "additive") {
				scoreMap.set(alternativeId, current + weight * value);
			} else if (method === "cautious") {
				scoreMap.set(alternativeId, Math.min(current, weight * value));
			} else {
				scoreMap.set(
					alternativeId,
					current * Math.max(value, EPSILON) ** Math.max(weight, 0),
				);
			}
		}
	}

	const ranking = [...scoreMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([alternativeId, score], index) => ({
			rank: index + 1,
			alternativeId,
			score,
		}));

	return ranking;
};

export const applyThresholds = ({
	ranking,
	evaluations,
	thresholds,
	criteriaById,
}) => {
	if (!Array.isArray(thresholds) || !thresholds.length) {
		return {
			feasibleRanking: ranking,
			excluded: [],
		};
	}

	const thresholdMap = new Map(
		thresholds.map((item) => [
			Number(item.criterionId),
			Number(item.thresholdValue),
		]),
	);

	const excludedSet = new Map();

	for (const row of evaluations) {
		const thresholdValue = thresholdMap.get(row.criterionId);
		if (!Number.isFinite(thresholdValue)) {
			continue;
		}

		const score = Number(row.score);
		const criterion = criteriaById.get(row.criterionId);
		if (!criterion || !Number.isFinite(score)) {
			continue;
		}

		const failed =
			(criterion.type === "maximize" && score < thresholdValue) ||
			(criterion.type === "minimize" && score > thresholdValue);

		if (failed) {
			excludedSet.set(row.alternativeId, {
				alternativeId: row.alternativeId,
				alternativeName: row.alternativeName,
				reason: `${criterion.name} threshold failed`,
			});
		}
	}

	const feasibleRanking = ranking.filter(
		(item) => !excludedSet.has(item.alternativeId),
	);

	return {
		feasibleRanking,
		excluded: Array.from(excludedSet.values()),
	};
};
