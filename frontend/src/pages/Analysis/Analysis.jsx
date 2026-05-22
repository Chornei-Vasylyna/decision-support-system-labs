import { useCallback, useEffect, useState } from "react";
import { alternativesService } from "@/services/alternativesService";
import { analysisService } from "@/services/analysisService";
import { CompactObjectGrid } from "./CompactObjectGrid.jsx";
import { RankingTable } from "./RankingTable.jsx";
import { ScenarioResultCard } from "./ScenarioResultCard.jsx";
import { ScenarioTable } from "./ScenarioTable.jsx";
import { SensitivitySection } from "./SensitivitySection.jsx";

const methodLabels = {
	additive: "Адитивний (зважена сума)",
	cautious: "Обережний (за мінімумом)",
	multiplicative: "Мультиплікативний (добуток)",
};

const methodSections = [
	{ key: "additive", title: "Адитивний метод" },
	{ key: "cautious", title: "Обережний метод" },
	{ key: "multiplicative", title: "Мультиплікативний метод" },
];

const hasItems = (value) => Array.isArray(value) && value.length > 0;

export const AnalysisPage = () => {
	const [selectedMethod, setSelectedMethod] = useState("additive");
	const [result, setResult] = useState(null);
	const [alternatives, setAlternatives] = useState([]);
	const [scenarios, setScenarios] = useState([]);
	const [scenarioResult, setScenarioResult] = useState(null);
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [sensitivityParams, setSensitivityParams] = useState({
		step: 0.1,
		range: 0.5,
	});

	const getAlternativeLabel = useCallback(
		(alternativeId) => {
			const alternative = alternatives.find(
				(item) => Number(item.id) === Number(alternativeId),
			);

			return alternative?.name
				? `${alternative.name} (#${alternativeId})`
				: `Альтернатива ${alternativeId}`;
		},
		[alternatives],
	);

	const load = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");
		try {
			const [altList, sc] = await Promise.all([
				alternativesService.load(),
				analysisService.getScenarios(),
			]);
			setAlternatives(altList || []);
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
							{analysisService.methods.map((method) => (
								<option key={method} value={method}>
									{methodLabels[method] || method}
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
						<div className="mt-2 space-y-4">
							{methodSections.map((section) =>
								hasItems(result[section.key]) ? (
									<section
										key={section.key}
										className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3"
									>
										<h4 className="text-sm font-medium text-stone-800">
											{section.title}
										</h4>
										<RankingTable
											items={result[section.key]}
											getAlternativeLabel={getAlternativeLabel}
										/>
									</section>
								) : null,
							)}
							{!hasItems(result.additive) &&
								!hasItems(result.cautious) &&
								!hasItems(result.multiplicative) && (
									<div className="mt-2">
										<CompactObjectGrid data={result} />
									</div>
								)}
						</div>
						{result.method && (
							<p className="text-xs text-stone-600 mt-2">
								Метод: {methodLabels[result.method] || result.method}
							</p>
						)}
					</div>
				)}
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<h2 className="text-base font-medium text-stone-800">Сценарії</h2>
				<p className="text-sm text-stone-600">
					Аналіз альтернативних сценаріїв (зміна ваг, оцінок або порогів).
				</p>
				<ScenarioTable
					scenarios={scenarios}
					onApplyScenario={handleApplyScenario}
				/>
				<ScenarioResultCard
					scenarioResult={scenarioResult}
					getAlternativeLabel={getAlternativeLabel}
				/>
			</section>

			<SensitivitySection
				sensitivity={result?.sensitivity}
				sensitivityParams={sensitivityParams}
				setSensitivityParams={setSensitivityParams}
				onRun={handleRunSensitivity}
				loading={loading}
				getAlternativeLabel={getAlternativeLabel}
			/>
		</div>
	);
};
