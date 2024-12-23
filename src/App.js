import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Introduction from './pages/introduction';
import Downloads from './pages/downloads';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Introduction />} /> 
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
        {/* <Route exact path='/' render={<Introduction />} /> */}
        {/* <Route exact path='/downloads' render={<Downloads />} /> */}
          
      </div>
    </BrowserRouter>
  );
}

export default App;
