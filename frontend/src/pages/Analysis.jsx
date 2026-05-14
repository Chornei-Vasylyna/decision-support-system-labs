import { useCallback, useEffect, useMemo, useState } from "react";
import { analysisController } from "@/controllers/analysisController";

export const AnalysisPage = () => {
	const [selectedMethod, setSelectedMethod] = useState("additive");
	const [result, setResult] = useState(null);
	const [scenarios, setScenarios] = useState([]);
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [sensitivityParams, setSensitivityParams] = useState({
		step: 0.1,
		range: 0.5,
	});

	const methodLabels = useMemo(
		() => ({
			additive: "Additive (weighted sum)",
			cautious: "Cautious (min-based)",
			multiplicative: "Multiplicative (product)",
		}),
		[],
	);

	const load = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");
		try {
			const r = await analysisController.getLastResult();
			setResult(r);
			const sc = await analysisController.getScenarios();
			setScenarios(sc || []);
		} catch (err) {
			setStatusMessage(err.message || "Не вдалося завантажити аналіз");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const handleRun = async () => {
		setStatusMessage("");
		try {
			const res = await analysisController.run(selectedMethod);
			setResult(res);
			setStatusMessage("Аналіз виконано");
		} catch (err) {
			setStatusMessage(err.message || "Помилка при запуску аналізу");
		}
	};

	const handleApplyScenario = async (id) => {
		setStatusMessage("");
		try {
			await analysisController.applyScenario(id);
			setStatusMessage("Сценарій застосовано");
			await load();
		} catch (err) {
			setStatusMessage(err.message || "Не вдалося застосувати сценарій");
		}
	};

	const handleRunSensitivity = async () => {
		setStatusMessage("");
		try {
			const res = await analysisController.runSensitivity(sensitivityParams);
			setResult((prev) => ({ ...prev, sensitivity: res }));
			setStatusMessage("Проведено аналіз чутливості");
		} catch (err) {
			setStatusMessage(err.message || "Не вдалося провести аналіз чутливості");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Аналіз</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Агрегація та ранжування альтернатив
				</p>
			</div>

			{statusMessage && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{statusMessage}
				</div>
			)}

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-medium text-stone-800">Агрегація</h2>
						<p className="text-sm text-stone-600 mt-1">
							Оберіть метод агрегації для розрахунку оцінок.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<select
							value={selectedMethod}
							onChange={(e) => setSelectedMethod(e.target.value)}
							className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
						>
							{analysisController.methods.map((m) => (
								<option key={m} value={m}>
									{methodLabels[m] || m}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={handleRun}
							disabled={loading}
							className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
						>
							Запустити
						</button>
					</div>
				</div>

				{result && (
					<div className="mt-3">
						<h3 className="text-sm font-medium text-stone-800">Результат</h3>
						<pre className="overflow-x-auto text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-3 mt-2">
							{JSON.stringify(result, null, 2)}
						</pre>
					</div>
				)}
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<h2 className="text-base font-medium text-stone-800">Сценарії</h2>
				<p className="text-sm text-stone-600">
					Керування сценаріями (застосувати) — мінімальна реалізація.
				</p>

				<div className="overflow-x-auto">
					<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
						<thead>
							<tr className="bg-stone-100">
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Назва
								</th>
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Опис
								</th>
								<th className="px-3 py-2 text-right text-sm text-stone-700">
									Дії
								</th>
							</tr>
						</thead>
						<tbody>
							{scenarios.map((s) => (
								<tr key={s.id} className="border-t border-stone-200">
									<td className="px-3 py-2 text-sm text-stone-800">{s.name}</td>
									<td className="px-3 py-2 text-sm text-stone-600">
										{s.description}
									</td>
									<td className="px-3 py-2 text-right">
										<button
											type="button"
											onClick={() => handleApplyScenario(s.id)}
											className="text-sm text-blue-500 hover:text-blue-700"
										>
											Застосувати
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<h2 className="text-base font-medium text-stone-800">
					Аналіз чутливості
				</h2>
				<div className="flex items-center gap-3">
					<label htmlFor="sensitivity-step" className="text-sm text-stone-700">
						Крок
					</label>
					<input
						id="sensitivity-step"
						type="number"
						step="0.01"
						value={sensitivityParams.step}
						onChange={(e) =>
							setSensitivityParams((c) => ({
								...c,
								step: Number(e.target.value),
							}))
						}
						className="w-28 border rounded-md px-2 py-1"
					/>
					<label htmlFor="sensitivity-range" className="text-sm text-stone-700">
						Діапазон
					</label>
					<input
						id="sensitivity-range"
						type="number"
						step="0.1"
						value={sensitivityParams.range}
						onChange={(e) =>
							setSensitivityParams((c) => ({
								...c,
								range: Number(e.target.value),
							}))
						}
						className="w-28 border rounded-md px-2 py-1"
					/>
					<button
						type="button"
						onClick={handleRunSensitivity}
						disabled={loading}
						className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
					>
						Запустити чутливість
					</button>
				</div>
			</section>
		</div>
	);
};
