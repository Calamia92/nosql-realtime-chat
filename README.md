# 📌 NoSQL Realtime Chat

Bienvenue dans **NoSQL Realtime Chat**, une application de chat en temps réel utilisant **Firebase Firestore**, **WebSockets**, **Express**, et **React avec Vite**.

---

## 🚀 Installation et Lancement du Projet

### **1️⃣ Cloner le projet**
```sh
git clone https://github.com/Calamia92/nosql-realtime-chat.git
cd nosql-realtime-chat
```

### **2️⃣ Installer les dépendances**
```sh
npm install
```

### **3️⃣ Ajouter votre clé Firebase**
1. **Créer un projet Firebase** sur [Firebase Console](https://console.firebase.google.com/)
2. **Activer Firestore Database**
3. **Générer la clé privée** :
   - Aller dans **Paramètres du projet** > **Comptes de service**
   - Cliquer sur **Générer une nouvelle clé privée**
   - Télécharger `serviceAccountKey.json`
4. **Placer le fichier dans `nosql-chat/`** (à la racine du projet)

### **4️⃣ Lancer le serveur backend**
```sh
npm run dev:server
```
> 📌 Le backend sera accessible sur **`http://localhost:3000`**.

### **5️⃣ Lancer le frontend**
```sh
npm run dev:client
```
> 📌 Le frontend sera accessible sur **`http://localhost:5173`**.

### **6️⃣ Lancer backend et frontend en une seule commande**
```sh
npm run dev
```
> 📌 Cela démarre **backend + frontend en parallèle**.

---

## 📂 Architecture du Projet

```
/realtime-chat
│── /src
│   ├── /client  # Frontend React + Vite
|     |── /components
│   │   ├── App.tsx  # Composant principal
│   │   ├── main.tsx  # Point d'entrée React
│   ├── /server  # Backend Express + WebSockets
│   │   ├── index.ts  # Serveur principal
│── package.json  # Dépendances et scripts
│── tsconfig.json  # Configuration TypeScript
│── vite.config.ts  # Configuration Vite
│── .gitignore  # Fichiers à exclure de Git
│── serviceAccountKey.json  # 🔥 Clé privée Firebase (Ne pas committer !)
```

---

## 🚀 Fonctionnalités
✅ **Chat en temps réel** avec **WebSockets**
✅ **Sauvegarde des messages** dans **Firebase Firestore**
✅ **Backend en TypeScript** avec **Express.js**
✅ **Frontend React avec Vite** pour une meilleure performance

