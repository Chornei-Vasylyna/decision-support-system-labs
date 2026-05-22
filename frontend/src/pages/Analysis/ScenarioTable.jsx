export const ScenarioTable = ({ scenarios, onApplyScenario }) => (
	<div className="overflow-x-auto">
		<table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
			<thead>
				<tr className="bg-stone-100">
					<th className="px-3 py-2 text-left text-sm text-stone-700">Назва</th>
					<th className="px-3 py-2 text-left text-sm text-stone-700">Опис</th>
					<th className="px-3 py-2 text-right text-sm text-stone-700">Дії</th>
				</tr>
			</thead>
			<tbody>
				{scenarios.map((scenario) => (
					<tr key={scenario.id} className="border-t border-stone-200">
						<td className="px-3 py-2 text-sm text-stone-800">
							{scenario.name}
						</td>
						<td className="px-3 py-2 text-sm text-stone-600">
							{scenario.description}
						</td>
						<td className="px-3 py-2 text-right">
							<button
								type="button"
								onClick={() => onApplyScenario(scenario.id)}
								className="text-sm text-blue-500 hover:text-blue-700"
							>
								Запустити
							</button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);
