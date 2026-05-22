import FormPanel from "@/ui/FormPanel";

const actionTypeLabels = {
	adjust_percent: "Змінити на %",
	set_score: "Встановити оцінку",
	exclude_alternative: "Виключити альтернативу",
};

const OPERATORS = [">", ">=", "<", "<=", "==", "!="];

const fieldBaseClass =
	"w-full border rounded-lg px-3 py-2 border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300";
const fieldErrorClass = "border-red-400 focus:ring-red-200";

const getFieldClassName = (hasError) =>
	`${fieldBaseClass} ${hasError ? fieldErrorClass : ""}`.trim();

const Field = ({ id, label, error, children }) => (
	<div>
		<label htmlFor={id} className="text-sm text-stone-700">
			{label}
		</label>
		{children}
		{error && <p className="text-sm text-red-600 mt-1">{error}</p>}
	</div>
);

const Pair = ({ children }) => <div className="flex gap-2">{children}</div>;

export const RuleForm = ({
	criteria,
	editingId,
	errors,
	form,
	onChange,
	onSubmit,
}) => {
	const isEditing = editingId !== null;

	return (
		<FormPanel
			title={isEditing ? "Редагувати правило" : "Нове правило"}
			submitLabel={isEditing ? "Оновити" : "Створити"}
			onSubmit={onSubmit}
		>
			<Field id="rule-name" label="Назва" error={errors.name}>
				<input
					id="rule-name"
					value={form.name}
					onChange={(e) => onChange("name", e.target.value)}
					placeholder="Назва правила"
					className={getFieldClassName(errors.name)}
				/>
			</Field>

			<Field id="rule-criterion" label="Критерій" error={errors.criterionId}>
				<select
					id="rule-criterion"
					value={form.criterionId}
					onChange={(e) => onChange("criterionId", e.target.value)}
					className={getFieldClassName(errors.criterionId)}
				>
					<option value="">Оберіть критерій</option>
					{criteria.map((criterion) => (
						<option key={criterion.id} value={criterion.id}>
							{criterion.name}
						</option>
					))}
				</select>
			</Field>

			<Pair>
				<div className="flex-1">
					<Field id="rule-operator" label="Оператор">
						<select
							id="rule-operator"
							value={form.operator}
							onChange={(e) => onChange("operator", e.target.value)}
							className={fieldBaseClass}
						>
							{OPERATORS.map((operator) => (
								<option key={operator} value={operator}>
									{operator}
								</option>
							))}
						</select>
					</Field>
				</div>
				<div className="flex-1">
					<Field
						id="rule-condition-value"
						label="Значення"
						error={errors.conditionValue}
					>
						<input
							id="rule-condition-value"
							type="number"
							value={form.conditionValue}
							onChange={(e) => onChange("conditionValue", e.target.value)}
							className={getFieldClassName(errors.conditionValue)}
						/>
					</Field>
				</div>
			</Pair>

			<Pair>
				<div className="flex-1">
					<Field id="rule-action-type" label="Тип дії">
						<select
							id="rule-action-type"
							value={form.actionType}
							onChange={(e) => onChange("actionType", e.target.value)}
							className={fieldBaseClass}
						>
							{Object.entries(actionTypeLabels).map(([actionType, label]) => (
								<option key={actionType} value={actionType}>
									{label}
								</option>
							))}
						</select>
					</Field>
				</div>
				<div className="flex-1">
					<Field
						id="rule-action-value"
						label="Значення дії"
						error={errors.actionValue}
					>
						<input
							id="rule-action-value"
							type="number"
							value={form.actionValue}
							onChange={(e) => onChange("actionValue", e.target.value)}
							className={getFieldClassName(errors.actionValue)}
						/>
					</Field>
				</div>
			</Pair>

			<label className="flex items-center gap-2 text-sm text-stone-700">
				<input
					type="checkbox"
					checked={!!form.isActive}
					onChange={(e) => onChange("isActive", e.target.checked ? 1 : 0)}
				/>{" "}
				Активне
			</label>
		</FormPanel>
	);
};

export default RuleForm;
