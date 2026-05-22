export const VotingSummarySection = ({ criteriaCount, votesCount }) => {
	return (
		<section className="grid gap-4 md:grid-cols-2">
			<div className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">Статистика</h2>
				<p className="text-sm text-stone-600 mt-1">
					Завантажено критеріїв: {criteriaCount}
				</p>
				<p className="text-sm text-stone-600 mt-1">
					Завантажено голосів: {votesCount}
				</p>
			</div>

			<div className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">Підказка</h2>
				<p className="text-sm text-stone-600 mt-1">
					Спочатку імпортуйте голоси, потім запустіть метод і за потреби
					збережіть ваги вручну.
				</p>
			</div>
		</section>
	);
};

export default VotingSummarySection;
