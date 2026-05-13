import { useCallback, useEffect, useMemo, useState } from "react";
import { evaluationsController } from "@/controllers/evaluationsController";

const createEmptyImportForm = () => ({
	url: "",
	spreadsheetId: "",
	gid: "",
	createMissing: true,
});

export const MatrixPage = () => {
	const [matrixData, setMatrixData] = useState({
		alternatives: [],
		criteria: [],
		matrix: [],
	});
	const [importForm, setImportForm] = useState(createEmptyImportForm());
	const [importErrors, setImportErrors] = useState({});
	const [cellErrors, setCellErrors] = useState({});
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const loadMatrix = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");

		try {
			const data = await evaluationsController.load();
			setMatrixData(data);
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося завантажити матрицю");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMatrix();
	}, [loadMatrix]);

	const matrixHeaders = useMemo(
		() => matrixData.criteria.map((criterion) => criterion),
		[matrixData.criteria],
	);

	const handleCellChange = (alternativeId, criterionId, value) => {
		setMatrixData((current) => ({
			...current,
			matrix: current.matrix.map((row) =>
				row.alternative.id === alternativeId
					? {
							...row,
							scores: {
								...row.scores,
								[criterionId]: value,
							},
						}
					: row,
			),
		}));
	};

	const handleSave = async () => {
		const errors = evaluationsController.validateMatrix(matrixData);
		setCellErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			setStatusMessage("Заповніть усі клітинки числовими значеннями");
			return;
		}

		try {
			await evaluationsController.saveMatrix(matrixData);
			setStatusMessage("Матрицю збережено");
			await loadMatrix();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося зберегти матрицю");
		}
	};

	const handleImportSubmit = async (event) => {
		event.preventDefault();

		const errors = evaluationsController.validateImport(importForm);
		setImportErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			await evaluationsController.importFromGoogle(importForm);
			setStatusMessage("Імпорт завершено");
			setImportForm(createEmptyImportForm());
			await loadMatrix();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося імпортувати матрицю");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Матриця оцінювання
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Імпорт з Google Sheets та редагування оцінок альтернатив за критеріями
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
						Імпорт з Google Sheets
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Вкажіть URL або spreadsheetId. Якщо в таблиці є нові назви, їх можна
						створити автоматично.
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
							placeholder="Google Sheets URL"
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

					<input
						value={importForm.spreadsheetId}
						onChange={(e) =>
							setImportForm((current) => ({
								...current,
								spreadsheetId: e.target.value,
							}))
						}
						placeholder="Spreadsheet ID (опційно)"
						className="border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-stone-400"
					/>

					<input
						type="number"
						value={importForm.gid}
						onChange={(e) =>
							setImportForm((current) => ({ ...current, gid: e.target.value }))
						}
						placeholder="gid (опційно)"
						className={`border rounded-lg px-3 py-2 outline-none ${
							importErrors.gid
								? "border-red-400 focus:border-red-500"
								: "border-stone-200 focus:border-stone-400"
						}`}
					/>
					{importErrors.gid && (
						<p className="text-sm text-red-600">{importErrors.gid}</p>
					)}

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
						Створювати відсутні альтернативи та критерії автоматично
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
							onClick={loadMatrix}
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
							Редактор матриці
						</h2>
						<p className="text-sm text-stone-600 mt-1">
							Заповніть усі клітинки числовими значеннями перед збереженням.
						</p>
					</div>
					<button
						type="button"
						onClick={handleSave}
						disabled={loading}
						className="bg-stone-600 hover:bg-stone-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
					>
						Зберегти матрицю
					</button>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
						<thead>
							<tr className="bg-stone-100">
								<th className="px-3 py-2 text-left text-sm text-stone-700">
									Альтернатива
								</th>
								{matrixHeaders.map((criterion) => (
									<th
										key={criterion.id}
										className="px-3 py-2 text-left text-sm text-stone-700"
									>
										{criterion.name}
										<div className="text-xs text-stone-500">
											{criterion.type}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{matrixData.matrix.map((row) => (
								<tr
									key={row.alternative.id}
									className="border-t border-stone-200"
								>
									<td className="px-3 py-2 text-sm font-medium text-stone-800">
										{row.alternative.name}
									</td>
									{matrixHeaders.map((criterion) => {
										const cellKey = `${row.alternative.id}-${criterion.id}`;
										const value = row.scores?.[criterion.id] ?? "";
										return (
											<td key={criterion.id} className="px-3 py-2 align-top">
												<input
													type="number"
													step="0.1"
													value={value}
													onChange={(e) =>
														handleCellChange(
															row.alternative.id,
															criterion.id,
															e.target.value,
														)
													}
													className={`w-28 border rounded-md px-2 py-1 text-sm outline-none ${
														cellErrors[cellKey]
															? "border-red-400 focus:border-red-500"
															: "border-stone-200 focus:border-stone-400"
													}`}
												/>
												{cellErrors[cellKey] && (
													<p className="text-xs text-red-600 mt-1">
														{cellErrors[cellKey]}
													</p>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
};
