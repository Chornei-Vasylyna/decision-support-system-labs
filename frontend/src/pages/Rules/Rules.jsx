import { useCallback, useEffect, useState } from "react";
import { criteriaService } from "@/services/criteriaService";
import { rulesService } from "@/services/rulesService";
import RuleForm from "./RuleForm";
import RulesList from "./RulesList";

const DEFAULT_FORM = {
	name: "",
	criterionId: "",
	operator: ">",
	conditionValue: "",
	actionType: "adjust_percent",
	actionValue: "",
	isActive: 1,
};

export const RulesPage = () => {
	const [rules, setRules] = useState([]);
	const [criteria, setCriteria] = useState([]);
	const [form, setForm] = useState(DEFAULT_FORM);
	const [editingId, setEditingId] = useState(null);
	const [errors, setErrors] = useState({});
	const [status, setStatus] = useState("");

	const load = useCallback(async () => {
		try {
			const [rulesData, criteriaData] = await Promise.all([
				rulesService.load(),
				criteriaService.load(),
			]);
			setRules(rulesData || []);
			setCriteria(criteriaData || []);
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
			if (editingId !== null) {
				await rulesService.update(editingId, submitData);
				setStatus("Правило оновлено");
			} else {
				await rulesService.create(submitData);
				setStatus("Правило створено");
			}
			setForm(DEFAULT_FORM);
			setEditingId(null);
			await load();
		} catch (err) {
			setStatus(err.message || "Помилка при збереженні правила");
		}
	};

	const updateForm = useCallback((key, value) => {
		setForm((current) => ({ ...current, [key]: value }));
	}, []);

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
				<RuleForm
					criteria={criteria}
					editingId={editingId}
					errors={errors}
					form={form}
					onChange={updateForm}
					onSubmit={handleSubmit}
				/>

				<RulesList
					criteria={criteria}
					rules={rules}
					onEdit={handleEdit}
					onRemove={handleRemove}
					onRunEngine={handleRunEngine}
				/>
			</div>
		</div>
	);
};
