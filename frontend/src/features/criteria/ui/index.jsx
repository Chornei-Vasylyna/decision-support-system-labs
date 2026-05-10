import { useEffect, useState } from "react";
import { criteriaController } from "@/features/criteria/controller";
import { useCriteriaStore } from "@/features/criteria/store";

export const CriteriaPage = () => {
	const { criteria } = useCriteriaStore();

	const [editId, setEditId] = useState(null);

	const [name, setName] = useState("");
	const [type, setType] = useState("maximize");
	const [weight, setWeight] = useState(1);
	const [description, setDescription] = useState("");

	useEffect(() => {
		criteriaController.load();
	}, []);

	const resetForm = () => {
		setName("");
		setType("maximize");
		setWeight(1);
		setDescription("");
		setEditId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim()) return;

		const payload = {
			name,
			type,
			weight: Number(weight),
			description,
		};

		if (editId) {
			await criteriaController.update(editId, payload);
		} else {
			await criteriaController.create(payload);
		}

		resetForm();
	};

	const handleEdit = (c) => {
		setEditId(c.id);
		setName(c.name);
		setType(c.type);
		setWeight(c.weight);
		setDescription(c.description || "");
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Критерії</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Керування критеріями оцінювання
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3"
			>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Назва критерію"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-800 outline-none focus:border-stone-400"
				/>

				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2"
				>
					<option value="maximize">Maximize</option>
					<option value="minimize">Minimize</option>
				</select>

				<input
					type="number"
					step="0.1"
					value={weight}
					onChange={(e) => setWeight(e.target.value)}
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2"
					placeholder="Вага"
				/>

				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Опис"
					className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 min-h-24 resize-none"
				/>

				<button
					type="submit"
					className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm"
				>
					{editId ? "Оновити критерій" : "Додати критерій"}
				</button>
			</form>

			<div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="bg-stone-200/60 border-b border-stone-200">
							<th className="p-3 text-left text-sm">#</th>
							<th className="p-3 text-left text-sm">Назва</th>
							<th className="p-3 text-left text-sm">Тип</th>
							<th className="p-3 text-left text-sm">Вага</th>
							<th className="p-3 text-left text-sm">Опис</th>
							<th className="p-3 text-right text-sm">Дії</th>
						</tr>
					</thead>

					<tbody>
						{criteria.map((c, index) => (
							<tr
								key={c.id}
								className="border-t border-stone-200 hover:bg-stone-100/60"
							>
								<td className="p-3 text-sm text-stone-600">{index + 1}</td>
								<td className="p-3 text-sm font-medium text-stone-800">
									{c.name}
								</td>
								<td className="p-3 text-sm text-stone-700">{c.type}</td>
								<td className="p-3 text-sm text-stone-700">{c.weight}</td>
								<td className="p-3 text-sm text-stone-700">
									{c.description || "—"}
								</td>

								<td className="p-3 text-right space-x-3">
									<button
										type="button"
										onClick={() => handleEdit(c)}
										className="text-sm text-blue-500 hover:text-blue-700"
									>
										Редагувати
									</button>

									<button
										type="button"
										onClick={() => criteriaController.remove(c.id)}
										className="text-sm text-stone-500 hover:text-red-500"
									>
										Видалити
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
