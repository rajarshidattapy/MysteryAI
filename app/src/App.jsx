// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx';
import Auth from './Auth/Auth.jsx';
import ConnectWalletPage from './Auth/wallet-Connect.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/connect-wallet" element={<ConnectWalletPage />} />
        <Route
          path="/gameStart"
          element={

              <GameStart />

          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;