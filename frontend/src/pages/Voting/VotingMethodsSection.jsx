const getMethodValue = (methodResult, methodValueMeta) => {
	const valueKey = methodValueMeta[methodResult.method]?.key || "value";
	return (
		methodResult.result?.ranked?.map((item) => ({
			criterionId: item.criterionId,
			value:
				item[valueKey] ??
				item.votes ??
				item.bordaScore ??
				item.condorcetWins ??
				item.approvals ??
				0,
		})) || []
	);
};

export const VotingMethodsSection = ({
	loading,
	methodLabels,
	methodResult,
	methodValueMeta,
	methods,
	onApplyVotingResults,
	onRunMethod,
	onSelectMethod,
	selectedMethod,
}) => {
	const renderResult = () => {
		if (!methodResult) return null;

		if (Array.isArray(methodResult.result?.ranked)) {
			const rankedValues = getMethodValue(methodResult, methodValueMeta);

			return (
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
					<div className="overflow-x-auto">
						<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden text-sm bg-white">
							<thead>
								<tr className="bg-stone-100">
									<th className="px-3 py-2 text-left text-stone-700">Місце</th>
									<th className="px-3 py-2 text-left text-stone-700">
										Критерій
									</th>
									<th className="px-3 py-2 text-right text-stone-700">
										{methodValueMeta[methodResult.method]?.label || "Значення"}
									</th>
								</tr>
							</thead>
							<tbody>
								{rankedValues.map((item, index) => (
									<tr
										key={`${methodResult.method}-${item.criterionId}`}
										className="border-t border-stone-200"
									>
										<td className="px-3 py-2 text-stone-800 font-medium">
											{index + 1}
										</td>
										<td className="px-3 py-2 text-stone-800">
											Критерій {item.criterionId}
										</td>
										<td className="px-3 py-2 text-right text-stone-700">
											{Number(item.value).toFixed(4)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			);
		}

		return (
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
				<div className="grid gap-3 md:grid-cols-2">
					{Object.entries(methodResult.result || {}).map(([key, value]) => (
						<div
							key={key}
							className="rounded-lg border border-stone-200 bg-white p-3"
						>
							<p className="text-xs uppercase tracking-wide text-stone-500">
								{key}
							</p>
							<p className="text-sm text-stone-800 mt-1 break-all">
								{typeof value === "object"
									? JSON.stringify(value)
									: String(value)}
							</p>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
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
						onChange={(e) => onSelectMethod(e.target.value)}
						className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-stone-400"
					>
						{methods.map((method) => (
							<option key={method} value={method}>
								{methodLabels[method] || method}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={onApplyVotingResults}
						disabled={loading}
						className="bg-stone-600 hover:bg-stone-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
					>
						Застосувати до ваг
					</button>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{methods.map((method) => (
					<button
						key={method}
						type="button"
						onClick={() => onRunMethod(method)}
						className={`rounded-xl border px-4 py-3 text-left transition-colors ${
							selectedMethod === method
								? "border-stone-800 bg-stone-800 text-white"
								: "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400 hover:bg-stone-100"
						}`}
					>
						<div className="text-sm font-medium">{methodLabels[method]}</div>
						<div className="text-xs mt-1 opacity-80">Запустити розрахунок</div>
					</button>
				))}
			</div>

			{renderResult()}
		</section>
	);
};

export default VotingMethodsSection;
