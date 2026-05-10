import { create } from "zustand";

export const useCriteriaStore = create((set) => ({
	criteria: [],

	setCriteria: (data) => set({ criteria: data }),

	addCriteria: (c) =>
		set((state) => ({
			criteria: [...state.criteria, c],
		})),

	updateCriteria: (updated) =>
		set((state) => ({
			criteria: state.criteria.map((c) => (c.id === updated.id ? updated : c)),
		})),

	removeCriteria: (id) =>
		set((state) => ({
			criteria: state.criteria.filter((c) => c.id !== id),
		})),
}));
