import { useEffect, useState } from "react";
import { alternativesController } from "@/features/alternatives/controller";
import { useAlternativesStore } from "@/features/alternatives/store";

export const AlternativesPage = () => {
  const { alternatives } = useAlternativesStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    alternativesController.load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    await alternativesController.create({ name, description });

    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">Альтеренативи</h1>
        <p className="text-sm text-stone-600 mt-0.5">
          Керування альтернативами
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Назва альтернативи"
          className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опис"
          className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2 min-h-28 text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors resize-none"
        />
        <button
          type="submit"
          className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Додати альтренативу
        </button>
      </form>

      <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-200/60 border-b border-stone-200">
              <th className="text-left p-3 text-sm font-medium text-stone-700">
                ID
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-700">
                Назва
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-700">
                Опис
              </th>
              <th className="text-right p-3 text-sm font-medium text-stone-700">
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {alternatives.map((a, index) => (
              <tr
                key={a.id}
                className="border-t border-stone-200 hover:bg-stone-100/60 transition-colors"
              >
                <td className="p-3 text-sm text-stone-600">{index + 1}</td>
                <td className="p-3 text-sm font-medium text-stone-800">
                  {a.name}
                </td>
                <td className="p-3 text-sm text-stone-700">
                  {a.description || "—"}
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => alternativesController.remove(a.id)}
                    className="text-sm text-stone-500 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
