import { useState } from "react";
import { evaluationsService } from "@/services/evaluationsService";

const methodLabels = {
	arithmeticMean: "Середнє арифметичне",
	geometricMean: "Середнє геометричне",
	median: "Медіана",
};

export const Consensus = ({ matrixData, setStatusMessage }) => {
	const [selectedCriterionId, setSelectedCriterionId] = useState(null);
	const [consensusMethod, setConsensusMethod] = useState("arithmeticMean");
	const [consensusResult, setConsensusResult] = useState(null);

	const handleCalculateConsensus = async () => {
		if (!selectedCriterionId) {
			setStatusMessage("Оберіть критерій");
			return;
		}

		try {
			const scores = matrixData.matrix
    			.map((row) => Number(row.scores?.[selectedCriterionId]))
    			.filter((s) => Number.isFinite(s));

			if (scores.length < 2) {
				setStatusMessage("Потрібно принаймні 2 оцінки для узгодження");
				return;
			}

			const result = await evaluationsService.consensus(
				scores,
				  consensusMethod,
			);
			setConsensusResult(result);
			setStatusMessage(
				`Узгоджена оцінка розрахована: ${Number(result.result).toFixed(4)}`,
			);
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося розрахувати узгодження");
		}
	};

	return (
		<section className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
			<h2 className="text-base font-medium text-stone-800">
				Узгодження оцінок
			</h2>
			<p className="text-sm text-stone-600">
				Розрахуйте узгоджену оцінку для кожного критерію, усереднивши оцінки
				всіх альтернатив.
			</p>

			<div className="grid md:grid-cols-2 gap-4">
				<div>
					<label className="text-sm text-stone-700 block mb-2">
						Критерій
					</label>
					<select
						value={selectedCriterionId || ""}
						onChange={(e) => setSelectedCriterionId(Number(e.target.value))}
						className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
					>
						<option value="">Оберіть критерій</option>
						{matrixData.criteria.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="text-sm text-stone-700 block mb-2">
						Метод узгодження
					</label>
					<select
						value={consensusMethod}
						onChange={(e) => setConsensusMethod(e.target.value)}
						className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
					>
						<option value="arithmeticMean">Середнє арифметичне</option>
						<option value="geometricMean">Середнє геометричне</option>
						<option value="median">Медіана</option>
					</select>
				</div>
			</div>

			<button
				type="button"
				onClick={handleCalculateConsensus}
				className="bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-sm"
			>
				Розрахувати узгодження
			</button>

			{consensusResult && (
				<div className="p-3 bg-stone-50 border border-stone-100 rounded-lg space-y-2">
					<p className="text-sm text-stone-700">
						<span className="font-medium">Узгоджена оцінка:</span>{" "}
						{Number(consensusResult.result).toFixed(4)}
					</p>
					<p className="text-xs text-stone-600">
						Метод: {methodLabels[consensusResult.method] || consensusResult.method} | Оцінок узято: {consensusResult.scoresCount}
					</p>
				</div>
			)}
		</section>
	);
};
