import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	FormControl,
	InputLabel,
	OutlinedInput,
	InputAdornment,
	IconButton,
	TextField,
	Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { deepPurple } from "@mui/material/colors";
import { auth, db } from "../firebase.config";
import { useAuth } from "../Context/AuthContext";
import {
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import GoogleIcon from "../assets/google.png";
import "../App.css";
import { col } from "framer-motion/client";

const SignIn = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const { login, user, role } = useAuth();

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const handleMouseUpPassword = (event) => {
		event.preventDefault();
	};

	// Fetch user data from Firestore
	const fetchUserData = async (uid) => {
		try {
			// Get the user's document from Firestore
			const userDoc = doc(db, "users", uid);
			const userSnap = await getDoc(userDoc);

			if (userSnap.exists()) {
				// User data exists in Firestore
				return userSnap.data();
			} else {
				console.log("No user data found in Firestore");
			}
		} catch (err) {
			console.error("Error fetching user data:", err);
		}
	};

	const handleEmailSignIn = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Sign in with email and password
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);

			const user = userCredential.user;

			// Fetch user data from Firestore using the user's uid
			const userData = await fetchUserData(user.uid);
			console.log(userData);
			if (userData) {
				// Store the user data in context (or local state)
				login({
					name: `${userData.firstName} ${userData.lastName}`,
					role: userData.position,
					age: userData.age,
					gender: userData.gender,
					courses: userData.courses,
					teachingLanguages: userData.teachingLanguages,
					userId: userData.userId,
				});
				console.log("User signed in:", user);

				if (userData.position === "Student") {
					navigate("/home"); // Redirect to the Student's home page
				} else {
					navigate("/"); // Redirect to the default page (Admin, Teacher, etc.)
				}
			} else {
				console.error("No user data found in Firestore");
			}
		} catch (err) {
			setError(err.message);
			console.error("Error signing in:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		const provider = new GoogleAuthProvider();
		try {
			// Sign in with Google
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Fetch user data from Firestore using the user's uid
			const userData = await fetchUserData(user.uid);

			if (userData) {
				// Store the user data in context (or local state)
				login({
					name: `${userData.firstname} ${userData.lastname}`,
					role: userData.position,
					age: userData.age,
					gender: userData.gender,
					courses: userData.courses,
					teachingLanguages: userData.teachingLanguages,
				});

				// Optionally update the user's displayName in Firebase Authentication
				await updateProfile(user, {
					displayName: `${userData.firstname} ${userData.lastname}`,
				});

				console.log("Google user signed in:", user);
				navigate("/"); // Redirect to dashboard or home page
			} else {
				console.error("No user data found in Firestore");
			}
		} catch (err) {
			setError(err.message);
			console.error("Error with Google sign-in:", err);
		}
	};

	return (
		<div className='min-w-screen max-w-screen min-h-screen max-h-screen overflow-hidden flex'>
			<div className='min-w-[50%] max-w-[50%] bg-white'>
				<form
					onSubmit={handleEmailSignIn}
					className='flex flex-col w-[50%] h-fit pb-10 mx-auto mt-[50%] translate-y-[-50%]'
				>
					<h1 className='text-center font-bold text-4xl mb-8 text-[#673ab7]'>
						SIGN IN
					</h1>
					{error && (
						<p
							className='text-red-700 mb-2 text-center font-medium'
							style={{ color: "red", marginBottom: "10px" }}
						>
							{error}
						</p>
					)}
					<TextField
						id='email'
						label='Email Address'
						variant='outlined'
						type='email'
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						sx={{ width: "100%", mb: "20px" }}
						className='EmailInput'
					/>
					<FormControl sx={{ width: "100%" }} variant='outlined'>
						<InputLabel htmlFor='outlined-adornment-password' required>
							Password
						</InputLabel>
						<OutlinedInput
							id='outlined-adornment-password'
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							endAdornment={
								<InputAdornment position='end'>
									<IconButton
										aria-label={
											showPassword
												? "hide the password"
												: "display the password"
										}
										onClick={handleClickShowPassword}
										onMouseDown={handleMouseDownPassword}
										onMouseUp={handleMouseUpPassword}
										edge='end'
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							}
							label='Password'
						/>
					</FormControl>
					<Button
						variant='contained'
						type='submit'
						sx={{
							mt: "50px",
							bgcolor: deepPurple[500],
							width: "70%",
							mx: "auto",
						}}
					>
						Sign In
					</Button>
					<span className='text-center my-5'>OR</span>
					<Button
						variant='outlined'
						onClick={handleGoogleSignIn}
						sx={{
							mt: "",
							width: "100%",
							px: 0,
							mx: "auto",
							color: deepPurple[500],
							border: "none",
							fontWeight: "semibold",
						}}
						startIcon={<img src={GoogleIcon} className='w-[36px]' />}
					>
						Sign In with Google
					</Button>
				</form>
			</div>
			<div className='min-w-[50%] max-w-[50%] bg-blue-500 min-h-full max-h-full login-right'></div>
		</div>
	);
};

export default SignIn;
