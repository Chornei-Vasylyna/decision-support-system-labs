import { useCallback, useEffect, useState } from "react";
import { evaluationsService } from "@/services/evaluationsService";
import { GoogleImport } from "./GoogleImport";
import { MatrixEditor } from "./MatrixEditor";
import { Consensus } from "./Consensus";

const createEmptyImportForm = () => ({
	url: "",
	createMissing: true,
});

export const MatrixPage = () => {
	const [matrixData, setMatrixData] = useState({
		alternatives: [],
		criteria: [],
		matrix: [],
	});
	const [importForm, setImportForm] = useState(createEmptyImportForm());
	const [importErrors, setImportErrors] = useState({});
	const [cellErrors, setCellErrors] = useState({});
	const [statusMessage, setStatusMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const loadMatrix = useCallback(async () => {
		setLoading(true);
		setStatusMessage("");

		try {
			const data = await evaluationsService.load();
			setMatrixData(data);
		} catch (error) {
			setStatusMessage(error.message || "Не вдалося завантажити матрицю");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMatrix();
	}, [loadMatrix]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-stone-800">
					Матриця оцінювання
				</h1>
				<p className="text-sm text-stone-600 mt-0.5">
					Імпорт з Google Sheets та редагування оцінок альтернатив за критеріями
				</p>
			</div>

			{statusMessage && (
				<div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
					{statusMessage}
				</div>
			)}

			<GoogleImport
				importForm={importForm}
				setImportForm={setImportForm}
				importErrors={importErrors}
				setImportErrors={setImportErrors}
				setStatusMessage={setStatusMessage}
				loadMatrix={loadMatrix}
			/>

			<MatrixEditor
				matrixData={matrixData}
				setMatrixData={setMatrixData}
				cellErrors={cellErrors}
				setCellErrors={setCellErrors}
				loading={loading}
				setStatusMessage={setStatusMessage}
				loadMatrix={loadMatrix}
			/>

			<Consensus
				matrixData={matrixData}
				setStatusMessage={setStatusMessage}
			/>
		</div>
	);
};
