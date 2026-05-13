export const ExplanationPage = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Пояснення рішення
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Причини вибору альтернативи та вплив критеріїв
				</p>
			</div>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">
					Обрана альтернатива
				</h2>
				<p className="text-sm text-stone-600 mt-1">
					Тут буде показано найкращу альтернативу та її бал.
				</p>
			</section>

			<section className="grid md:grid-cols-2 gap-4">
				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">
						Найвпливовіші критерії
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Топ критеріїв за внеском у фінальний результат.
					</p>
				</div>
				<div className="bg-white border border-stone-200 rounded-xl p-4">
					<h2 className="text-base font-medium text-stone-800">
						Застосовані правила
					</h2>
					<p className="text-sm text-stone-600 mt-1">
						Перелік спрацьованих IF-THEN правил для обраної альтернативи.
					</p>
				</div>
			</section>
		</div>
	);
};
