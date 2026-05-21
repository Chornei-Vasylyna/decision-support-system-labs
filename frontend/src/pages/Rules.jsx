/** biome-ignore-all lint/a11y/noLabelWithoutControl: temp */
import { useCallback, useEffect, useState } from "react";
import { criteriaService } from "@/services/criteriaService";
import { rulesService } from "@/services/rulesService";
import FormPanel from "@/ui/FormPanel";
import ListTable from "@/ui/ListTable";
import { RowActions } from "@/ui/RowActions";

const actionTypeLabels = {
	adjust_percent: "Змінити на %",
	set_score: "Встановити оцінку",
	exclude_alternative: "Виключити альтернативу",
};

export const RulesPage = () => {
	const [rules, setRules] = useState([]);
	const [criteria, setCriteria] = useState([]);
	const [form, setForm] = useState({
		name: "",
		criterionId: "",
		operator: ">",
		conditionValue: "",
		actionType: "adjust_percent",
		actionValue: "",
		isActive: 1,
	});
	const [editingId, setEditingId] = useState(null);
	const [errors, setErrors] = useState({});
	const [status, setStatus] = useState("");

	const operators = [">", ">=", "<", "<=", "==", "!="];
	const actionTypes = ["adjust_percent", "set_score", "exclude_alternative"];

	const load = useCallback(async () => {
		try {
			const data = await rulesService.load();
			setRules(data || []);
			const critData = await criteriaService.load();
			setCriteria(critData || []);
		} catch (err) {
			setStatus(err.message || "Не вдалося завантажити дані");
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const v = rulesService.validate(form);
		setErrors(v);
		if (Object.keys(v).length > 0) return;
		try {
			const submitData = {
				...form,
				criterionId: Number(form.criterionId),
				conditionValue: Number(form.conditionValue),
				actionValue: Number(form.actionValue),
				isActive: Number(form.isActive),
			};
			if (editingId) {
				await rulesService.update(editingId, submitData);
				setStatus("Правило оновлено");
			} else {
				await rulesService.create(submitData);
				setStatus("Правило створено");
			}
			setForm({
				name: "",
				criterionId: "",
				operator: ">",
				conditionValue: "",
				actionType: "adjust_percent",
				actionValue: "",
				isActive: 1,
			});
			setEditingId(null);
			await load();
		} catch (err) {
			setStatus(err.message || "Помилка при збереженні правила");
		}
	};

	const handleEdit = (r) => {
		setForm({
			name: r.name,
			criterionId: String(r.criterionId),
			operator: r.operator,
			conditionValue: String(r.conditionValue),
			actionType: r.actionType,
			actionValue: String(r.actionValue),
			isActive: Number(r.isActive),
		});
		setEditingId(r.id);
	};

	const handleRemove = async (id) => {
		if (!confirm("Видалити правило?")) return;
		try {
			await rulesService.remove(id);
			setStatus("Правило видалено");
			await load();
		} catch (err) {
			setStatus(err.message || "Не вдалося видалити правило");
		}
	};

	const handleRunEngine = async () => {
		try {
			await rulesService.runEngine();
			setStatus("Механізм правил виконано");
			await load();
		} catch (err) {
			setStatus(err.message || "Не вдалося виконати механізм правил");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Правила</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Створення та керування IF→THEN правилами
				</p>
			</div>

			{status && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{status}
				</div>
			)}

			<div className="grid md:grid-cols-2 gap-4">
				<FormPanel
					title={editingId ? "Редагувати правило" : "Нове правило"}
					submitLabel={editingId ? "Оновити" : "Створити"}
					onSubmit={handleSubmit}
				>
					<div>
						<label className="text-sm text-stone-700">Назва</label>
						<input
							value={form.name}
							onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
							placeholder="Назва правила"
							className={`w-full border rounded-lg px-3 py-2 ${errors.name ? "border-red-400" : "border-stone-200"}`}
						/>
						{errors.name && (
							<p className="text-sm text-red-600 mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label className="text-sm text-stone-700">Критерій</label>
						<select
							value={form.criterionId}
							onChange={(e) =>
								setForm((c) => ({ ...c, criterionId: e.target.value }))
							}
							className={`w-full border rounded-lg px-3 py-2 ${errors.criterionId ? "border-red-400" : "border-stone-200"}`}
						>
							<option value="">Оберіть критерій</option>
							{criteria.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
						{errors.criterionId && (
							<p className="text-sm text-red-600 mt-1">{errors.criterionId}</p>
						)}
					</div>

					<div className="flex gap-2">
						<div className="flex-1">
							<label className="text-sm text-stone-700">Оператор</label>
							<select
								value={form.operator}
								onChange={(e) =>
									setForm((c) => ({ ...c, operator: e.target.value }))
								}
								className="w-full border rounded-lg px-3 py-2 border-stone-200"
							>
								{operators.map((op) => (
									<option key={op} value={op}>
										{op}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<label className="text-sm text-stone-700">Значення</label>
							<input
								type="number"
								value={form.conditionValue}
								onChange={(e) =>
									setForm((c) => ({
										...c,
										conditionValue: e.target.value,
									}))
								}
								className={`w-full border rounded-lg px-3 py-2 ${errors.conditionValue ? "border-red-400" : "border-stone-200"}`}
							/>
							{errors.conditionValue && (
								<p className="text-sm text-red-600 mt-1">
									{errors.conditionValue}
								</p>
							)}
						</div>
					</div>

					<div className="flex gap-2">
						<div className="flex-1">
							<label className="text-sm text-stone-700">Тип дії</label>
							<select
								value={form.actionType}
								onChange={(e) =>
									setForm((c) => ({ ...c, actionType: e.target.value }))
								}
								className="w-full border rounded-lg px-3 py-2 border-stone-200"
							>
								{actionTypes.map((at) => (
									<option key={at} value={at}>
										{actionTypeLabels[at]}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<label className="text-sm text-stone-700">Значення дії</label>
							<input
								type="number"
								value={form.actionValue}
								onChange={(e) =>
									setForm((c) => ({
										...c,
										actionValue: e.target.value,
									}))
								}
								className={`w-full border rounded-lg px-3 py-2 ${errors.actionValue ? "border-red-400" : "border-stone-200"}`}
							/>
							{errors.actionValue && (
								<p className="text-sm text-red-600 mt-1">
									{errors.actionValue}
								</p>
							)}
						</div>
					</div>

					<label className="flex items-center gap-2 text-sm text-stone-700">
						<input
							type="checkbox"
							checked={!!form.isActive}
							onChange={(e) =>
								setForm((c) => ({ ...c, isActive: e.target.checked ? 1 : 0 }))
							}
						/>{" "}
						Активне
					</label>
				</FormPanel>

				<div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-base font-medium text-stone-800">
							Існуючі правила
						</h2>
						<button
							type="button"
							onClick={handleRunEngine}
							className="bg-stone-700 hover:bg-stone-800 text-white px-3 py-1 rounded-lg text-sm"
						>
							Виконати правила
						</button>
					</div>

					<ListTable
						headers={["Назва", "Критерій", "Умова", "Дія", "Статус"]}
						items={rules}
						renderRow={(r) => (
							<>
								<td className="px-3 py-2 text-sm text-stone-800">{r.name}</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{criteria.find((c) => c.id === r.criterionId)?.name ||
										`ID: ${r.criterionId}`}
								</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{r.operator} {r.conditionValue}
								</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{actionTypeLabels[r.actionType] || r.actionType} ({r.actionValue})
								</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{r.isActive ? "Активне" : "Вимкнено"}
								</td>
								<RowActions
									onEdit={() => handleEdit(r)}
									onRemove={() => handleRemove(r.id)}
								/>
							</>
						)}
					/>
				</div>
			</div>
		</div>
	);
};
