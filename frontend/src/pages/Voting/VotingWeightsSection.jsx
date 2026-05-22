export const VotingWeightsSection = ({
	criteria,
	onSaveWeights,
	onWeightChange,
	weightDrafts,
	weightErrors,
}) => {
	return (
		<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-base font-medium text-stone-800">
						Ваги критеріїв
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Редагуйте ваги вручну або перезапишіть їх результатами голосування.
					</p>
				</div>
				<button
					type="button"
					onClick={onSaveWeights}
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
											onWeightChange(criterion.id, e.target.value)
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
	);
};

export default VotingWeightsSection;
