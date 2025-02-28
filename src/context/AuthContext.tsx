import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { initializeApp } from "firebase/app";

// 🔥 Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBA8IK_636oFyopbFNDIefWfjuAEfSSgoI",
    authDomain: "realtime-chat-adebc.firebaseapp.com",
    projectId: "realtime-chat-adebc",
    storageBucket: "realtime-chat-adebc.firebasestorage.app",
    messagingSenderId: "297810186318",
    appId: "1:297810186318:web:75cfc13d2552ffe98e331f"
};

// ✅ Initialisation Firebase (si pas déjà initialisé)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔑 Création du contexte
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ currentUser, loading }}>{!loading && children}</AuthContext.Provider>;
};

// 🏆 Hook personnalisé pour accéder au contexte d'authentification
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
