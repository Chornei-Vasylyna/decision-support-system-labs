const BASE_URL = "http://localhost:3000/alternatives";

export const alternativesApi = {
  getAll: async () => {
    const res = await fetch(BASE_URL);

    return await res.json();
  },

  create: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    return await res.json();
  },

  remove: async (id) => {
    await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },
};
