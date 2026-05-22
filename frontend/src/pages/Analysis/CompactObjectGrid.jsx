export const CompactObjectGrid = ({ data, emptyLabel = "Немає даних" }) => {
	if (!data || typeof data !== "object") {
		return <p className="text-sm text-stone-600">{emptyLabel}</p>;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			{Object.entries(data).map(([key, value]) => (
				<div
					key={key}
					className="rounded-lg border border-stone-200 bg-white p-3"
				>
					<p className="text-xs uppercase tracking-wide text-stone-500">
						{key}
					</p>
					<p className="mt-1 text-sm text-stone-800 wrap-break-word">
						{typeof value === "object" ? JSON.stringify(value) : String(value)}
					</p>
				</div>
			))}
		</div>
	);
};
