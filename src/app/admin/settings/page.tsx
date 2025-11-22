"use client";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p>Here are some settings:</p>
      <form>
        <label className="block mb-2">
          <span className="text-gray-700">Setting 1</span>
          <input type="text" className="block w-full mt-1" />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700">Setting 2</span>
          <input type="text" className="block w-full mt-1" />
        </label>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Save</button>
      </form>
    </div>
  );
}
