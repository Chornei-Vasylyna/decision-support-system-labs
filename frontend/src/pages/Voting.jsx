import { useCallback, useEffect, useMemo, useState } from "react";
import { criteriaService } from "@/services/criteriaService";
import { votingService } from "@/services/votingService";
import { useCriteriaStore } from "@/stores/useCriteriaStore";

const createEmptyImportForm = () => ({
	url: "",
	createMissing: true,
});

export const VotingPage = () => {
	const criteria = useCriteriaStore((state) => state.criteria);
	const [importForm, setImportForm] = useState(createEmptyImportForm());
	const [importErrors, setImportErrors] = useState({});
	const [weightErrors, setWeightErrors] = useState({});
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [selectedMethod, setSelectedMethod] = useState("bordaCount");
	const [methodResult, setMethodResult] = useState(null);
	const [weightDrafts, setWeightDrafts] = useState({});
	const [votes, setVotes] = useState([]);

	const methodLabels = useMemo(
		() => ({
			simpleMajority: "Проста більшість",
			bordaCount: "Метод Борда",
			condorcet: "Кондорсе",
			approvalVoting: "Відкрите голосування",
		}),
		[],
	);

	const loadVotingData = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");

		try {
			await criteriaService.load();
			const currentVotes = await votingService.loadVotes();
			setVotes(currentVotes);
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося завантажити дані голосування",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadVotingData();
	}, [loadVotingData]);

	useEffect(() => {
		setWeightDrafts(
			Object.fromEntries(
				criteria.map((criterion) => [criterion.id, criterion.weight ?? 0]),
			),
		);
	}, [criteria]);

	const handleImportSubmit = async (event) => {
		event.preventDefault();

		const errors = votingService.validateImport(importForm);
		setImportErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			await votingService.importFromGoogle(importForm);
			setStatusMessage("Імпорт голосів завершено");
			setImportForm(createEmptyImportForm());
			await loadVotingData();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося імпортувати голоси");
		}
	};

	const handleRunMethod = async (method) => {
		setSelectedMethod(method);
		setStatusMessage("");

		try {
			const result = await votingService.getMethodResult(method);
			setMethodResult({ method, result });
			setStatusMessage(`Метод ${methodLabels[method] || method} виконано`);
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося виконати метод голосування",
			);
		}
	};

	const handleApplyVotingResults = async () => {
		setStatusMessage("");

		try {
			await votingService.applyVotingResults(selectedMethod);
			setStatusMessage("Ваги оновлено за результатами голосування");
			await loadVotingData();
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося застосувати результати голосування",
			);
		}
	};

	const handleWeightChange = (criterionId, value) => {
		setWeightDrafts((current) => ({
			...current,
			[criterionId]: value,
		}));
	};

	const handleSaveWeights = async () => {
		const errors = votingService.validateWeights(
			criteria.map((criterion) => ({
				...criterion,
				weight: weightDrafts[criterion.id],
			})),
		);
		setWeightErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			setStatusMessage("Перевірте значення ваг");
			return;
		}

		try {
			await votingService.updateWeights(
				criteria.map((criterion) => ({
					id: criterion.id,
					weight: Number(weightDrafts[criterion.id]),
				})),
			);
			setStatusMessage("Ваги критеріїв збережено");
			await loadVotingData();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося зберегти ваги");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Голосування</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Імпорт голосів, запуск методів та керування вагами критеріїв
				</p>
			</div>

			{statusMessage && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{statusMessage}
				</div>
			)}

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<div>
					<h2 className="text-base font-medium text-stone-800">
						Імпорт голосів з Google Sheets
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Підтримується посилання на Google Sheets. Відсутні записи можна
						автоматично.
					</p>
				</div>

				<form
					onSubmit={handleImportSubmit}
					className="grid gap-3 md:grid-cols-2"
				>
					<div className="md:col-span-2">
						<input
							value={importForm.url}
							onChange={(e) =>
								setImportForm((current) => ({
									...current,
									url: e.target.value,
								}))
							}
							placeholder="Посилання на Google Sheets"
							className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
								importErrors.url
									? "border-red-400 focus:border-red-500"
									: "border-stone-200 focus:border-stone-400"
							}`}
						/>
						{importErrors.url && (
							<p className="text-sm text-red-600 mt-1">{importErrors.url}</p>
						)}
					</div>

					{/* spreadsheetId and gid removed — derived from URL in service */}

					<label className="flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
						<input
							type="checkbox"
							checked={importForm.createMissing}
							onChange={(e) =>
								setImportForm((current) => ({
									...current,
									createMissing: e.target.checked,
								}))
							}
						/>
						Створювати відсутні записи автоматично
					</label>

					<div className="md:col-span-2 flex gap-3">
						<button
							type="submit"
							className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
						>
							Імпортувати
						</button>
						<button
							type="button"
							onClick={loadVotingData}
							className="border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-lg text-sm cursor-pointer"
						>
							Оновити
						</button>
					</div>
				</form>
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h2 className="text-base font-medium text-stone-800">
							Методи голосування
						</h2>
						<p className="text-sm text-stone-600 mt-1">
							Запустіть метод і перегляньте результат перед оновленням ваг.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<select
							value={selectedMethod}
							onChange={(e) => setSelectedMethod(e.target.value)}
							className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-stone-400"
						>
							{votingService.methods.map((method) => (
								<option key={method} value={method}>
									{methodLabels[method] || method}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={handleApplyVotingResults}
							disabled={loading}
							className="bg-stone-600 hover:bg-stone-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
						>
							Застосувати до ваг
						</button>
					</div>
				</div>

				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					{votingService.methods.map((method) => (
						<button
							key={method}
							type="button"
							onClick={() => handleRunMethod(method)}
							className={`rounded-xl border px-4 py-3 text-left transition-colors ${
								selectedMethod === method
									? "border-stone-800 bg-stone-800 text-white"
									: "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400 hover:bg-stone-100"
							}`}
						>
							<div className="text-sm font-medium">{methodLabels[method]}</div>
							<div className="text-xs mt-1 opacity-80">
								Запустити розрахунок
							</div>
						</button>
					))}
				</div>

				{methodResult && (
					<div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
						<div>
							<h3 className="text-sm font-medium text-stone-800">
								Результат:{" "}
								{methodLabels[methodResult.method] || methodResult.method}
							</h3>
							<p className="text-xs text-stone-500 mt-1">
								Структура відповіді приходить з backend без додаткової
								трансформації.
							</p>
						</div>
						<pre className="overflow-x-auto text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-3">
							{JSON.stringify(methodResult.result, null, 2)}
						</pre>
					</div>
				)}
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h2 className="text-base font-medium text-stone-800">
							Ваги критеріїв
						</h2>
						<p className="text-sm text-stone-600 mt-1">
							Редагуйте ваги вручну або перезапишіть їх результатами
							голосування.
						</p>
					</div>
					<button
						type="button"
						onClick={handleSaveWeights}
						disabled={loading}
						className="bg-stone-700 hover:bg-stone-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
					>
						Зберегти ваги
					</button>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
						<thead>
							<tr className="bg-stone-100">
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Критерій
								</th>
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Тип
								</th>
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Вага
								</th>
							</tr>
						</thead>
						<tbody>
							{criteria.map((criterion) => (
								<tr key={criterion.id} className="border-t border-stone-200">
									<td className="px-3 py-2 text-sm text-stone-800">
										{criterion.name}
									</td>
									<td className="px-3 py-2 text-sm text-stone-600">
										{criterion.type}
									</td>
									<td className="px-3 py-2">
										<input
											type="number"
											step="0.01"
											value={weightDrafts[criterion.id] ?? ""}
											onChange={(e) =>
												handleWeightChange(criterion.id, e.target.value)
											}
											className={`w-32 border rounded-md px-2 py-1 text-sm outline-none ${
												weightErrors[criterion.id]
													? "border-red-400 focus:border-red-500"
													: "border-stone-200 focus:border-stone-400"
											}`}
										/>
										{weightErrors[criterion.id] && (
											<p className="text-xs text-red-600 mt-1">
												{weightErrors[criterion.id]}
											</p>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2">
				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">Статистика</h2>
					<p className="text-sm text-stone-600 mt-1">
						Завантажено критеріїв: {criteria.length}
					</p>
					<p className="text-sm text-stone-600 mt-1">
						Завантажено голосів: {votes.length}
					</p>
				</div>

				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">Підказка</h2>
					<p className="text-sm text-stone-600 mt-1">
						Спочатку імпортуйте голоси, потім запустіть метод і за потреби
						збережіть ваги вручну.
					</p>
				</div>
			</section>
		</div>
	);
};
