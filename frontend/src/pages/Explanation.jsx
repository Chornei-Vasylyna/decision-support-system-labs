import { useCallback, useEffect, useState } from "react";
import { explanationController } from "@/controllers/explanationController";

export const ExplanationPage = () => {
	const [explanation, setExplanation] = useState(null);
	const [status, setStatus] = useState("");

	const load = useCallback(async () => {
		setStatus("");
		try {
			const data = await explanationController.load();
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
				<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
					<h2 className="text-base font-medium text-stone-800">
						Коротке резюме
					</h2>
					<pre className="overflow-x-auto text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-3">
						{JSON.stringify(explanation.summary || explanation, null, 2)}
					</pre>
				</section>
			) : (
				<section className="bg-white border border-stone-200 rounded-xl p-4">
					<p className="text-sm text-stone-600">Пояснення наразі відсутнє.</p>
				</section>
			)}
		</div>
	);
};
