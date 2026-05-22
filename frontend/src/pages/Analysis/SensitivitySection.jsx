const formatNumber = (value, digits = 4) => Number(value ?? 0).toFixed(digits);
const hasItems = (value) => Array.isArray(value) && value.length > 0;

const SensitivityImpactsTable = ({ impacts }) => (
	<div className="overflow-x-auto">
		<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden text-sm">
			<thead>
				<tr className="bg-stone-100">
					<th className="px-3 py-2 text-left text-stone-700">Критерій</th>
					<th className="px-3 py-2 text-left text-stone-700">Напрям</th>
					<th className="px-3 py-2 text-left text-stone-700">Крок</th>
					<th className="px-3 py-2 text-left text-stone-700">Лідер змінився</th>
				</tr>
			</thead>
			<tbody>
				{impacts.map((item) => (
					<tr
						key={`${item.criterionId}-${item.direction}-${item.step}`}
						className="border-t border-stone-200"
					>
						<td className="px-3 py-2 text-stone-800">{item.criterionName}</td>
						<td className="px-3 py-2 text-stone-700">
							{item.direction === "up" ? "Підвищення" : "Зниження"}
						</td>
						<td className="px-3 py-2 text-stone-700">
							{formatNumber(item.step, 2)}
						</td>
						<td className="px-3 py-2 text-stone-700">
							{item.winnerChanged ? "Так" : "Ні"}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export const SensitivitySection = ({
	sensitivity,
	sensitivityParams,
	setSensitivityParams,
	onRun,
	loading,
	getAlternativeLabel,
}) => (
	<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
		<h2 className="text-base font-medium text-stone-800">Аналіз чутливості</h2>
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
					setSensitivityParams((current) => ({
						...current,
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
					setSensitivityParams((current) => ({
						...current,
						range: Number(e.target.value),
					}))
				}
				className="w-28 border rounded-md px-2 py-1"
			/>
			<button
				type="button"
				onClick={onRun}
				disabled={loading}
				className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
			>
				Запустити чутливість
			</button>
		</div>

		{sensitivity && (
			<div className="mt-4 space-y-3">
				<div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
					<p className="text-sm font-medium text-stone-800">
						Базовий результат
					</p>
					<p className="text-sm text-stone-700 mt-1">
						{sensitivity.baseline?.winner
							? `${getAlternativeLabel(sensitivity.baseline.winner.alternativeId)} · ${formatNumber(sensitivity.baseline.winner.score)}`
							: "Немає даних"}
					</p>
				</div>
				{hasItems(sensitivity.impacts) && (
					<SensitivityImpactsTable impacts={sensitivity.impacts} />
				)}
			</div>
		)}
	</section>
);
