export const consensusService = {
	// Method 1: Arithmetic Mean (algebraic)
	arithmeticMean: (scores) => {
		if (!Array.isArray(scores) || !scores.length) {
			throw new Error("Scores array required and must not be empty");
		}

		const validScores = scores.filter((s) => Number.isFinite(s));
		if (!validScores.length) {
			throw new Error("No valid numeric scores provided");
		}

		const sum = validScores.reduce((acc, score) => acc + score, 0);

		return sum / validScores.length;
	},

	// Method 2: Geometric Mean
	geometricMean: (scores) => {
		if (!Array.isArray(scores) || !scores.length) {
			throw new Error("Scores array required and must not be empty");
		}

		const validScores = scores.filter((s) => Number.isFinite(s) && s > 0);
		if (!validScores.length) {
			throw new Error(
				"No valid positive numeric scores provided for geometric mean",
			);
		}

		const product = validScores.reduce((acc, score) => acc * score, 1);
		const nthRoot = product ** (1 / validScores.length);

		return nthRoot;
	},

	// Method 3: Median
	median: (scores) => {
		if (!Array.isArray(scores) || !scores.length) {
			throw new Error("Scores array required and must not be empty");
		}

		const validScores = scores
			.filter((s) => Number.isFinite(s))
			.sort((a, b) => a - b);

		if (!validScores.length) {
			throw new Error("No valid numeric scores provided");
		}

		const mid = Math.floor(validScores.length / 2);

		if (validScores.length % 2) {
			return validScores[mid];
		}

		return (validScores[mid - 1] + validScores[mid]) / 2;
	},
};
