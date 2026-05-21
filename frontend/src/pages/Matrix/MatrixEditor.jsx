import { evaluationsService } from "@/services/evaluationsService";

export const MatrixEditor = ({
	matrixData,
	setMatrixData,
	cellErrors,
	setCellErrors,
	loading,
	setStatusMessage,
	loadMatrix,
}) => {
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
		const errors = evaluationsService.validateMatrix(matrixData);
		setCellErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			setStatusMessage("Заповніть усі клітинки числовими значеннями");
			return;
		}

		try {
			await evaluationsService.saveMatrix(matrixData);
			setStatusMessage("Матрицю збережено");
			await loadMatrix();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося зберегти матрицю");
		}
	};

	const matrixHeaders = matrixData.criteria;

	return (
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
	);
};
