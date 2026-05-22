import ListTable from "@/ui/ListTable";
import { RowActions } from "@/ui/RowActions";

const actionTypeLabels = {
	adjust_percent: "Змінити на %",
	set_score: "Встановити оцінку",
	exclude_alternative: "Виключити альтернативу",
};

export const RulesList = ({
	criteria,
	rules,
	onEdit,
	onRemove,
	onRunEngine,
}) => {
	return (
		<div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-base font-medium text-stone-800">
					Існуючі правила
				</h2>
				<button
					type="button"
					onClick={onRunEngine}
					className="bg-stone-700 hover:bg-stone-800 text-white px-3 py-1 rounded-lg text-sm"
				>
					Виконати правила
				</button>
			</div>

			<ListTable
				headers={["Назва", "Критерій", "Умова", "Дія", "Статус"]}
				items={rules}
				renderRow={(rule) => {
					const criterionName = criteria.find(
						(criterion) => criterion.id === rule.criterionId,
					)?.name;

					return (
						<>
							<td className="px-3 py-2 text-sm text-stone-800">{rule.name}</td>
							<td className="px-3 py-2 text-sm text-stone-600">
								{criterionName || `ID: ${rule.criterionId}`}
							</td>
							<td className="px-3 py-2 text-sm text-stone-600">
								{rule.operator} {rule.conditionValue}
							</td>
							<td className="px-3 py-2 text-sm text-stone-600">
								{actionTypeLabels[rule.actionType] || rule.actionType} (
								{rule.actionValue})
							</td>
							<td className="px-3 py-2 text-sm text-stone-600">
								{rule.isActive ? "Активне" : "Вимкнено"}
							</td>
							<RowActions
								onEdit={() => onEdit(rule)}
								onRemove={() => onRemove(rule.id)}
							/>
						</>
					);
				}}
			/>
		</div>
	);
};

export default RulesList;
