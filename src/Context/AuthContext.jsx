import React, { createContext, useContext, useState, useEffect } from "react";
import {
	onAuthStateChanged,
	signOut,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase.config"; // Your Firebase config and auth initialization
import { db } from "../firebase.config"; // Your Firestore instance
import { doc, getDoc } from "firebase/firestore"; // Firestore methods for getting user data
import { useNavigate } from "react-router-dom"; // React Router's hook for navigation
import { Box, CircularProgress } from "@mui/material"; // MUI CircularProgress
import { motion } from "framer-motion"; // Framer Motion for animations

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // Current authenticated user
	const [loading, setLoading] = useState(true); // Loading state for initial auth check
	const [role, setRole] = useState(null); // Store user role (position)
	const navigate = useNavigate(); // To handle redirection

	// Fetch user data from Firestore
	const fetchUserData = async (uid) => {
		try {
			const userDoc = doc(db, "users", uid); // Assuming you store user data under the 'users' collection
			const userSnap = await getDoc(userDoc);

			if (userSnap.exists()) {
				const userData = userSnap.data();
				setRole(userData.position); // Store the role (position) in the state
			} else {
				console.log("No user data found in Firestore");
			}
		} catch (error) {
			console.error("Error fetching user data from Firestore:", error.message);
		}
	};

	// Listen to Firebase auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (currentUser) {
				setUser(currentUser); // Set user object from Firebase auth
				// Fetch user data from Firestore (this is asynchronous)
				fetchUserData(currentUser.uid);
			} else {
				setUser(null); // Clear user data if no user is authenticated
				setRole(null); // Clear role when user logs out
				setLoading(false);
			}
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	// Wait for both user authentication and role data to be loaded
	useEffect(() => {
		// If both user and role are set, we can set loading to false

		if (user && role !== null) {
			setLoading(false);
		}
	}, [user, role]); // Dependency on both user and role

	// Firebase login function (example for email/password login)
	const login = async (email, password) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigate("/sign-in");
		} catch (error) {
			console.error("Login failed:", error.message);
		}
	};

	// Firebase logout function
	const logout = async () => {
		try {
			await signOut(auth);
			navigate("/sign-in", { replace: true }); // Redirect to login page after logging out
		} catch (error) {
			console.error("Logout failed:", error.message);
		}
	};

	// Show a beautiful loading indicator if we are still loading auth or role data
	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					backgroundColor: "#f5f5f5", // Light background for the loading screen
					position: "fixed",
					width: "100%",
					top: 0,
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<CircularProgress color='primary' size={60} />
					<motion.div
						initial={{ y: -10 }}
						animate={{ y: 10 }}
						transition={{
							duration: 0.6,
							yoyo: Infinity, // Makes the animation repeat
							ease: "easeInOut",
						}}
						style={{
							marginTop: 20,
							fontSize: "18px",
							color: "#333",
							fontWeight: "bold",
						}}
					>
						Loading, please wait...
					</motion.div>
				</Box>
			</motion.div>
		);
	}

	return (
		<AuthContext.Provider value={{ user, role, login, logout }}>
			{children}{" "}
			{/* Render children once the auth state and role are resolved */}
		</AuthContext.Provider>
	);
};

// Custom hook to use Auth Context
export const useAuth = () => useContext(AuthContext);
