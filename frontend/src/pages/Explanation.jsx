import { useCallback, useEffect, useState } from "react";
import { explanationService } from "@/services/explanationService";

const TOP_CRITERIA_LIMIT = 3;

const formatNumber = (value, digits = 4) => Number(value ?? 0).toFixed(digits);

const getAlternativeName = (explanation) =>
	explanation.selectedAlternative?.name || explanation.bestAlternative || "—";

const getAlternativeScore = (explanation) =>
	explanation.selectedAlternative?.score ?? explanation.score;

const getCriteriaLabel = (criterion) =>
	criterion.name || criterion.criterionName || `Критерій ${criterion.id}`;

const hasItems = (value) => Array.isArray(value) && value.length > 0;

const SummarySection = ({ explanation }) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4">
		<h2 className="text-base font-semibold text-stone-800 mb-3">
			Обрана альтернатива
		</h2>
		<div className="space-y-2">
			<p className="text-stone-700">
				<span className="font-medium">Назва:</span>{" "}
				{getAlternativeName(explanation)}
			</p>
			<p className="text-stone-700">
				<span className="font-medium">Оцінка:</span>{" "}
				{getAlternativeScore(explanation) != null
					? formatNumber(getAlternativeScore(explanation))
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
);

const TopCriteriaSection = ({ topCriteria }) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4">
		<h2 className="text-base font-semibold text-stone-800 mb-3">
			Топ критерії що вплинули
		</h2>
		<div className="overflow-x-auto">
			<table className="min-w-full text-sm">
				<thead>
					<tr className="bg-stone-100">
						<th className="px-3 py-2 text-left text-stone-700">Критерій</th>
						<th className="px-3 py-2 text-right text-stone-700">Вага</th>
						<th className="px-3 py-2 text-right text-stone-700">Оцінка</th>
						<th className="px-3 py-2 text-right text-stone-700">Вклад</th>
					</tr>
				</thead>
				<tbody>
					{topCriteria.slice(0, TOP_CRITERIA_LIMIT).map((criterion) => (
						<tr key={criterion.id} className="border-t border-stone-200">
							<td className="px-3 py-2 text-stone-800">
								{getCriteriaLabel(criterion)}
							</td>
							<td className="px-3 py-2 text-right text-stone-700">
								{formatNumber(criterion.weight ?? criterion.wh, 3)}
							</td>
							<td className="px-3 py-2 text-right text-stone-700">
								{formatNumber(criterion.alternativeScore ?? criterion.score, 3)}
							</td>
							<td className="px-3 py-2 text-right text-stone-700 font-medium">
								{formatNumber(criterion.contribution)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	</section>
);

const AppliedRulesSection = ({ appliedRules }) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4">
		<h2 className="text-base font-semibold text-stone-800 mb-3">
			Застосовані правила
		</h2>
		<div className="space-y-2">
			{appliedRules.map((rule, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: rule order is stable and display-only
					key={index}
					className="p-3 bg-stone-50 border border-stone-100 rounded-lg text-sm"
				>
					<p className="text-stone-800 font-medium">
						{rule.name || `Правило ${index + 1}`}
					</p>
					{rule.description && (
						<p className="text-stone-600 mt-1">{rule.description}</p>
					)}
				</div>
			))}
		</div>
	</section>
);

const ThresholdSection = ({ thresholdCheck }) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4">
		<h2 className="text-base font-semibold text-stone-800 mb-3">
			Порогові обмеження
		</h2>
		<div className="p-3 bg-stone-50 border border-stone-100 rounded-lg">
			<p className="text-stone-700">
				{thresholdCheck.passed
					? "✓ Альтернатива пройшла всі порогові обмеження"
					: "✗ Альтернатива не задовольняє деякі обмеження"}
			</p>
			{thresholdCheck.details && (
				<p className="text-stone-600 text-sm mt-1">{thresholdCheck.details}</p>
			)}
		</div>
	</section>
);

const RawExplanationSection = ({ explanation }) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4">
		<h2 className="text-base font-semibold text-stone-800 mb-3">
			Детальне резюме
		</h2>
		<pre className="overflow-x-auto text-xs text-stone-700 bg-stone-50 border border-stone-100 rounded-lg p-3">
			{JSON.stringify(explanation, null, 2)}
		</pre>
	</section>
);

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
					<SummarySection explanation={explanation} />

					{hasItems(explanation.topCriteria) && (
						<TopCriteriaSection topCriteria={explanation.topCriteria} />
					)}

					{hasItems(explanation.appliedRules) && (
						<AppliedRulesSection appliedRules={explanation.appliedRules} />
					)}

					{explanation.thresholdCheck && (
						<ThresholdSection thresholdCheck={explanation.thresholdCheck} />
					)}

					{!explanation.selectedAlternative &&
						!hasItems(explanation.topCriteria) &&
						!hasItems(explanation.appliedRules) && (
							<RawExplanationSection explanation={explanation} />
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
