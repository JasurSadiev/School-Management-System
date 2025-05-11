// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyD65YDCBn115_pYMltqfmC9NcK7xO92p1U",
	authDomain: "it-land-afe26.firebaseapp.com",
	projectId: "it-land-afe26",
	storageBucket: "it-land-afe26.firebasestorage.app",
	messagingSenderId: "912784959065",
	appId: "1:912784959065:web:0bb812f8d86f7c9daa7348",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
