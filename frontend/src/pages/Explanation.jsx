import { useCallback, useEffect, useState } from "react";
import { explanationService } from "@/services/explanationService";

export const ExplanationPage = () => {
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
					Пояснення рішення
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Пояснення вибору альтернативи та вплив критеріїв
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
							Обрана альтернатива
						</h2>
						<div className="space-y-2">
							<p className="text-stone-700">
								<span className="font-medium">Назва:</span>{" "}
								{explanation.selectedAlternative?.name ||
									explanation.bestAlternative ||
									"—"}
							</p>
							<p className="text-stone-700">
								<span className="font-medium">Оцінка:</span>{" "}
								{explanation.selectedAlternative?.score
									? Number(explanation.selectedAlternative.score).toFixed(4)
									: explanation.score
										? Number(explanation.score).toFixed(4)
										: "—"}
							</p>
							{explanation.selectedAlternative?.id && (
								<p className="text-stone-700">
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
									Топ критерії що вплинули
								</h2>
								<div className="overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead>
											<tr className="bg-stone-100">
												<th className="px-3 py-2 text-left text-stone-700">
													Критерій
												</th>
												<th className="px-3 py-2 text-right text-stone-700">
													Вага
												</th>
												<th className="px-3 py-2 text-right text-stone-700">
													Оцінка
												</th>
												<th className="px-3 py-2 text-right text-stone-700">
													Вклад
												</th>
											</tr>
										</thead>
										<tbody>
											{explanation.topCriteria.slice(0, 3).map((c, idx) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: temp
												<tr key={idx} className="border-t border-stone-200">
													<td className="px-3 py-2 text-stone-800">
														{c.name || c.criterionName || `Критерій ${c.id}`}
													</td>
													<td className="px-3 py-2 text-right text-stone-700">
														{Number(c.weight ?? c.wh ?? 0).toFixed(3)}
													</td>
													<td className="px-3 py-2 text-right text-stone-700">
														{Number(c.alternativeScore ?? c.score ?? 0).toFixed(
															3,
														)}
													</td>
													<td className="px-3 py-2 text-right text-stone-700 font-medium">
														{Number(c.contribution ?? 0).toFixed(4)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</section>
						)}

					{/* Застосовані правила */}
					{explanation.appliedRules &&
						Array.isArray(explanation.appliedRules) &&
						explanation.appliedRules.length > 0 && (
							<section className="bg-white border border-stone-200 rounded-xl p-4">
								<h2 className="text-base font-semibold text-stone-800 mb-3">
									Застосовані правила
								</h2>
								<div className="space-y-2">
									{explanation.appliedRules.map((rule, idx) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: temp
											key={idx}
											className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-sm"
										>
											<p className="text-stone-800 font-medium">
												{rule.name || `Правило ${idx + 1}`}
											</p>
											{rule.description && (
												<p className="text-stone-600 mt-1">
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
								Порогові обмеження
							</h2>
							<div className="p-3 bg-stone-50 border border-stone-100 rounded-lg">
								<p className="text-stone-700">
									{explanation.thresholdCheck.passed
										? "✓ Альтернатива пройшла всі порогові обмеження"
										: "✗ Альтернатива не задовольняє деякі обмеження"}
								</p>
								{explanation.thresholdCheck.details && (
									<p className="text-stone-600 text-sm mt-1">
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
									Детальне резюме
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
						Пояснення наразі відсутнє. Спочатку запустіть аналіз.
					</p>
				</section>
			)}
		</div>
	);
};
