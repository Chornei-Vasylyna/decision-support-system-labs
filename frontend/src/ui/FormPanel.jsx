export const FormPanel = ({
	title,
	description,
	submitLabel,
	onSubmit,
	children,
	error,
}) => {
	return (
		<form
			onSubmit={onSubmit}
			className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3"
		>
			{title && (
				<div>
					<h2 className="text-lg font-medium text-stone-800">{title}</h2>
					{description && (
						<p className="text-sm text-stone-600 mt-0.5">{description}</p>
					)}
				</div>
			)}

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{children}

			{submitLabel && (
				<button
					type="submit"
					className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
				>
					{submitLabel}
				</button>
			)}
		</form>
	);
};

export default FormPanel;
