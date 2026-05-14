import { useCallback, useEffect, useState } from "react";
import { rulesController } from "@/controllers/rulesController";
import FormPanel from "@/ui/FormPanel";
import ListTable from "@/ui/ListTable";
import { RowActions } from "@/ui/RowActions";

export const RulesPage = () => {
	const [rules, setRules] = useState([]);
	const [form, setForm] = useState({
		name: "",
		condition: "",
		action: "",
		enabled: true,
	});
	const [editingId, setEditingId] = useState(null);
	const [errors, setErrors] = useState({});
	const [status, setStatus] = useState("");

	const load = useCallback(async () => {
		try {
			const data = await rulesController.load();
			setRules(data || []);
		} catch (err) {
			setStatus(err.message || "Не вдалося завантажити правила");
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const v = rulesController.validate(form);
		setErrors(v);
		if (Object.keys(v).length > 0) return;
		try {
			if (editingId) {
				await rulesController.update(editingId, form);
				setStatus("Правило оновлено");
			} else {
				await rulesController.create(form);
				setStatus("Правило створено");
			}
			setForm({ name: "", condition: "", action: "", enabled: true });
			setEditingId(null);
			await load();
		} catch (err) {
			setStatus(err.message || "Помилка при збереженні правила");
		}
	};

	const handleEdit = (r) => {
		setForm({
			name: r.name,
			condition: r.condition,
			action: r.action,
			enabled: !!r.enabled,
		});
		setEditingId(r.id);
	};

	const handleRemove = async (id) => {
		if (!confirm("Видалити правило?")) return;
		try {
			await rulesController.remove(id);
			setStatus("Правило видалено");
			await load();
		} catch (err) {
			setStatus(err.message || "Не вдалося видалити правило");
		}
	};

	const handleRunEngine = async () => {
		try {
			await rulesController.runEngine();
			setStatus("Движок правил виконано");
			await load();
		} catch (err) {
			setStatus(err.message || "Не вдалося виконати движок правил");
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
						<input
							value={form.name}
							onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
							placeholder="Назва"
							className={`w-full border rounded-lg px-3 py-2 ${errors.name ? "border-red-400" : "border-stone-200"}`}
						/>
						{errors.name && (
							<p className="text-sm text-red-600 mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label htmlFor="rule-condition" className="text-sm text-stone-700">
							Умова (IF)
						</label>
						<textarea
							id="rule-condition"
							value={form.condition}
							onChange={(e) =>
								setForm((c) => ({ ...c, condition: e.target.value }))
							}
							className={`w-full border rounded-lg px-3 py-2 ${errors.condition ? "border-red-400" : "border-stone-200"}`}
						/>
						{errors.condition && (
							<p className="text-sm text-red-600 mt-1">{errors.condition}</p>
						)}
					</div>

					<div>
						<label htmlFor="rule-action" className="text-sm text-stone-700">
							Дія (THEN)
						</label>
						<textarea
							id="rule-action"
							value={form.action}
							onChange={(e) =>
								setForm((c) => ({ ...c, action: e.target.value }))
							}
							className={`w-full border rounded-lg px-3 py-2 ${errors.action ? "border-red-400" : "border-stone-200"}`}
						/>
						{errors.action && (
							<p className="text-sm text-red-600 mt-1">{errors.action}</p>
						)}
					</div>

					<label className="flex items-center gap-2 text-sm text-stone-700">
						<input
							type="checkbox"
							checked={!!form.enabled}
							onChange={(e) =>
								setForm((c) => ({ ...c, enabled: e.target.checked }))
							}
						/>{" "}
						Включено
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
							Виконати движок правил
						</button>
					</div>

					<ListTable
						headers={["Назва", "Умова", "Дія", "Статус"]}
						items={rules}
						renderRow={(r) => (
							<>
								<td className="px-3 py-2 text-sm text-stone-800">{r.name}</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{r.condition}
								</td>
								<td className="px-3 py-2 text-sm text-stone-600">{r.action}</td>
								<td className="px-3 py-2 text-sm text-stone-600">
									{r.enabled ? "Активне" : "Вимкнено"}
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
