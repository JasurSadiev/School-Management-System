// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyBVw2yqHGS9-dzfnE3pLozocmkaavjsPXo",
	authDomain: "sadiev-s-school.firebaseapp.com",
	projectId: "sadiev-s-school",
	storageBucket: "sadiev-s-school.firebasestorage.app",
	messagingSenderId: "744310421152",
	appId: "1:744310421152:web:92ee27b36ce4d982f1fbc5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
