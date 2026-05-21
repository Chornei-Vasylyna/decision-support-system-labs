import { useCallback, useEffect, useState } from "react";
import { analysisService } from "@/services/analysisService";

const methodLabels = {
	additive: "Адитивний (зважена сума)",
	cautious: "Обережний (за мінімумом)",
	multiplicative: "Мультиплікативний (добуток)",
};

export const AnalysisPage = () => {
	const [selectedMethod, setSelectedMethod] = useState("additive");
	const [result, setResult] = useState(null);
	const [scenarios, setScenarios] = useState([]);
	const [scenarioResult, setScenarioResult] = useState(null);
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [sensitivityParams, setSensitivityParams] = useState({
		step: 0.1,
		range: 0.5,
	});

	const load = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");
		try {
			const sc = await analysisService.getScenarios();
			setScenarios(sc || []);
		} catch (err) {
			setStatusMessage(err.message || "Не вдалося завантажити сценарії");
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
			const res = await analysisService.run(selectedMethod);
			setResult(res);
			setStatusMessage("Аналіз виконано");
		} catch (err) {
			setStatusMessage(err.message || "Помилка при запуску аналізу");
		}
	};

	const handleApplyScenario = async (id) => {
		setStatusMessage("");
		try {
			const res = await analysisService.applyScenario(id);
			setScenarioResult(res);
			setStatusMessage("Сценарій застосовано");
		} catch (err) {
			setStatusMessage(err.message || "Не вдалося застосувати сценарій");
		}
	};

	const handleRunSensitivity = async () => {
		setStatusMessage("");
		try {
			const res = await analysisService.runSensitivity(sensitivityParams);
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
							{analysisService.methods.map((m) => (
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
						<h3 className="text-sm font-medium text-stone-800">
							Рейтинг альтернатив
						</h3>
						{result?.ranking && Array.isArray(result.ranking) ? (
							<div className="overflow-x-auto mt-2">
								<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden text-sm">
									<thead>
										<tr className="bg-stone-100">
											<th className="px-3 py-2 text-left text-stone-700">
												Місце
											</th>
											<th className="px-3 py-2 text-left text-stone-700">
												Альтернатива
											</th>
											<th className="px-3 py-2 text-right text-stone-700">
												Оцінка
											</th>
										</tr>
									</thead>
									<tbody>
										{result.ranking.map((item, idx) => (
											<tr
												key={item.id || idx}
												className="border-t border-stone-200"
											>
												<td className="px-3 py-2 text-stone-800 font-medium">
													{idx + 1}
												</td>
												<td className="px-3 py-2 text-stone-800">
													{item.name || `Альтернатива ${item.id}`}
												</td>
												<td className="px-3 py-2 text-right text-stone-700">
													{Number(item.score).toFixed(4)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{result.method && (
									<p className="text-xs text-stone-600 mt-2">
										Метод: {methodLabels[result.method] || result.method}
									</p>
								)}
							</div>
						) : (
							<pre className="overflow-x-auto text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-3 mt-2">
								{JSON.stringify(result, null, 2)}
							</pre>
						)}
					</div>
				)}
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<h2 className="text-base font-medium text-stone-800">Сценарії</h2>
				<p className="text-sm text-stone-600">
					Аналіз альтернативних сценаріїв (зміна ваг, оцінок або порогів).
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
											Запустити
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{scenarioResult && (
					<div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
						<h3 className="text-sm font-medium text-blue-900 mb-3">
							Результат сценарію
						</h3>
						{scenarioResult?.ranking &&
						Array.isArray(scenarioResult.ranking) ? (
							<div className="overflow-x-auto">
								<table className="min-w-full border border-blue-200 rounded-lg overflow-hidden text-sm">
									<thead>
										<tr className="bg-blue-100">
											<th className="px-3 py-2 text-left text-blue-900">
												Місце
											</th>
											<th className="px-3 py-2 text-left text-blue-900">
												Альтернатива
											</th>
											<th className="px-3 py-2 text-right text-blue-900">
												Оцінка
											</th>
										</tr>
									</thead>
									<tbody>
										{scenarioResult.ranking.map((item, idx) => (
											<tr
												key={item.id || idx}
												className="border-t border-blue-100"
											>
												<td className="px-3 py-2 text-blue-900 font-medium">
													{idx + 1}
												</td>
												<td className="px-3 py-2 text-blue-900">
													{item.name || `Альтернатива ${item.id}`}
												</td>
												<td className="px-3 py-2 text-right text-blue-700">
													{Number(item.score).toFixed(4)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<pre className="overflow-x-auto text-xs text-blue-900 bg-white border border-blue-100 rounded-lg p-3">
								{JSON.stringify(scenarioResult, null, 2)}
							</pre>
						)}
					</div>
				)}
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
