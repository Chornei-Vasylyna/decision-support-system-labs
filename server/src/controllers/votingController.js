import { votingService } from "../services/votingService.js";

export const votingController = {
	getAll: async (_, res) => {
		try {
			const data = await votingService.getAllVotes();

			res.json(data);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to fetch votes", error: error.message });
		}
	},

	createVotes: async (req, res) => {
		try {
			const data = await votingService.createVotes(req.body?.votes);

			res.status(201).json({ created: data.length });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	simpleMajority: async (_, res) => {
		try {
			const data = await votingService.simpleMajority();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	bordaCount: async (_, res) => {
		try {
			const data = await votingService.bordaCount();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	condorcet: async (_, res) => {
		try {
			const data = await votingService.condorcet();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	approvalVoting: async (_, res) => {
		try {
			const data = await votingService.approvalVoting();

			res.json(data);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	importFromGoogle: async (req, res) => {
		try {
			const { url, spreadsheetId, gid, createMissing = true } = req.body || {};

			const result = await votingService.importFromGoogle({
				url,
				spreadsheetId,
				gid,
				createMissing,
			});

			res.status(200).json({ imported: result });
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	},

	removeByVoter: async (req, res) => {
		try {
			await votingService.removeVotesByVoter(req.params.voterId);

			res.sendStatus(204);
		} catch (error) {
			res
				.status(500)
				.json({ message: "Failed to remove votes", error: error.message });
		}
	},
};
