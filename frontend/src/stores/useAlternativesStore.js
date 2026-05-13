import { create } from "zustand";

export const useAlternativesStore = create((set) => ({
	alternatives: [],

	setAlternatives: (data) =>
		set({
			alternatives: data,
		}),

	addAlternative: (alternative) =>
		set((state) => ({
			alternatives: [...state.alternatives, alternative],
		})),

	updateAlternative: (updated) =>
		set((state) => ({
			alternatives: state.alternatives.map((alternative) =>
				alternative.id === updated.id ? updated : alternative,
			),
		})),

	removeAlternative: (id) =>
		set((state) => ({
			alternatives: state.alternatives.filter((a) => a.id !== id),
		})),
}));
