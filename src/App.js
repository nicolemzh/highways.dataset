import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Introduction from './pages/introduction';
import Downloads from './pages/downloads';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="" element={<Introduction />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
