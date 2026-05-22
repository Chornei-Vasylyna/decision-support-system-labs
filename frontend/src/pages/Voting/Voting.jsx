import { useCallback, useEffect, useState } from "react";
import { criteriaService } from "@/services/criteriaService";
import { votingService } from "@/services/votingService";
import { useCriteriaStore } from "@/stores/useCriteriaStore";
import VotingImportSection from "./Voting/VotingImportSection";
import VotingMethodsSection from "./Voting/VotingMethodsSection";
import VotingSummarySection from "./Voting/VotingSummarySection";
import VotingWeightsSection from "./Voting/VotingWeightsSection";

const createEmptyImportForm = () => ({
	url: "",
	createMissing: true,
});

const METHOD_LABELS = {
	simpleMajority: "Проста більшість",
	bordaCount: "Метод Борда",
	condorcet: "Кондорсе",
	approvalVoting: "Відкрите голосування",
};

const METHOD_VALUE_META = {
	simpleMajority: { key: "votes", label: "Голоси" },
	bordaCount: { key: "bordaScore", label: "Бали Борда" },
	condorcet: { key: "condorcetWins", label: "Перемоги" },
	approvalVoting: { key: "approvals", label: "Схвалення" },
};

export const VotingPage = () => {
	const criteria = useCriteriaStore((state) => state.criteria);
	const [importForm, setImportForm] = useState(createEmptyImportForm());
	const [importErrors, setImportErrors] = useState({});
	const [weightErrors, setWeightErrors] = useState({});
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [selectedMethod, setSelectedMethod] = useState("bordaCount");
	const [methodResult, setMethodResult] = useState(null);
	const [weightDrafts, setWeightDrafts] = useState({});
	const [votes, setVotes] = useState([]);

	const loadVotingData = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");

		try {
			await criteriaService.load();
			const currentVotes = await votingService.loadVotes();
			setVotes(currentVotes);
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося завантажити дані голосування",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadVotingData();
	}, [loadVotingData]);

	useEffect(() => {
		setWeightDrafts(
			Object.fromEntries(
				criteria.map((criterion) => [criterion.id, criterion.weight ?? 0]),
			),
		);
	}, [criteria]);

	const handleImportSubmit = async (event) => {
		event.preventDefault();

		const errors = votingService.validateImport(importForm);
		setImportErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			return;
		}

		try {
			await votingService.importFromGoogle(importForm);
			setStatusMessage("Імпорт голосів завершено");
			setImportForm(createEmptyImportForm());
			await loadVotingData();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося імпортувати голоси");
		}
	};

	const handleRunMethod = async (method) => {
		setSelectedMethod(method);
		setStatusMessage("");

		try {
			const result = await votingService.getMethodResult(method);
			setMethodResult({ method, result });
			setStatusMessage(`Метод ${METHOD_LABELS[method] || method} виконано`);
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося виконати метод голосування",
			);
		}
	};

	const handleApplyVotingResults = async () => {
		setStatusMessage("");

		try {
			await votingService.applyVotingResults(selectedMethod);
			setStatusMessage("Ваги оновлено за результатами голосування");
			await loadVotingData();
		} catch (error) {
			setStatusMessage(
				error.message || "Не вдалося застосувати результати голосування",
			);
		}
	};

	const handleWeightChange = (criterionId, value) => {
		setWeightDrafts((current) => ({
			...current,
			[criterionId]: value,
		}));
	};

	const handleSaveWeights = async () => {
		const errors = votingService.validateWeights(
			criteria.map((criterion) => ({
				...criterion,
				weight: weightDrafts[criterion.id],
			})),
		);
		setWeightErrors(errors);
		setStatusMessage("");

		if (Object.keys(errors).length > 0) {
			setStatusMessage("Перевірте значення ваг");
			return;
		}

		try {
			await votingService.updateWeights(
				criteria.map((criterion) => ({
					id: criterion.id,
					weight: Number(weightDrafts[criterion.id]),
				})),
			);
			setStatusMessage("Ваги критеріїв збережено");
			await loadVotingData();
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося зберегти ваги");
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">Голосування</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Імпорт голосів, запуск методів та керування вагами критеріїв
				</p>
			</div>

			{statusMessage && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{statusMessage}
				</div>
			)}
			<VotingImportSection
				importErrors={importErrors}
				importForm={importForm}
				onFormChange={(key, value) =>
					setImportForm((current) => ({ ...current, [key]: value }))
				}
				onRefresh={loadVotingData}
				onSubmit={handleImportSubmit}
			/>

			<VotingMethodsSection
				loading={loading}
				methodLabels={METHOD_LABELS}
				methodResult={methodResult}
				methodValueMeta={METHOD_VALUE_META}
				methods={votingService.methods}
				onApplyVotingResults={handleApplyVotingResults}
				onRunMethod={handleRunMethod}
				onSelectMethod={setSelectedMethod}
				selectedMethod={selectedMethod}
			/>

			<VotingWeightsSection
				criteria={criteria}
				onSaveWeights={handleSaveWeights}
				onWeightChange={handleWeightChange}
				weightDrafts={weightDrafts}
				weightErrors={weightErrors}
			/>

			<VotingSummarySection
				criteriaCount={criteria.length}
				votesCount={votes.length}
			/>
		</div>
	);
};
