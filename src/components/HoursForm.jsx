import React, { useState } from "react";
import { db, auth } from "../firebase.config"; // Ensure you're importing Firestore
import { setDoc, doc, arrayUnion } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

const WorkingHoursForm = ({ closeModal }) => {
	const [selectedDay, setSelectedDay] = useState("");
	const [startHour, setStartHour] = useState("");
	const [endHour, setEndHour] = useState("");
	const [error, setError] = useState("");

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Check if all fields are filled out
		if (!selectedDay || !startHour || !endHour) {
			setError("Please fill out all fields.");
			return;
		}

		// Ensure the end time is after the start time
		if (startHour >= endHour) {
			setError("End time must be after start time.");
			return;
		}

		try {
			// Get the current user's UID
			const userId = auth.currentUser.uid;

			// Generate a unique ID for the new time range
			const newId = uuidv4();

			// Create a reference to the 'nonWorkingHours' document for the user
			const WorkingHoursRef = doc(db, "WorkingHours", userId);

			// Add the non-working period to the specific day, with the new ID
			await setDoc(
				WorkingHoursRef,
				{
					[selectedDay]: arrayUnion({
						id: newId, // Add the generated unique ID
						startTime: startHour,
						endTime: endHour,
					}),
				},
				{ merge: true }
			);

			// Success message
			alert(
				`Working hours saved!\nDay: ${selectedDay}\nStart Time: ${startHour}\nEnd Time: ${endHour}`
			);

			// Clear form
			setSelectedDay("");
			setStartHour("");
			setEndHour("");
			setError("");

			// Close the modal after submission
			closeModal();
		} catch (err) {
			setError("An error occurred while saving the data.");
			console.error("Error saving non-working hours:", err);
		}
	};

	// Generate hourly time options
	const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
		value: `${i.toString().padStart(2, "0")}:00`,
		label: `${i.toString().padStart(2, "0")}:00`,
	}));

	// Add 23:55 as the last option
	hoursOptions.push({ value: "23:55", label: "23:55" });

	// Filter end time options based on start time
	const filteredEndHours = hoursOptions.filter(
		(hour) => hour.value > startHour
	);

	return (
		<div className='p-8 max-w-xl mx-auto bg-white rounded-lg'>
			<h1 className='text-2xl font-bold mb-6'>Set Working Hours</h1>
			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* Day Selector */}
				<div>
					<label
						htmlFor='day'
						className='block text-sm font-medium text-gray-700'
					>
						Day
					</label>
					<select
						id='day'
						value={selectedDay}
						onChange={(e) => setSelectedDay(e.target.value)}
						className='block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2'
					>
						<option value=''>Select a day</option>
						<option value='Monday'>Monday</option>
						<option value='Tuesday'>Tuesday</option>
						<option value='Wednesday'>Wednesday</option>
						<option value='Thursday'>Thursday</option>
						<option value='Friday'>Friday</option>
						<option value='Saturday'>Saturday</option>
						<option value='Sunday'>Sunday</option>
					</select>
				</div>

				{/* Start Time Selector */}
				<div>
					<label
						htmlFor='start-time'
						className='block text-sm font-medium text-gray-700'
					>
						Start Time
					</label>
					<select
						id='start-time'
						value={startHour}
						onChange={(e) => {
							setStartHour(e.target.value);
							setEndHour(""); // Reset end time when start time changes
						}}
						className='block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2'
					>
						<option value=''>Select start time</option>
						{hoursOptions.map((hour) => (
							<option key={hour.value} value={hour.value}>
								{hour.label}
							</option>
						))}
					</select>
				</div>

				{/* End Time Selector */}
				<div>
					<label
						htmlFor='end-time'
						className='block text-sm font-medium text-gray-700'
					>
						End Time
					</label>
					<select
						id='end-time'
						value={endHour}
						onChange={(e) => setEndHour(e.target.value)}
						className='block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2'
						disabled={!startHour} // Disable if start time isn't selected
					>
						<option value=''>Select end time</option>
						{filteredEndHours.map((hour) => (
							<option key={hour.value} value={hour.value}>
								{hour.label}
							</option>
						))}
					</select>
				</div>

				{/* Error Message */}
				{error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

				{/* Submit Button */}
				<button
					type='submit'
					className='w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default WorkingHoursForm;
