import { alternativesController } from "@/controllers/alternativesController";
import useResourceList from "@/hooks/useResourceList";
import { useAlternativesStore } from "@/stores/useAlternativesStore";
import { FormPanel } from "@/ui/FormPanel";
import { ListTable } from "@/ui/ListTable";
import { RowActions } from "@/ui/RowActions";

export const AlternativesPage = () => {
	const { alternatives } = useAlternativesStore();

	const {
		form,
		setForm,
		handleEdit,
		handleSubmit,
		handleRemove,
		resetForm,
		editId,
	} = useResourceList({
		controller: alternativesController,
		initialForm: { name: "", description: "" },
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Альтеренативи</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Керування альтернативами
				</p>
			</div>

			<FormPanel
				onSubmit={handleSubmit}
				submitLabel={editId ? "Оновити" : "Додати"}
			>
				<input
					value={form.name || ""}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
					placeholder="Назва альтернативи"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
				/>
				<textarea
					value={form.description || ""}
					onChange={(e) => setForm({ ...form, description: e.target.value })}
					placeholder="Опис"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 min-h-28 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors resize-none"
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
				headers={["ID", "Назва", "Опис"]}
				items={alternatives}
				renderRow={(a, index) => (
					<>
						<td className="p-3 text-sm text-stone-600">{index + 1}</td>
						<td className="p-3 text-sm font-medium text-stone-800">{a.name}</td>
						<td className="p-3 text-sm text-stone-700">
							{a.description || "—"}
						</td>
						<RowActions
							onEdit={() => handleEdit(a)}
							onRemove={() => handleRemove(a.id)}
						/>
					</>
				)}
			/>
		</div>
	);
};
