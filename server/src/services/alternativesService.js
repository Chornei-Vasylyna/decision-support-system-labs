import { alternativesRepository } from "../repositories/alternativesRepository.js";

export const alternativesService = {
  getAll: async () => {
    return await alternativesRepository.getAll();
  },

  create: async (name, description) => {
    if (!name?.trim()) {
      throw new Error("Alternative name required");
    }

    return await alternativesRepository.create(
      name.trim(),
      description?.trim() || "",
    );
  },

  remove: async (id) => {
    return await alternativesRepository.remove(id);
  },
};
