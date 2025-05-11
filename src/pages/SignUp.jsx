import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	FormControl,
	InputLabel,
	OutlinedInput,
	InputAdornment,
	IconButton,
	TextField,
	Select,
	MenuItem,
	Checkbox,
	ListItemText,
	Button,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { deepPurple } from "@mui/material/colors";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		gender: "",
		age: "",
		position: "",
		courses: [],
		teachingLanguages: [],
		email: "",
		password: "",
	});
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	// Function to generate a random unique ID (up to 6 digits)
	const generateUniqueId = () => {
		return Math.floor(Math.random() * 1000000);
	};

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleCoursesChange = (e) => {
		setFormData({ ...formData, courses: e.target.value });
	};

	const handleLanguagesChange = (e) => {
		setFormData({ ...formData, teachingLanguages: e.target.value });
	};

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			// Generate a unique ID for the user
			const userId = generateUniqueId();

			// Sign up user in Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);

			// Save user data to Firestore, including the generated ID
			await setDoc(doc(db, "users", userCredential.user.uid), {
				userId, // Add the unique ID
				firstName: formData.firstName,
				lastName: formData.lastName,
				gender: formData.gender,
				age: formData.age,
				position: formData.position,
				courses: formData.courses,
				teachingLanguages: formData.teachingLanguages,
				email: formData.email,
			});

			console.log("User signed up:", userCredential.user);
			alert("Account created successfully!");

			// Redirect to home or dashboard
			navigate("/sign-in");
		} catch (err) {
			setError(err.message);
			console.error("Error signing up:", err);
		}
	};

	const coursesOptions = [
		"Python",
		"Scratch",
		"Roblox Studio",
		"Frontend",
		"Blender",
	];

	const languagesOptions = ["English", "Russian", "English and Russian"];

	return (
		<div className='min-w-screen max-w-screen min-h-screen max-h-screen overflow-hidden flex'>
			<div className='min-w-[50%] max-w-[50%] bg-white'>
				<form
					onSubmit={handleSignUp}
					className='flex flex-col w-[60%] h-fit pb-10 mx-auto mt-[50%] translate-y-[-50%]'
				>
					<h1 className='text-center font-bold text-4xl mb-8 text-[#673ab7]'>
						SIGN UP
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
						id='first-name'
						label='First Name'
						variant='outlined'
						type='text'
						name='firstName'
						required
						value={formData.firstName}
						onChange={handleInputChange}
						sx={{ width: "100%", mb: "20px" }}
					/>
					<TextField
						id='last-name'
						label='Last Name'
						variant='outlined'
						type='text'
						name='lastName'
						required
						value={formData.lastName}
						onChange={handleInputChange}
						sx={{ width: "100%", mb: "20px" }}
					/>
					<FormControl component='fieldset' sx={{ mb: "20px" }}>
						<FormLabel component='legend'>Gender</FormLabel>
						<RadioGroup
							row
							name='gender'
							value={formData.gender}
							onChange={handleInputChange}
						>
							<FormControlLabel value='Male' control={<Radio />} label='Male' />
							<FormControlLabel
								value='Female'
								control={<Radio />}
								label='Female'
							/>
						</RadioGroup>
					</FormControl>
					<TextField
						id='age'
						label='Age'
						variant='outlined'
						type='number'
						name='age'
						required
						value={formData.age}
						onChange={handleInputChange}
						sx={{ width: "100%", mb: "20px" }}
					/>
					<FormControl sx={{ width: "100%", mb: "20px" }}>
						<InputLabel id='position-label'>Position</InputLabel>
						<Select
							labelId='position-label'
							id='position'
							name='position'
							value={formData.position}
							onChange={handleInputChange}
							required
						>
							<MenuItem value='Teacher'>Teacher</MenuItem>
							<MenuItem value='Manager'>Manager</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{ width: "100%", mb: "20px" }}>
						<InputLabel id='courses-label'>Courses</InputLabel>
						<Select
							labelId='courses-label'
							id='courses'
							multiple
							value={formData.courses}
							onChange={handleCoursesChange}
							renderValue={(selected) => selected.join(", ")}
						>
							{coursesOptions.map((course) => (
								<MenuItem key={course} value={course}>
									<Checkbox checked={formData.courses.includes(course)} />
									<ListItemText primary={course} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl sx={{ width: "100%", mb: "20px" }}>
						<InputLabel id='languages-label'>Teaching Languages</InputLabel>
						<Select
							labelId='languages-label'
							id='languages'
							multiple
							value={formData.teachingLanguages}
							onChange={handleLanguagesChange}
							renderValue={(selected) => selected.join(", ")}
						>
							{languagesOptions.map((language) => (
								<MenuItem key={language} value={language}>
									<Checkbox
										checked={formData.teachingLanguages.includes(language)}
									/>
									<ListItemText primary={language} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						id='email'
						label='Email Address'
						variant='outlined'
						type='email'
						name='email'
						required
						value={formData.email}
						onChange={handleInputChange}
						sx={{ width: "100%", mb: "20px" }}
					/>
					<FormControl sx={{ width: "100%" }} variant='outlined'>
						<InputLabel htmlFor='outlined-adornment-password'>
							Password
						</InputLabel>
						<OutlinedInput
							id='outlined-adornment-password'
							type={showPassword ? "text" : "password"}
							name='password'
							value={formData.password}
							onChange={handleInputChange}
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
						Sign Up
					</Button>
				</form>
			</div>
			<div className='min-w-[50%] max-w-[50%] bg-blue-500 min-h-full max-h-full login-right'></div>
		</div>
	);
};

export default SignUp;
