import { alternativesApi } from "@/features/alternatives/api";
import { useAlternativesStore } from "@/features/alternatives/store";

export const alternativesController = {
  load: async () => {
    const data = await alternativesApi.getAll();

    useAlternativesStore.getState().setAlternatives(data);
  },

  create: async (payload) => {
    const newAlternative = await alternativesApi.create(payload);

    useAlternativesStore.getState().addAlternative(newAlternative);
  },

  remove: async (id) => {
    await alternativesApi.remove(id);

    useAlternativesStore.getState().removeAlternative(id);
  },
};
