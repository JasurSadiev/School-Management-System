import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase.config"; // Make sure to import Firestore and auth
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { IconButton } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const WorkingHoursDisplay = () => {
	const [workingHours, setWorkingHours] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Fetch non-working hours when component mounts
	useEffect(() => {
		const fetchWorkingHours = async () => {
			try {
				// Get the current user's UID
				const userId = auth.currentUser.uid;

				// Reference to the user's document in the "nonWorkingHours" collection
				const WorkingHoursRef = doc(db, "WorkingHours", userId);

				// Fetch the document
				const docSnap = await getDoc(WorkingHoursRef);

				if (docSnap.exists()) {
					// If the document exists, set the nonWorkingHours state with the fetched data
					setWorkingHours(docSnap.data());
				} else {
					setError("No working hours found.");
				}
			} catch (err) {
				setError("An error occurred while fetching working hours.");
				console.error("Error fetching working hours:", err);
			} finally {
				setLoading(false);
			}
		};

		// Call the function to fetch non-working hours
		fetchWorkingHours();
	}, []);

	// Handle deleting a specific time range
	const handleDelete = async (day, rangeId) => {
		try {
			// Get the current user's UID
			const userId = auth.currentUser.uid;

			// Reference to the user's document in the "nonWorkingHours" collection
			const workingHoursRef = doc(db, "workingHours", userId);

			// Update the document by removing the specific time range
			await updateDoc(workingHoursRef, {
				[day]: arrayRemove({
					id: rangeId,
					startTime: workingHours[day].find((range) => range.id === rangeId)
						.startTime,
					endTime: workingHours[day].find((range) => range.id === rangeId)
						.endTime,
				}),
			});

			// After deletion, update the state to reflect the changes
			setWorkingHours((prevState) => ({
				...prevState,
				[day]: prevState[day].filter((range) => range.id !== rangeId),
			}));
		} catch (err) {
			setError("An error occurred while deleting the working hours.");
			console.error("Error deleting working hours:", err);
		}
	};

	// Render a loading message or the non-working hours
	if (loading) {
		return <div>Loading...</div>;
	}

	// Render error message if there is an error
	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	// Function to render time ranges for a specific day
	const renderTimeRanges = (day) => {
		if (!workingHours[day] || workingHours[day].length === 0) {
			return <span>No working hours for this day</span>;
		}

		// Map through the time ranges for the day and display them
		return workingHours[day].map((range) => (
			<div
				key={range.id}
				className='mb-2 flex justify-between items-center hover:border-red-200 hover:border-[1px] border-[1px] border-transparent'
			>
				<span>
					{range.startTime} - {range.endTime}
				</span>
				<IconButton
					aria-label='delete'
					onClick={() => handleDelete(day, range.id)}
					color='error'
				>
					<DeleteIcon />
				</IconButton>
			</div>
		));
	};

	return (
		<div className='p-8 mx-auto bg-white shadow-md rounded-lg w-1/2 my-auto'>
			<h1 className='text-2xl font-bold mb-6'>Your Working Hours</h1>

			{/* Display working hours for each day */}
			<div>
				{[
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday",
					"Sunday",
				].map((day) => (
					<div key={day} className='mb-4 '>
						<h2 className='text-xl font-semibold'>{day}</h2>
						{renderTimeRanges(day)}
					</div>
				))}
			</div>
		</div>
	);
};

export default WorkingHoursDisplay;
