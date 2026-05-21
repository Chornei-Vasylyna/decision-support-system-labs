import { useCallback, useEffect, useState } from "react";
import { explanationService } from "@/services/explanationService";

export const DecisionEnginePage = () => {
	const [explanation, setExplanation] = useState(null);
	const [status, setStatus] = useState("");

	const load = useCallback(async () => {
		setStatus("");
		try {
			const data = await explanationService.load();
			setExplanation(data);
		} catch (err) {
			setStatus(err.message || "Не вдалося завантажити пояснення");
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Механізм прийняття рішення
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Комплексний аналіз рішення з урахуванням всіх факторів
				</p>
			</div>

			{status && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{status}
				</div>
			)}

			{explanation ? (
				<div className="space-y-4">
					{/* Основне рішення */}
					<section className="bg-white border border-stone-200 rounded-xl p-4">
						<h2 className="text-base font-semibold text-stone-800 mb-3">
							Рекомендована альтернатива
						</h2>
						<div className="space-y-2">
							<p className="text-lg text-stone-800">
								<span className="font-bold text-xl">
									{explanation.selectedAlternative?.name ||
										explanation.bestAlternative ||
										"—"}
								</span>
							</p>
							<p className="text-stone-700">
								<span className="font-medium">Інтегральна оцінка:</span>{" "}
								{explanation.selectedAlternative?.score
									? Number(explanation.selectedAlternative.score).toFixed(4)
									: explanation.score
										? Number(explanation.score).toFixed(4)
										: "—"}
							</p>
							{explanation.selectedAlternative?.id && (
								<p className="text-stone-600 text-sm">
									<span className="font-medium">Ідентифікатор:</span>{" "}
									{explanation.selectedAlternative.id}
								</p>
							)}
						</div>
					</section>

					{/* Топ критерії */}
					{explanation.topCriteria &&
						Array.isArray(explanation.topCriteria) &&
						explanation.topCriteria.length > 0 && (
							<section className="bg-white border border-stone-200 rounded-xl p-4">
								<h2 className="text-base font-semibold text-stone-800 mb-3">
									Ключові критерії впливу
								</h2>
								<p className="text-sm text-stone-600 mb-3">
									Найбільш впливові критерії на рішення:
								</p>
								<div className="space-y-2">
									{explanation.topCriteria.slice(0, 3).map((c, idx) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: temp>
											key={idx}
											className="p-3 bg-stone-50 border border-stone-100 rounded-lg"
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-stone-800">
														{c.name || c.criterionName || `Критерій ${c.id}`}
													</p>
													<p className="text-sm text-stone-600">
														Оцінка альтернативи:{" "}
														{Number(c.alternativeScore ?? c.score ?? 0).toFixed(
															3,
														)}{" "}
														| Вага: {Number(c.weight ?? c.wh ?? 0).toFixed(3)}
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold text-stone-800">
														Вклад: {Number(c.contribution ?? 0).toFixed(4)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>
						)}

					{/* Застосовані правила */}
					{explanation.appliedRules &&
						Array.isArray(explanation.appliedRules) &&
						explanation.appliedRules.length > 0 && (
							<section className="bg-white border border-stone-200 rounded-xl p-4">
								<h2 className="text-base font-semibold text-stone-800 mb-3">
									Активовані експертні правила
								</h2>
								<div className="space-y-2">
									{explanation.appliedRules.map((rule, idx) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: temp
											key={idx}
											className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm"
										>
											<p className="text-stone-800 font-medium">
												✓ {rule.name || `Правило ${idx + 1}`}
											</p>
											{rule.description && (
												<p className="text-stone-600 mt-1 text-xs">
													{rule.description}
												</p>
											)}
										</div>
									))}
								</div>
							</section>
						)}

					{/* Порогові обмеження */}
					{explanation.thresholdCheck && (
						<section className="bg-white border border-stone-200 rounded-xl p-4">
							<h2 className="text-base font-semibold text-stone-800 mb-3">
								Статус порогових обмежень
							</h2>
							<div
								className={`p-3 border rounded-lg ${
									explanation.thresholdCheck.passed
										? "bg-green-50 border-green-100"
										: "bg-red-50 border-red-100"
								}`}
							>
								<p
									className={`font-medium ${
										explanation.thresholdCheck.passed
											? "text-green-800"
											: "text-red-800"
									}`}
								>
									{explanation.thresholdCheck.passed
										? "✓ Обмеження задоволені"
										: "✗ Обмеження не задоволені"}
								</p>
								{explanation.thresholdCheck.details && (
									<p className="text-sm mt-1 text-stone-700">
										{explanation.thresholdCheck.details}
									</p>
								)}
							</div>
						</section>
					)}

					{/* Резервна схема для невпізнаних даних */}
					{!explanation.selectedAlternative &&
						!explanation.topCriteria &&
						!explanation.appliedRules && (
							<section className="bg-white border border-stone-200 rounded-xl p-4">
								<h2 className="text-base font-semibold text-stone-800 mb-3">
									Детальна інформація
								</h2>
								<pre className="overflow-x-auto text-xs text-stone-700 bg-stone-50 border border-stone-100 rounded-lg p-3">
									{JSON.stringify(explanation, null, 2)}
								</pre>
							</section>
						)}
				</div>
			) : (
				<section className="bg-white border border-stone-200 rounded-xl p-4">
					<p className="text-sm text-stone-600">
						Немає даних про рішення. Спочатку запустіть аналіз на сторінці
						"Аналіз".
					</p>
				</section>
			)}
		</div>
	);
};
