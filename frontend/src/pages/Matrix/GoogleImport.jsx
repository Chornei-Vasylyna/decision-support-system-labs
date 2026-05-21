import { evaluationsService } from "@/services/evaluationsService";

export const GoogleImport = ({
	importForm,
	setImportForm,
	importErrors,
	setImportErrors,
	setStatusMessage,
	loadMatrix,
}) => {
	const createEmptyImportForm = () => ({
		url: "",
		createMissing: true,
	});

	const handleImportSubmit = async (event) => {
		event.preventDefault();

		const errors = evaluationsService.validateImport(importForm);
		setImportErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			await evaluationsService.importFromGoogle(importForm);
			setStatusMessage("Імпорт завершено");
			setImportForm(createEmptyImportForm());
			await loadMatrix();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося імпортувати матрицю");
		}
	};

	return (
		<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
			<div>
				<h2 className="text-base font-medium text-stone-800">
					Імпорт з Google Sheets
				</h2>
				<p className="text-sm text-stone-600 mt-1">
					Вкажіть посилання на Google Sheets. Якщо в таблиці є нові назви,
					їх можна
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
						placeholder="Посилання на Google Sheets"
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

				{/* spreadsheetId and gid inputs removed — derived from URL in service */}

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
	);
};
