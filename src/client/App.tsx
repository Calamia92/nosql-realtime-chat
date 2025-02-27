import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home.js";
import ChatLayout from "../components/ChatLayout.js"; // Le layout qui affiche les 2 composants
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* On utilise ChatLayout pour regrouper Conversations et ChatApp */}
        <Route path="/conversations/*" element={<ChatLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
