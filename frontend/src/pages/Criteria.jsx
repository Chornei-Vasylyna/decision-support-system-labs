import { criteriaController } from "@/controllers/criteriaController";
import useResourceList from "@/hooks/useResourceList";
import { useCriteriaStore } from "@/stores/useCriteriaStore";
import { FormPanel } from "@/ui/FormPanel";
import { ListTable } from "@/ui/ListTable";
import { RowActions } from "@/ui/RowActions";

export const CriteriaPage = () => {
	const { criteria } = useCriteriaStore();

	const {
		form,
		setForm,
		handleEdit,
		handleSubmit,
		handleRemove,
		resetForm,
		editId,
	} = useResourceList({
		controller: criteriaController,
		initialForm: { name: "", type: "maximize", weight: 1, description: "" },
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Критерії</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Керування критеріями оцінювання
				</p>
			</div>

			<FormPanel
				onSubmit={handleSubmit}
				submitLabel={editId ? "Оновити критерій" : "Додати критерій"}
			>
				<input
					value={form.name || ""}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
					placeholder="Назва критерію"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-800 outline-none focus:border-stone-400"
				/>

				<select
					value={form.type || "maximize"}
					onChange={(e) => setForm({ ...form, type: e.target.value })}
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2"
				>
					<option value="maximize">Maximize</option>
					<option value="minimize">Minimize</option>
				</select>

				<input
					type="number"
					step="0.1"
					value={form.weight ?? 1}
					onChange={(e) => setForm({ ...form, weight: e.target.value })}
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2"
					placeholder="Вага"
				/>

				<textarea
					value={form.description || ""}
					onChange={(e) => setForm({ ...form, description: e.target.value })}
					placeholder="Опис"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 min-h-24 resize-none"
				/>

				{editId && (
					<button
						type="button"
						onClick={resetForm}
						className="text-sm text-stone-600 pr-4 cursor-pointer"
					>
						Скасувати
					</button>
				)}
			</FormPanel>

			<ListTable
				headers={["#", "Назва", "Тип", "Вага", "Опис"]}
				items={criteria}
				renderRow={(c, index) => (
					<>
						<td className="p-3 text-sm text-stone-600">{index + 1}</td>
						<td className="p-3 text-sm font-medium text-stone-800">{c.name}</td>
						<td className="p-3 text-sm text-stone-700">{c.type}</td>
						<td className="p-3 text-sm text-stone-700">{c.weight}</td>
						<td className="p-3 text-sm text-stone-700">
							{c.description || "—"}
						</td>
						<RowActions
							onEdit={() => handleEdit(c)}
							onRemove={() => handleRemove(c.id)}
						/>
					</>
				)}
			/>
		</div>
	);
};
