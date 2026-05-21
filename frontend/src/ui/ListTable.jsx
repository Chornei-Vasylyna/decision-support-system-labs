export const ListTable = ({ headers = [], items = [], renderRow }) => {
	return (
		<div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
			<table className="w-full">
				<thead>
					<tr className="bg-stone-200/60 border-b border-stone-200">
						{headers.map((h, idx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: not critical
							<th key={idx} className="p-3 text-left text-sm">
								{h}
							</th>
						))}
						<th className="p-3 text-right text-sm">Дії</th>
					</tr>
				</thead>

				<tbody>
					{items.map((it, i) => (
						<tr
							key={it.id || i}
							className="border-t border-stone-200 hover:bg-stone-100/60"
						>
							{renderRow(it, i)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ListTable;
