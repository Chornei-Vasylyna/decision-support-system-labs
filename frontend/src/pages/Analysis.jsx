export const AnalysisPage = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Аналіз результатів
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Порівняння методів згортки, чутливість та сценарії
				</p>
			</div>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">Ранжування</h2>
				<p className="text-sm text-stone-600 mt-1">
					Тут буде порівняння additive, cautious та multiplicative результатів.
				</p>
			</section>

			<section className="grid md:grid-cols-2 gap-4">
				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">
						Аналіз чутливості
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Вплив зміни ваг на переможця.
					</p>
				</div>
				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">Сценарії</h2>
					<p className="text-sm text-stone-600 mt-1">
						Керування сценаріями та запуск їх оцінки.
					</p>
				</div>
			</section>
		</div>
	);
};
