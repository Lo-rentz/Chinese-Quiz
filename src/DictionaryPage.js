import { useEffect, useState } from "react";
import Papa from "papaparse";
import { playChinese } from "./utils/tts";



function DictionaryPage() {
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [pinyin, setPinyin] = useState("");
  const [category, setCategory] = useState("");

  // Mock conversion functions
  const mockConvertToHanzi = (pinyin) => {
    return "汉字" + pinyin; // Just a placeholder
  };

  const mockConvertToEnglish = (pinyin) => {
    return "Meaning of " + pinyin;
  };

  useEffect(() => {
    fetch("/dictionary.csv")
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setAllData(parsed.data);
        const cats = Array.from(new Set(parsed.data.map(item => item.Category)));
        setCategories(cats);
        setSelectedCategory(cats[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setFilteredData(allData.filter(entry => entry.Category === selectedCategory));
  }, [selectedCategory, allData]);

  return (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-6 text-center">Dictionary Editor</h1>

    {/* Category Dropdown */}
    <div className="mb-4 max-w-sm">
      <label className="block mb-2 font-medium">Filter by Category:</label>
      <select
        className="border p-2 rounded w-full"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>



    {/* Table + Form Side by Side */}
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Word Table */}
      <div className="flex-1 overflow-auto border rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Hanzi</th>
              <th className="p-2 border">Pinyin</th>
              <th className="p-2 border">English</th>
              <th className="p-2 border">Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td>
                {entry.Hanzi}
                <button
                onClick={() => playChinese(entry.Hanzi)}
                title="Play Hanzi"
                style={{ marginLeft: "0.5rem", fontSize: "1rem", cursor: "pointer" }}
                >
                🔊
                </button>
                </td>

                <td className="p-2 border">{entry.Pinyin}</td>
                <td className="p-2 border">{entry.English}</td>
                <td className="p-2 border">{entry.Category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Entry Form */}
      <div className="w-full lg:w-80 border rounded p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newEntry = {
              Hanzi: mockConvertToHanzi(pinyin),
              Pinyin: pinyin,
              English: mockConvertToEnglish(pinyin),
              Category: category,
            };
            setAllData((prev) => [...prev, newEntry]);
            if (newEntry.Category === selectedCategory) {
              setFilteredData((prev) => [...prev, newEntry]);
            }
            if (!categories.includes(newEntry.Category)) {
              setCategories((prev) => [...prev, newEntry.Category]);
            }
            setPinyin("");
            setCategory("");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Pinyin</label>
            <input
              className="border p-2 rounded w-full"
              value={pinyin}
              onChange={(e) => setPinyin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <input
              className="border p-2 rounded w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Add Entry
          </button>
        </form>
      </div>
    </div>
  </div>
);



}

export default DictionaryPage;
