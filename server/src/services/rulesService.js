import { criteriaRepository } from "../repositories/criteriaRepository.js";
import { evaluationsRepository } from "../repositories/evaluationsRepository.js";
import { rulesRepository } from "../repositories/rulesRepository.js";

const allowedOperators = new Set([">", ">=", "<", "<=", "==", "!="]);
const allowedActions = new Set([
	"adjust_percent",
	"set_score",
	"exclude_alternative",
]);

const compare = (left, operator, right) => {
	switch (operator) {
		case ">":
			return left > right;
		case ">=":
			return left >= right;
		case "<":
			return left < right;
		case "<=":
			return left <= right;
		case "==":
			return left === right;
		case "!=":
			return left !== right;
		default:
			return false;
	}
};

const normalizeRule = (rule) => {
	const name = (rule?.name || "").toString().trim();
	const criterionId = Number(rule?.criterionId);
	const operator = (rule?.operator || "").toString().trim();
	const conditionValue = Number(rule?.conditionValue);
	const actionType = (rule?.actionType || "").toString().trim();
	const actionValue = Number(rule?.actionValue ?? 0);
	const isActive = Number(rule?.isActive ?? 1) ? 1 : 0;

	if (!name) {
		throw new Error("Rule name required");
	}
	if (!Number.isInteger(criterionId) || criterionId <= 0) {
		throw new Error("criterionId must be a positive integer");
	}
	if (!allowedOperators.has(operator)) {
		throw new Error("Invalid operator");
	}
	if (!Number.isFinite(conditionValue)) {
		throw new Error("conditionValue must be numeric");
	}
	if (!allowedActions.has(actionType)) {
		throw new Error("Invalid actionType");
	}
	if (!Number.isFinite(actionValue)) {
		throw new Error("actionValue must be numeric");
	}

	return {
		name,
		criterionId,
		operator,
		conditionValue,
		actionType,
		actionValue,
		isActive,
	};
};

const applyRuleToScore = (score, actionType, actionValue) => {
	if (actionType === "adjust_percent") {
		return score * (1 + actionValue / 100);
	}
	if (actionType === "set_score") {
		return actionValue;
	}
	return score;
};

export const rulesService = {
	getAll: async () => rulesRepository.getAll(),

	create: async (rule) => {
		const normalized = normalizeRule(rule);
		const criteria = await criteriaRepository.getAll();
		if (!criteria.some((c) => c.id === normalized.criterionId)) {
			throw new Error(`Criterion ${normalized.criterionId} not found`);
		}

		return rulesRepository.create(normalized);
	},

	update: async (id, rule) => {
		const normalized = normalizeRule(rule);
		const affectedRows = await rulesRepository.update(id, normalized);
		if (!affectedRows) {
			throw new Error("Rule not found");
		}
		return { id: Number(id), ...normalized };
	},

	remove: async (id) => {
		await rulesRepository.remove(id);
	},

	apply: async ({ persist = false } = {}) => {
		const [rules, evaluations] = await Promise.all([
			rulesRepository.getAll(),
			evaluationsRepository.getAll(),
		]);

		const activeRules = rules.filter((rule) => Number(rule.isActive) === 1);
		const correctedEvaluations = evaluations.map((item) => ({ ...item }));
		const excludedAlternatives = new Map();
		const appliedRules = [];

		for (const rule of activeRules) {
			for (const item of correctedEvaluations) {
				if (item.criterionId !== rule.criterionId) {
					continue;
				}

				const score = Number(item.score);
				const conditionValue = Number(rule.conditionValue);
				if (
					!Number.isFinite(score) ||
					!compare(score, rule.operator, conditionValue)
				) {
					continue;
				}

				if (rule.actionType === "exclude_alternative") {
					excludedAlternatives.set(item.alternativeId, {
						alternativeId: item.alternativeId,
						alternativeName: item.alternativeName,
						ruleId: rule.id,
						ruleName: rule.name,
					});
					appliedRules.push({
						ruleId: rule.id,
						ruleName: rule.name,
						alternativeId: item.alternativeId,
						action: "excluded",
					});
					continue;
				}

				const newScore = applyRuleToScore(
					score,
					rule.actionType,
					Number(rule.actionValue),
				);
				item.score = Number(newScore);
				appliedRules.push({
					ruleId: rule.id,
					ruleName: rule.name,
					alternativeId: item.alternativeId,
					criterionId: item.criterionId,
					oldScore: score,
					newScore: item.score,
				});
			}
		}

		const excludedSet = new Set(excludedAlternatives.keys());
		const feasibleEvaluations = correctedEvaluations.filter(
			(item) => !excludedSet.has(item.alternativeId),
		);

		if (persist) {
			const updates = feasibleEvaluations.map((item) => ({
				alternativeId: item.alternativeId,
				criterionId: item.criterionId,
				score: Number(item.score),
			}));
			await evaluationsRepository.upsertMany(updates);
		}

		return {
			persisted: Boolean(persist),
			appliedRulesCount: appliedRules.length,
			excludedAlternatives: Array.from(excludedAlternatives.values()),
			appliedRules,
			resultingEvaluations: feasibleEvaluations,
		};
	},
};
