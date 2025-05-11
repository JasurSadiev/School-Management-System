import React, { useState } from "react";
import {
	TextField,
	Button,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	IconButton,
	Typography,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";
import {
	collection,
	addDoc,
	setDoc,
	getDoc,
	doc,
	updateDoc,
} from "firebase/firestore"; // Import Firestore functions
import { db, auth } from "../firebase.config"; // Adjust path to your Firebase config
import { v4 as uuidv4 } from "uuid"; // For generating unique ID
import { createUserWithEmailAndPassword } from "firebase/auth";
const StudentRegistrationForm = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		age: "",
		gender: "",
		parentName: "",
		timezone: "",
		courseName: "",
		teacherId: "",
		teacherName: "",
		schedule: [], // Array of { day: "Monday", time: "17:00" }
		email: "",
		phoneNumber: "",
		notes: "",
		balance: 0,
		startDate: "",
	});

	console.log(formData.startDate);

	const [newSchedule, setNewSchedule] = useState({ day: "", time: "" });
	const [teacherVerification, setTeacherVerification] = useState({
		loading: false,
		error: null,
		validTeacherName: "",
	});
	const [newCourse, setNewCourse] = useState({});

	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleNewScheduleChange = (e) => {
		const { name, value } = e.target;
		setNewSchedule((prev) => ({ ...prev, [name]: value }));
	};

	const addSchedule = () => {
		if (newSchedule.day && newSchedule.time) {
			setFormData((prev) => ({
				...prev,
				schedule: [...prev.schedule, newSchedule],
			}));
			setNewSchedule({ day: "", time: "" }); // Reset new schedule input
		}
	};

	const removeSchedule = (index) => {
		setFormData((prev) => ({
			...prev,
			schedule: prev.schedule.filter((_, i) => i !== index),
		}));
	};

	const verifyTeacher = async () => {
		if (!formData.teacherId) {
			setTeacherVerification({
				loading: false,
				error: "Please enter a valid teacher ID.",
				validTeacherName: "",
			});
			return;
		}

		setTeacherVerification({
			loading: true,
			error: null,
			validTeacherName: "",
		});

		try {
			const teacherDocRef = doc(db, "users", formData.teacherId); // Adjust Firestore collection name
			const teacherDoc = await getDoc(teacherDocRef);

			if (teacherDoc.exists()) {
				const teacherData = teacherDoc.data();
				setTeacherVerification({
					loading: false,
					error: null,
					validTeacherName: `${teacherData.firstName} ${teacherData.lastName}`,
				});
				setFormData((prev) => ({
					...prev,
					teacherName: `${teacherData.firstName} ${teacherData.lastName}`,
				}));
			} else {
				setTeacherVerification({
					loading: false,
					error: "Teacher ID not found.",
					validTeacherName: "",
				});
			}
		} catch (error) {
			console.error("Error verifying teacher:", error);
			setTeacherVerification({
				loading: false,
				error: "An error occurred while verifying the teacher ID.",
				validTeacherName: "",
			});
		}
	};

	// Helper function to generate a 6-digit ID
	const generateUniqueId = () => {
		return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
	};

	// Helper function to generate a random password
	const generatePassword = () => {
		return uuidv4().slice(0, 8); // Generate a simple 8-character password
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(formData.startDate);
		// Prepare student data
		const studentData = {
			firstName: formData.firstName,
			lastName: formData.lastName,
			age: formData.age,
			gender: formData.gender,
			parentName: formData.parentName,
			timezone: formData.timezone,
			email: formData.email,
			phoneNumber: formData.phoneNumber,
			notes: formData.notes,
			balance: formData.balance,
			startDate: formData.startDate,
			courses: [], // Will be populated with { courseName, classId }
		};

		// Generate a unique student ID and auto-generated password
		const studentId = generateUniqueId();
		const password = generatePassword();

		try {
			// Create a new user in Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				password
			);
			const user = userCredential.user;

			// Save student data to Firestore under the user.uid document ID
			await setDoc(doc(db, "students", user.uid), {
				...studentData,
				studentId, // Add the unique student ID
			});

			// Add the student to the 'users' collection with the required fields
			await setDoc(doc(db, "users", user.uid), {
				email: formData.email,
				password: password,
				uid: user.uid, // Use the user.uid as the document ID
				position: "Student",
				studentId: studentId, // Unique 6-digit student ID
			});

			// Create a new class for the course
			const classData = {
				courseName: formData.courseName,
				studentId: user.uid, // Use the user.uid as the student ID
				teacherId: formData.teacherId,
				schedule: generateLessons(
					formData.startDate,
					formData.schedule,
					formData.balance
				), // Generate lessons
				history: [], // Initialize history as empty
			};

			// Add the class to the 'classes' collection
			const classRef = await addDoc(collection(db, "classes"), classData);

			// Update the student's courses array with the new class ID
			await updateDoc(doc(db, "students", user.uid), {
				courses: [
					{
						courseName: formData.courseName,
						classId: classRef.id,
						teacherId: formData.teacherId,
					},
				],
			});

			// Success message and reset form
			alert("Student and class registered successfully!");

			// Reset the form data
			setFormData({
				firstName: "",
				lastName: "",
				age: "",
				gender: "",
				parentName: "",
				timezone: "",
				email: "",
				phoneNumber: "",
				notes: "",
				courseName: "",
				startDate: "",
				balance: 0,
				teacherId: "",
				teacherName: "",
				schedule: [], // Reset schedule
			});
		} catch (error) {
			console.error("Error registering student and class:", error);
			alert("There was an error registering the student and class.");
		}
	};

	const generateLessons = (startDate, schedule, balance) => {
		const lessons = [];
		const start = new Date(startDate);
		const totalLessons = balance >= 10 ? balance : 10; // Generate at least 10 lessons

		// Loop to generate lessons
		for (let i = 0; i < totalLessons; i++) {
			const scheduleIndex = i % schedule.length; // Cycle through schedule days
			const dayOfWeek = schedule[scheduleIndex].day; // Get the day of the week
			const time = schedule[scheduleIndex].time; // Get the corresponding time

			// Calculate the next lesson date based on the schedule
			const lessonDate = new Date(start);
			const daysToAdd = (i - (i % schedule.length)) / schedule.length; // Calculate the number of weeks to add

			// Find the next occurrence of the day of the week
			let dayDifference;
			switch (dayOfWeek) {
				case "Monday":
					dayDifference = (1 - lessonDate.getDay() + 7) % 7;
					break;
				case "Tuesday":
					dayDifference = (2 - lessonDate.getDay() + 7) % 7;
					break;
				case "Wednesday":
					dayDifference = (3 - lessonDate.getDay() + 7) % 7;
					break;
				case "Thursday":
					dayDifference = (4 - lessonDate.getDay() + 7) % 7;
					break;
				case "Friday":
					dayDifference = (5 - lessonDate.getDay() + 7) % 7;
					break;
				case "Saturday":
					dayDifference = (6 - lessonDate.getDay() + 7) % 7;
					break;
				case "Sunday":
					dayDifference = (0 - lessonDate.getDay() + 7) % 7;
					break;
				default:
					dayDifference = 0;
					break;
			}

			// Add the days to the start date and the weeks offset
			lessonDate.setDate(lessonDate.getDate() + dayDifference + daysToAdd * 7);

			// Set the lesson time
			const [hours, minutes] = time.split(":");
			lessonDate.setHours(hours, minutes, 0, 0);

			// Determine lesson status based on balance
			const status = i < balance ? "paid" : "unpaid";

			// Add lesson to the array
			lessons.push({
				date: lessonDate.toISOString(),
				status: status,
			});
		}

		return lessons;
	};

	return (
		<div className='min-h-screen flex justify-center items-center bg-gray-100'>
			<div className='bg-white p-8 shadow-lg rounded-lg max-w-3xl w-full'>
				<h1 className='text-2xl font-bold text-center mb-6'>
					Register New Student
				</h1>
				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* First and Last Name */}
					<div className='flex gap-4'>
						<TextField
							label='First Name'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							fullWidth
							required
						/>
						<TextField
							label='Last Name'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							fullWidth
							required
						/>
					</div>

					{/* Age and Gender */}
					<div className='flex gap-4'>
						<TextField
							label='Age'
							name='age'
							type='number'
							value={formData.age}
							onChange={handleChange}
							fullWidth
							required
						/>
						<FormControl fullWidth>
							<InputLabel id='gender-label'>Gender</InputLabel>
							<Select
								labelId='gender-label'
								name='gender'
								value={formData.gender}
								onChange={handleChange}
								required
							>
								<MenuItem value='Male'>Male</MenuItem>
								<MenuItem value='Female'>Female</MenuItem>
								<MenuItem value='Other'>Other</MenuItem>
							</Select>
						</FormControl>
					</div>

					{/* Parent's Name and Timezone */}
					<div className='flex gap-4'>
						<TextField
							label="Parent's Name"
							name='parentName'
							value={formData.parentName}
							onChange={handleChange}
							fullWidth
							required
						/>
						<TextField
							label='Timezone'
							name='timezone'
							value={formData.timezone}
							onChange={handleChange}
							fullWidth
							required
						/>
					</div>

					{/* Email and Phone Number */}
					<div className='flex gap-4'>
						<TextField
							label='Email'
							name='email'
							type='email'
							value={formData.email}
							onChange={handleChange}
							fullWidth
							required
						/>
						<TextField
							label='Phone Number'
							name='phoneNumber'
							type='tel'
							value={formData.phoneNumber}
							onChange={handleChange}
							fullWidth
						/>
					</div>
					<TextField
						label='Balance (Paid Lessons)'
						name='balance'
						type='number'
						value={formData.balance}
						onChange={handleChange}
						fullWidth
						required
						inputProps={{ min: 0 }} // Ensure balance cannot be negative
					/>

					<TextField
						label='Start Date'
						name='startDate'
						type='date'
						value={formData.startDate}
						onChange={handleChange}
						fullWidth
						required
					/>

					{/* Notes */}
					<TextField
						label='Notes'
						name='notes'
						value={formData.notes}
						onChange={handleChange}
						fullWidth
						multiline
						rows={4}
					/>

					{/* Teacher ID and Verification */}
					<div className='flex gap-4'>
						<TextField
							label='Teacher ID'
							name='teacherId'
							value={formData.teacherId}
							onChange={handleChange}
							fullWidth
						/>
						<Button
							onClick={verifyTeacher}
							variant='contained'
							color='primary'
							disabled={teacherVerification.loading}
						>
							{teacherVerification.loading ? "Verifying..." : "Verify Teacher"}
						</Button>
					</div>
					{teacherVerification.error && (
						<Typography color='error'>{teacherVerification.error}</Typography>
					)}
					{teacherVerification.validTeacherName && (
						<Typography color='primary'>
							Teacher Verified: {teacherVerification.validTeacherName}
						</Typography>
					)}

					{/* Course Name */}
					<TextField
						label='Course Name'
						name='courseName'
						value={formData.courseName}
						onChange={handleChange}
						fullWidth
						required
					/>

					{/* Schedule */}
					<div className='space-y-2'>
						<div className='flex gap-4'>
							<FormControl fullWidth>
								<InputLabel id='day-label'>Day</InputLabel>
								<Select
									labelId='day-label'
									name='day'
									value={newSchedule.day}
									onChange={handleNewScheduleChange}
								>
									{daysOfWeek.map((day) => (
										<MenuItem key={day} value={day}>
											{day}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								label='Time'
								name='time'
								type='time'
								value={newSchedule.time}
								onChange={handleNewScheduleChange}
							/>
							<IconButton onClick={addSchedule} color='primary'>
								<AddCircle />
							</IconButton>
						</div>

						{/* Schedule List */}
						<div>
							{formData.schedule.map((schedule, index) => (
								<div
									key={index}
									className='flex justify-between items-center bg-gray-100 p-2 my-1 rounded'
								>
									<Typography>
										{schedule.day} at {schedule.time}
									</Typography>
									<IconButton
										onClick={() => removeSchedule(index)}
										color='error'
									>
										<Delete />
									</IconButton>
								</div>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type='submit'
						variant='contained'
						color='primary'
						fullWidth
						disabled={teacherVerification.loading}
					>
						Register Student
					</Button>
				</form>
			</div>
		</div>
	);
};

export default StudentRegistrationForm;
