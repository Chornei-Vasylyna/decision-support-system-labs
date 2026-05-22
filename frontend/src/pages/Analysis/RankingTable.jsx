const formatNumber = (value, digits = 4) => Number(value ?? 0).toFixed(digits);

export const RankingTable = ({
	items,
	getAlternativeLabel,
	accent = "stone",
}) => {
	if (!Array.isArray(items) || !items.length) {
		return <p className="text-sm text-stone-600">Немає результатів</p>;
	}

	const tone = accent === "blue" ? "blue" : "stone";
	const tableBorder = tone === "blue" ? "border-blue-200" : "border-stone-200";
	const headerBg = tone === "blue" ? "bg-blue-100" : "bg-stone-100";
	const rowBorder = tone === "blue" ? "border-blue-100" : "border-stone-200";
	const headText = tone === "blue" ? "text-blue-900" : "text-stone-700";
	const bodyText = tone === "blue" ? "text-blue-700" : "text-stone-700";
	const bodyHeadText = tone === "blue" ? "text-blue-900" : "text-stone-800";

	return (
		<div className="overflow-x-auto">
			<table
				className={`min-w-full border ${tableBorder} rounded-lg overflow-hidden text-sm bg-white`}
			>
				<thead>
					<tr className={headerBg}>
						<th className={`px-3 py-2 text-left ${headText}`}>Місце</th>
						<th className={`px-3 py-2 text-left ${headText}`}>Альтернатива</th>
						<th className={`px-3 py-2 text-right ${headText}`}>Оцінка</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr
							key={`${item.alternativeId}-${item.rank}`}
							className={`border-t ${rowBorder}`}
						>
							<td className={`px-3 py-2 font-medium ${bodyHeadText}`}>
								{item.rank}
							</td>
							<td className={`px-3 py-2 ${bodyHeadText}`}>
								{getAlternativeLabel(item.alternativeId)}
							</td>
							<td className={`px-3 py-2 text-right ${bodyText}`}>
								{formatNumber(item.score)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
