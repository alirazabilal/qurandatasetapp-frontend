import React, { useState } from "react";

const backendBase = "http://localhost:5000"; 
// 👆 agar backend deploy karoge to yahan URL replace kar dena

export default function SurahParaSelector() {
  const [selectionType, setSelectionType] = useState("para"); // "para" ya "surah"
  const [selectionValue, setSelectionValue] = useState("");
  const [ayats, setAyats] = useState([]);

  const fetchAyats = async () => {
    try {
      let url = "";
      if (selectionType === "surah") {
        url = `${backendBase}/api/surah/${selectionValue}`;
      } else {
        url = `${backendBase}/api/para/${selectionValue}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      console.log("Fetched data:", data);

      if (data.ayats && data.ayats.length > 0) {
        setAyats(data.ayats);
      } else {
        setAyats([]);
      }
    } catch (err) {
      console.error("Error fetching ayats:", err);
      setAyats([]);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-extrabold mb-6 text-center tracking-wide text-green-600">
        📖 Select Surah or Para
      </h2>

      {/* Dropdown for Surah/Para */}
      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded w-1/3"
          value={selectionType}
          onChange={(e) => {
            setSelectionType(e.target.value);
            setAyats([]); // reset list on change
          }}
        >
          <option value="para">Para</option>
          <option value="surah">Surah</option>
        </select>

        <input
          type="number"
          className="border p-2 rounded w-2/3"
          placeholder={`Enter ${selectionType} number`}
          value={selectionValue}
          onChange={(e) => setSelectionValue(e.target.value)}
        />
      </div>

      {/* Fetch button */}
      <button
        onClick={fetchAyats}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
      >
        Fetch
      </button>

      {/* Ayats List */}
      <div className="mt-6">
        {ayats.length > 0 ? (
          <ul className="space-y-3 text-right">
            {ayats.map((a, idx) => (
              <li key={idx} className="bg-gray-100 p-3 rounded shadow-sm">
                <span className="text-gray-500">[{a.index + 1}]</span>{" "}
                <span className="font-arabic text-lg">{a.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 text-center">No ayats found for this selection.</p>
        )}
      </div>
    </div>
  );
}
