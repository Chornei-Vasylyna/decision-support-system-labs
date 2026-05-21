import { useCallback, useEffect, useState } from "react";
import { criteriaService } from "@/services/criteriaService";
import { thresholdsService } from "@/services/thresholdsService";

export const ConstraintsPage = () => {
	const [thresholds, setThresholds] = useState([]);
	const [feasibleSet, setFeasibleSet] = useState(null);
	const [criteria, setCriteria] = useState([]);
	const [formValues, setFormValues] = useState({});
	const [status, setStatus] = useState("");

	const load = useCallback(async () => {
		try {
			const tData = await thresholdsService.load();
			const cData = await criteriaService.load();
			setCriteria(cData || []);
			setThresholds(tData || []);

			// Инициализиируем форму
			const values = {};
			(cData || []).forEach((c) => {
				const existing = (tData || []).find((t) => t.criterionId === c.id);
				values[c.id] = existing?.thresholdValue ?? "";
			});
			setFormValues(values);
		} catch (err) {
			setStatus(err.message || "Не вдалося завантажити дані");
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const handleChangeThreshold = (criterionId, value) => {
		setFormValues((prev) => ({
			...prev,
			[criterionId]: value,
		}));
	};

	const handleSave = async () => {
		try {
			const thresholdList = Object.entries(formValues)
				.filter(([_, value]) => value !== "" && value !== null)
				.map(([criterionId, thresholdValue]) => ({
					criterionId: Number(criterionId),
					thresholdValue: Number(thresholdValue),
				}));

			if (thresholdList.length === 0) {
				setStatus("Додайте принаймні одне порогове значення");
				return;
			}

			await thresholdsService.upsertMany(thresholdList);
			setStatus("Порогові значення збережено");
			await load();
		} catch (err) {
			setStatus(err.message || "Не вдалося зберегти дані");
		}
	};

	const handleGetFeasibleSet = async () => {
		try {
			const result = await thresholdsService.getFeasibleSet();
			setFeasibleSet(result);
			setStatus("Множину допустимих альтернатив завантажено");
		} catch (err) {
			setStatus(err.message || "Не вдалося завантажити множину");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Порогові обмеження
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Встановлення порогових значень для критеріїв та формування множини
					допустимих альтернатив
				</p>
			</div>

			{status && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{status}
				</div>
			)}

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-semibold text-stone-800 mb-4">
					Встановлення порогів
				</h2>
				<div className="space-y-3">
					{criteria.length > 0 ? (
						criteria.map((c) => (
							<div key={c.id} className="flex items-end gap-3">
								<div className="flex-1">
									{/** biome-ignore lint/a11y/noLabelWithoutControl: temp */}
									<label className="text-sm text-stone-700 block mb-1">
										{c.name}
									</label>
									<p className="text-xs text-stone-500 mb-2">
										Тип:{" "}
										{c.type === "maximize" ? "Максимізація" : "Мінімізація"}
									</p>
									<input
										type="number"
										value={formValues[c.id] ?? ""}
										onChange={(e) =>
											handleChangeThreshold(c.id, e.target.value)
										}
										placeholder="Порогове значення"
										className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
									/>
								</div>
							</div>
						))
					) : (
						<p className="text-sm text-stone-600">
							Критеріїв не знайдено. Додайте критерії спочатку.
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={handleSave}
					className="mt-4 bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
				>
					Зберегти пороги
				</button>
			</section>

			{/* Поточні пороги */}
			{thresholds.length > 0 && (
				<section className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-semibold text-stone-800 mb-4">
						Поточні порогові значення
					</h2>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm border-collapse">
							<thead>
								<tr className="bg-stone-100">
									<th className="px-3 py-2 text-left text-stone-700">
										Критерій
									</th>
									<th className="px-3 py-2 text-right text-stone-700">
										Порогове значення
									</th>
								</tr>
							</thead>
							<tbody>
								{thresholds.map((t) => (
									<tr key={t.criterionId} className="border-t border-stone-200">
										<td className="px-3 py-2 text-stone-800">
											{criteria.find((c) => c.id === t.criterionId)?.name ||
												`Критерій ${t.criterionId}`}
										</td>
										<td className="px-3 py-2 text-right text-stone-700">
											{t.thresholdValue}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{/* Множина допустимих альтернатив */}
			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-base font-semibold text-stone-800">
						Множина допустимих альтернатив
					</h2>
					<button
						type="button"
						onClick={handleGetFeasibleSet}
						className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
					>
						Завантажити
					</button>
				</div>

				{feasibleSet ? (
					<div className="space-y-3">
						<p className="text-sm text-stone-700">
							<span className="font-medium">Допустимих альтернатив:</span>{" "}
							{feasibleSet.feasibleAlternatives?.length || 0}
						</p>
						{feasibleSet.feasibleAlternatives &&
							feasibleSet.feasibleAlternatives.length > 0 && (
								<div className="overflow-x-auto">
									<table className="min-w-full text-sm border-collapse">
										<thead>
											<tr className="bg-stone-100">
												<th className="px-3 py-2 text-left text-stone-700">
													Альтернатива
												</th>
												<th className="px-3 py-2 text-left text-stone-700">
													Оцінки
												</th>
											</tr>
										</thead>
										<tbody>
											{feasibleSet.feasibleAlternatives.map((alt) => (
												<tr key={alt.id} className="border-t border-stone-200">
													<td className="px-3 py-2 text-stone-800">
														{alt.name}
													</td>
													<td className="px-3 py-2 text-stone-600 text-xs">
														{alt.scores ? JSON.stringify(alt.scores) : "—"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						{feasibleSet.infeasibleAlternatives &&
							feasibleSet.infeasibleAlternatives.length > 0 && (
								<div>
									<p className="text-sm text-red-600 font-medium mt-3">
										Недопустимих альтернатив:{" "}
										{feasibleSet.infeasibleAlternatives.length}
									</p>
									<div className="mt-2 text-xs text-red-600">
										{feasibleSet.infeasibleAlternatives
											.map((alt) => alt.name)
											.join(", ")}
									</div>
								</div>
							)}
					</div>
				) : (
					<p className="text-sm text-stone-600">
						Натисніть кнопку "Завантажити", щоб отримати множину допустимих
						альтернатив.
					</p>
				)}
			</section>
		</div>
	);
};
