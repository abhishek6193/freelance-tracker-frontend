import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Tailwind CSS is working!</h1>
      <p className="text-lg text-gray-700">If you see this styled message, Tailwind is set up correctly 🎉</p>
      <button className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Test Button</button>
    </div>
  );
}

export default App;
