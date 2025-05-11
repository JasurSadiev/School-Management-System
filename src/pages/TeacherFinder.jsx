import React, { useState, useEffect } from "react";
import {
	TextField,
	FormControl,
	Button,
	MenuItem,
	Select,
	InputLabel,
	CircularProgress,
	List,
	Card,
	CardContent,
	Typography,
	IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";

const TeacherFinder = () => {
	const [criteria, setCriteria] = useState([]);
	const [currentCriteria, setCurrentCriteria] = useState({
		day: "",
		startHour: "",
	});
	const [courseName, setCourseName] = useState(""); // Course Name
	const [teachers, setTeachers] = useState([]);
	const [workingHours, setWorkingHours] = useState({});
	const [filteredTeachers, setFilteredTeachers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
		value: `${i.toString().padStart(2, "0")}:00`,
		label: `${i.toString().padStart(2, "0")}:00`,
	}));

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch teachers
				const teacherCollection = collection(db, "users"); // Adjust your collection name
				const teacherSnapshot = await getDocs(teacherCollection);
				const teacherList = teacherSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setTeachers(teacherList);

				// Fetch working hours
				const workingHoursCollection = collection(db, "WorkingHours");
				const workingHoursSnapshot = await getDocs(workingHoursCollection);
				const workingHoursData = {};
				workingHoursSnapshot.docs.forEach((doc) => {
					workingHoursData[doc.id] = doc.data();
				});

				setWorkingHours(workingHoursData);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleAddCriteria = () => {
		if (!currentCriteria.day || !currentCriteria.startHour) {
			setError("Please select both a day and a start time.");
			return;
		}

		// Prevent duplicate slots
		if (
			criteria.some(
				(slot) =>
					slot.day === currentCriteria.day &&
					slot.startHour === currentCriteria.startHour
			)
		) {
			setError("This slot has already been added.");
			return;
		}

		setCriteria((prev) => [...prev, currentCriteria]);
		setCurrentCriteria({ day: "", startHour: "" });
		setError("");
	};

	const handleDeleteSlot = (index) => {
		setCriteria((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSearch = () => {
		if (!courseName) {
			setError("Please specify the course name.");
			return;
		}

		if (criteria.length === 0) {
			setError("Please add at least one day and time.");
			return;
		}

		// Filter teachers based on criteria
		const results = teachers.filter((teacher) => {
			const teachesCourse = teacher.courses?.includes(courseName);

			const teachesAllSlots =
				teachesCourse &&
				criteria.every(({ day, startHour }) => {
					const availability = workingHours[teacher.id]?.[day];
					return (
						availability &&
						availability.some(
							(slot) =>
								slot.startTime <= startHour &&
								slot.endTime >= calculateEndHour(startHour)
						)
					);
				});

			return teachesAllSlots;
		});

		setFilteredTeachers(results);
	};

	const calculateEndHour = (startHour) => {
		const [hours, minutes] = startHour.split(":").map(Number);
		const endHours = (hours + 1) % 24;
		return `${endHours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;
	};

	return (
		<div className='min-h-screen flex justify-center items-center bg-gray-100'>
			<div className='bg-white p-8 shadow-lg rounded-lg max-w-3xl w-full'>
				<h1 className='text-2xl font-bold text-center mb-6'>Find a Teacher</h1>

				{loading ? (
					<div className='flex justify-center items-center h-32'>
						<CircularProgress />
					</div>
				) : (
					<>
						<div className='space-y-4'>
							{/* Course Name */}
							<TextField
								label='Course Name'
								value={courseName}
								onChange={(e) => setCourseName(e.target.value)}
								fullWidth
								required
							/>

							{/* Day Selector */}
							<FormControl fullWidth>
								<InputLabel id='day-label'>Day of the Week</InputLabel>
								<Select
									labelId='day-label'
									name='day'
									value={currentCriteria.day}
									onChange={(e) =>
										setCurrentCriteria((prev) => ({
											...prev,
											day: e.target.value,
										}))
									}
								>
									{daysOfWeek.map((day) => (
										<MenuItem key={day} value={day}>
											{day}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							{/* Start Time */}
							<FormControl fullWidth>
								<InputLabel id='start-time-label'>Start Time</InputLabel>
								<Select
									labelId='start-time-label'
									name='startHour'
									value={currentCriteria.startHour}
									onChange={(e) =>
										setCurrentCriteria((prev) => ({
											...prev,
											startHour: e.target.value,
										}))
									}
								>
									{hoursOptions.map((hour) => (
										<MenuItem key={hour.value} value={hour.value}>
											{hour.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<Button variant='outlined' onClick={handleAddCriteria}>
								Add Slot
							</Button>

							{/* Display Added Slots */}
							<div className='mt-4'>
								{criteria.map(({ day, startHour }, index) => (
									<div
										key={index}
										className='flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg'
									>
										<Typography>
											{day} at {startHour}
										</Typography>
										<IconButton
											color='secondary'
											onClick={() => handleDeleteSlot(index)}
										>
											<DeleteIcon />
										</IconButton>
									</div>
								))}
							</div>

							{/* Error Message */}
							{error && <p className='text-red-500 text-sm'>{error}</p>}

							{/* Search Button */}
							<Button
								variant='contained'
								color='primary'
								fullWidth
								onClick={handleSearch}
							>
								Search Teachers
							</Button>
						</div>

						{/* Results */}
						<div className='mt-6'>
							{filteredTeachers.length > 0 ? (
								<List>
									{filteredTeachers.map((teacher) => (
										<Card key={teacher.id} className='mb-4'>
											<CardContent>
												<Typography variant='h6' className='font-bold'>
													{teacher.firstName} {teacher.lastName}
												</Typography>
												<Typography variant='body1'>
													Courses: {teacher.courses?.join(", ")}
												</Typography>
												<Typography variant='body2' color='textSecondary'>
													Email: {teacher.email}
												</Typography>
												<Typography variant='body2' color='textSecondary'>
													User ID: {teacher.id}
												</Typography>
											</CardContent>
										</Card>
									))}
								</List>
							) : (
								<Typography
									variant='body1'
									className='text-gray-500 text-center mt-4'
								>
									No teachers found matching the criteria.
								</Typography>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default TeacherFinder;
