export const RowActions = ({ onEdit, onRemove }) => {
	return (
		<td className="p-3 text-right space-x-3">
			<button
				type="button"
				onClick={onEdit}
				className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
			>
				Редагувати
			</button>
			<button
				type="button"
				onClick={onRemove}
				className="text-sm text-stone-500 hover:text-red-500 cursor-pointer"
			>
				Видалити
			</button>
		</td>
	);
};
