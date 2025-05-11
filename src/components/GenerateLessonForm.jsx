import React, { useState, useEffect } from "react";
import {
	doc,
	getDoc,
	updateDoc,
	arrayUnion,
	increment,
} from "firebase/firestore";
import { db } from "../firebase.config"; // Adjust as per your project
import { useParams } from "react-router-dom";

const GenerateLessonsForm = () => {
	const [numLessons, setNumLessons] = useState(1);
	const [balance, setBalance] = useState(0);
	const [weekdays, setWeekdays] = useState({});
	const [startDate, setStartDate] = useState("");
	const [classId, setClassId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const { id } = useParams();

	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	console.log(balance);

	useEffect(() => {
		const fetchClassId = async () => {
			if (!id) return;

			try {
				const studentRef = doc(db, "students", id);
				const studentSnap = await getDoc(studentRef);

				if (studentSnap.exists()) {
					setClassId(studentSnap.data().courses[0].classId);
					setBalance(studentSnap.data().balance);
				} else {
					setMessage("Error: Student not found.");
				}
			} catch (error) {
				setMessage("Error fetching class ID: " + error.message);
			}
		};

		fetchClassId();
	}, [id]);

	const handleWeekdayChange = (day, time) => {
		setWeekdays((prev) => ({
			...prev,
			[day]: time,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!id || !classId) {
			setMessage("Error: Missing student UID or class ID.");
			return;
		}
		if (!Object.keys(weekdays).length || !startDate) {
			setMessage(
				"Please select at least one day with time and choose a start date."
			);
			return;
		}

		setLoading(true);
		setMessage("");

		try {
			const classRef = doc(db, "classes", classId);
			const studentRef = doc(db, "students", id);
			const classSnap = await getDoc(classRef);

			if (!classSnap.exists()) {
				setMessage("Error: Class not found.");
				setLoading(false);
				return;
			}

			const startDateObj = new Date(startDate);
			const newLessons = [];
			let lessonCount = 0;

			const selectedDays = Object.entries(weekdays)
				.map(([day, hour]) => ({
					dayIndex: daysOfWeek.indexOf(day) + 1, // Get numeric index of the day
					hour,
					day,
				}))
				.sort((a, b) => a.dayIndex - b.dayIndex); // Sort by weekday order

			while (lessonCount < numLessons) {
				for (const { dayIndex, hour, day } of selectedDays) {
					if (lessonCount >= numLessons) break;

					let lessonDate = new Date(startDateObj);
					const currentDayIndex = lessonDate.getDay();
					let daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
					if (daysToAdd === 0 && lessonCount > 0) daysToAdd = 7;

					lessonDate.setDate(lessonDate.getDate() + daysToAdd);

					newLessons.push({
						studentId: id,
						date: lessonDate.toISOString().split("T")[0], // YYYY-MM-DD format
						day,
						hour,
						createdAt: new Date(),
					});

					lessonCount++;
				}

				startDateObj.setDate(startDateObj.getDate() + 7);
			}

			// ✅ Update Firestore with the new lessons
			await updateDoc(classRef, {
				schedule: arrayUnion(...newLessons),
			});

			// ✅ Use Firestore's `increment()` to safely update balance
			await updateDoc(studentRef, {
				balance: increment(numLessons),
			});

			setMessage("Lessons successfully added to the schedule!");
			setNumLessons(1);
			setWeekdays({});
			setStartDate("");
		} catch (error) {
			setMessage("Error updating schedule: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-4 border rounded-lg shadow-md max-w-md mx-auto my-auto'>
			<h2 className='text-xl font-bold mb-4'>Generate New Lessons</h2>
			{classId ? (
				<p className='text-sm text-gray-600'>Class ID: {classId}</p>
			) : (
				<p className='text-sm text-red-600'>Fetching class ID...</p>
			)}

			<form onSubmit={handleSubmit}>
				<label className='block mb-2'>
					Number of Lessons:
					<input
						type='number'
						value={numLessons}
						min='1'
						onChange={(e) => setNumLessons(Number(e.target.value))}
						className='border p-2 w-full rounded mt-1'
					/>
				</label>

				<label className='block mb-2'>
					Start Date:
					<input
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className='border p-2 w-full rounded mt-1'
					/>
				</label>

				<div className='mb-4'>
					<p>Select Weekdays & Time:</p>
					<div className='grid grid-cols-2 gap-2'>
						{daysOfWeek.map((day) => (
							<div key={day} className='flex flex-col'>
								<label className='flex items-center'>
									<input
										type='checkbox'
										checked={weekdays.hasOwnProperty(day)}
										onChange={() =>
											setWeekdays((prev) =>
												prev.hasOwnProperty(day)
													? Object.fromEntries(
															Object.entries(prev).filter(
																([key]) => key !== day
															)
													  )
													: { ...prev, [day]: "" }
											)
										}
										className='mr-2'
									/>
									{day}
								</label>
								{weekdays.hasOwnProperty(day) && (
									<input
										type='time'
										value={weekdays[day]}
										onChange={(e) => handleWeekdayChange(day, e.target.value)}
										className='border p-2 rounded mt-1'
									/>
								)}
							</div>
						))}
					</div>
				</div>

				<button
					type='submit'
					disabled={loading || !classId}
					className='bg-blue-500 text-white p-2 rounded w-full mt-3'
				>
					{loading ? "Saving..." : "Generate Lessons"}
				</button>
			</form>

			{message && <p className='mt-3 text-center text-green-600'>{message}</p>}
		</div>
	);
};

export default GenerateLessonsForm;
