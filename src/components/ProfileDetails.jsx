import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase.config"; // Firebase
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { Button, TextField, Typography, Container, Box } from "@mui/material";
import {
	updatePassword,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from "firebase/auth";

const ProfileDetails = () => {
	const [userInfo, setUserInfo] = useState(null);
	const [oldPassword, setOldPassword] = useState(""); // State for old password
	const [newPassword, setNewPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Fetch user details from Firestore
	useEffect(() => {
		const fetchUserInfo = async () => {
			const user = auth.currentUser;
			if (user) {
				const userRef = doc(db, "users", user.uid);
				const userSnap = await getDoc(userRef);
				if (userSnap.exists()) {
					setUserInfo(userSnap.data());
				}
			}
		};
		fetchUserInfo();
	}, []);

	// Handle password update
	const handlePasswordChange = async (e) => {
		e.preventDefault();
		const user = auth.currentUser;

		if (!user) return;

		// Check if old password is provided
		if (!oldPassword || !newPassword) {
			setError("Please fill in all fields.");
			return;
		}

		try {
			// Create credential to reauthenticate with the old password
			const credential = EmailAuthProvider.credential(user.email, oldPassword);
			await reauthenticateWithCredential(user, credential);

			// Update password
			await updatePassword(user, newPassword);
			setSuccess("Password updated successfully!");
			setOldPassword("");
			setNewPassword("");
		} catch (err) {
			setError("Failed to update password. Please check your old password.");
			console.error("Error updating password:", err);
		}
	};

	return (
		<Container maxWidth='sm' sx={{ marginTop: "2rem" }}>
			<Box
				sx={{
					padding: "2rem",
					backgroundColor: "white",
					borderRadius: "8px",
					boxShadow: 3,
				}}
			>
				{/* Profile Details */}
				{userInfo ? (
					<>
						<Typography variant='h4' gutterBottom>
							{userInfo.firstName} {userInfo.lastName}
						</Typography>
						<Typography variant='body1' paragraph>
							Email: {userInfo.email}
						</Typography>
					</>
				) : (
					<Typography variant='body1'>Loading profile...</Typography>
				)}

				{/* Password Update Form */}
				<Typography variant='h6' sx={{ marginTop: "2rem" }}>
					Update Password
				</Typography>
				<form onSubmit={handlePasswordChange}>
					<TextField
						label='Old Password'
						type='password'
						fullWidth
						required
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						sx={{ marginBottom: "1rem" }}
					/>
					<TextField
						label='New Password'
						type='password'
						fullWidth
						required
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						sx={{ marginBottom: "1rem" }}
					/>
					<Button type='submit' variant='contained' color='primary' fullWidth>
						Update Password
					</Button>
				</form>

				{/* Error and Success Messages */}
				{error && (
					<Typography variant='body2' color='error' sx={{ marginTop: "1rem" }}>
						{error}
					</Typography>
				)}
				{success && (
					<Typography
						variant='body2'
						color='success'
						sx={{ marginTop: "1rem" }}
					>
						{success}
					</Typography>
				)}
			</Box>
		</Container>
	);
};

export default ProfileDetails;
