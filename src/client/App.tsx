import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import ChatLayout from "./components/ChatLayout.js";
import {AuthProvider} from "../context/AuthContext.js";

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/chat" element={<ChatLayout />} />
                    <Route path="*" element={<Login />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
