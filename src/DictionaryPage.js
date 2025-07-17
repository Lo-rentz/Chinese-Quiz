import { useEffect, useState } from "react";
import Papa from "papaparse";
import { playChinese } from "./utils/tts";
import pinyin from "pinyin";


function DictionaryPage({ ttsSpeed }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [hanzi, setHanzi] = useState("");
  const [category, setCategory] = useState("");
  const [english, setEnglish] = useState("");
  const convertToPinyin = (hanzi) => {
    return pinyin(hanzi, { style: pinyin.STYLE_TONE2 }).flat().join(" ");
  };



  // Mock conversion functions
  const mockConvertToHanzi = (pinyin) => {
    return "汉字" + pinyin; // Just a placeholder
  };

  const mockConvertToEnglish = (pinyin) => {
    return "Meaning of " + pinyin;
  };


  //Open Dictionary
  useEffect(() => {
  const stored = localStorage.getItem("dictionary");
  if (stored) {
    const data = JSON.parse(stored);
    setAllData(data);
    const cats = Array.from(new Set(data.map(item => item.Category)));
    setCategories(cats);
    setSelectedCategory(cats[0]);
  } else {
    fetch("/dictionary.csv")
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setAllData(parsed.data);
        const cats = Array.from(new Set(parsed.data.map(item => item.Category)));
        setCategories(cats);
        setSelectedCategory(cats[0]);
      });
  }
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
        className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
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
      <table className="min-w-full text-left text-sm border dark:border-gray-600">
<thead className="bg-gray-100 dark:bg-gray-700 text-black dark:text-white">
  <tr>
    <th className="p-2 border dark:border-gray-600">Hanzi</th>
    <th className="p-2 border dark:border-gray-600">Pinyin</th>
    <th className="p-2 border dark:border-gray-600">English</th>
    <th className="p-2 border dark:border-gray-600">Category</th>
  </tr>
</thead>
<tbody>
  {filteredData.map((entry, idx) => (
    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 text-black dark:text-white">
      {editingIndex === idx ? (
        <>
          <td className="p-2 border dark:border-gray-600">
            <input
              className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
              value={editEntry.Hanzi}
              onChange={(e) =>
                setEditEntry({ ...editEntry, Hanzi: e.target.value })
              }
            />
          </td>
          <td className="p-2 border dark:border-gray-600">
            <input
              className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"

              value={editEntry.Pinyin}
              onChange={(e) =>
                setEditEntry({ ...editEntry, Pinyin: e.target.value })
              }
            />
          </td>
          <td className="p-2 border dark:border-gray-600">
            <input
              className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"

              value={editEntry.English}
              onChange={(e) =>
                setEditEntry({ ...editEntry, English: e.target.value })
              }
            />
          </td>
          <td className="p-2 border dark:border-gray-600 flex gap-2 items-center">
            <input
              className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"

              value={editEntry.Category}
              onChange={(e) =>
                setEditEntry({ ...editEntry, Category: e.target.value })
              }
            />
            <button
              className="dark:text-green-600 font-bold"
              onClick={() => {
                const updated = [...allData];
                const realIndex = allData.findIndex(
                  (e) =>
                    e.Hanzi === entry.Hanzi &&
                    e.Pinyin === entry.Pinyin &&
                    e.English === entry.English &&
                    e.Category === entry.Category
                );
                updated[realIndex] = editEntry;
                setAllData(updated);
                localStorage.setItem("dictionary", JSON.stringify(updated));

                if (editEntry.Category === selectedCategory) {
                  const updatedFiltered = [...filteredData];
                  updatedFiltered[idx] = editEntry;
                  setFilteredData(updatedFiltered);
                }

                setEditingIndex(null);
                setEditEntry(null);
              }}
            >
              ✅
            </button>
            <button
              className="dark:text-red-600 font-bold"
              onClick={() => {
                setEditingIndex(null);
                setEditEntry(null);
              }}
            >
              ❌
            </button>
          </td>
        </>
      ) : (
        <>
          <td className="p-2 border">
            {entry.Hanzi}
            <button
              onClick={() => playChinese(entry.Hanzi, ttsSpeed)}
              title="Play Hanzi"
              className="ml-2"
            >
              🔊
            </button>
          </td>
          <td className="p-2 border">{entry.Pinyin}</td>
          <td className="p-2 border">{entry.English}</td>
          <td className="p-2 border flex gap-2 items-center justify-between">
        {entry.Category}
        <div className="flex gap-2 text-sm">
          <button
            className="text-blue-600"
            onClick={() => {
              setEditingIndex(idx);
              setEditEntry({ ...entry });
            }}
          >
            ✏️
          </button>
          <button
            className="text-red-600"
            onClick={() => {
              // Remove entry from full data
              const updatedAll = allData.filter((_, i) => {
                const match =
                  allData[i].Hanzi === entry.Hanzi &&
                  allData[i].Pinyin === entry.Pinyin &&
                  allData[i].English === entry.English &&
                  allData[i].Category === entry.Category;
                return !match;
              });

              // Remove from filtered view
              const updatedFiltered = filteredData.filter((_, i) => i !== idx);

              setAllData(updatedAll);
              setFilteredData(updatedFiltered);
              localStorage.setItem("dictionary", JSON.stringify(updatedAll));
            }}
          >
            🗑️
          </button>
        </div>
      </td>

              </>
            )}
          </tr>
        ))}
      </tbody>

        </table>
      </div>

      {/* Add Entry Form */}
      <div className="w-full lg:w-80 border dark:border-gray-600 rounded p-4 shadow-sm bg-white dark:bg-gray-800">
  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Entry</h2>
  <form
        onSubmit={(e) => {
          e.preventDefault();
          const newPinyin = convertToPinyin(hanzi);
          const newEntry = {
            Hanzi: hanzi,
            Pinyin: newPinyin,
            English: english || "Unknown", // Let user leave empty or fill manually
            Category: category,
          };

          const updatedData = [...allData, newEntry];
          setAllData(updatedData);
          localStorage.setItem("dictionary", JSON.stringify(updatedData));

          if (newEntry.Category === selectedCategory) {
            setFilteredData((prev) => [...prev, newEntry]);
          }

          if (!categories.includes(newEntry.Category)) {
            setCategories((prev) => [...prev, newEntry.Category]);
          }

          setHanzi("");
          setCategory("");
          setEnglish("");
        }}


          className="space-y-4"
        >

          <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Hanzi</label>
   <input
     className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
              value={hanzi}
              onChange={(e) => setHanzi(e.target.value)}
              required
            />
          </div>

          <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
   <input
     className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">English</label>
   <input
     className="border p-2 rounded w-full bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
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
