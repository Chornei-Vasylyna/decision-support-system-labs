export const VotingPage = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Голосування</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Методи голосування для визначення ваг критеріїв
				</p>
			</div>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">
					Результати голосування
				</h2>
				<p className="text-sm text-stone-600 mt-1">
					Тут буде таблиця голосів та імпорт із Google Sheets.
				</p>
			</section>

			<section className="bg-white border border-stone-200 rounded-xl p-4">
				<h2 className="text-base font-medium text-stone-800">Методи</h2>
				<ul className="text-sm text-stone-700 list-disc pl-5 space-y-1">
					<li>Simple Majority</li>
					<li>Borda Count</li>
					<li>Condorcet</li>
					<li>Approval Voting</li>
				</ul>
			</section>
		</div>
	);
};
