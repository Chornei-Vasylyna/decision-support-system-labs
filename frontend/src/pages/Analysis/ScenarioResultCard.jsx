import { CompactObjectGrid } from "./CompactObjectGrid.jsx";
import { RankingTable } from "./RankingTable.jsx";

const hasItems = (value) => Array.isArray(value) && value.length > 0;

export const ScenarioResultCard = ({ scenarioResult, getAlternativeLabel }) => {
	if (!scenarioResult) {
		return null;
	}

	return (
		<div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
			<h3 className="text-sm font-medium text-blue-900 mb-3">
				Результат сценарію
			</h3>
			{hasItems(scenarioResult.ranking) ? (
				<RankingTable
					items={scenarioResult.ranking}
					getAlternativeLabel={getAlternativeLabel}
					accent="blue"
				/>
			) : (
				<div className="mt-2">
					<CompactObjectGrid data={scenarioResult} emptyLabel="Немає даних" />
				</div>
			)}
		</div>
	);
};
