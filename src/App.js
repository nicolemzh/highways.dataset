import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Introduction from './pages/introduction';
import Downloads from './pages/downloads';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <div className="App">
          <Link to="/" element={<Introduction />} />
          <Link to="/downloads" element={<Downloads />} />
      </div>
    </BrowserRouter>
  );
}

export default App;
