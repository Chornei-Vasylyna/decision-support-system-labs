export const MatrixPage = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Матриця оцінювання
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Імпорт оцінок та редагування значень альтернатив за критеріями
				</p>
			</div>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">
					Імпорт з Google Sheets
				</h2>
				<p className="text-sm text-stone-600 mt-1">
					Тут буде форма для URL таблиці та режиму імпорту.
				</p>
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">
					Редактор матриці
				</h2>
				<p className="text-sm text-stone-600 mt-1">
					Табличний редактор оцінок альтернатив x критеріїв буде підключено
					далі.
				</p>
			</section>
		</div>
	);
};
