import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
	collection,
	getDocs,
	query,
	where,
	doc,
	addDoc,
	updateDoc,
	arrayUnion,
	setDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";

// Utility: Get next N lesson datetimes from weekly schedule
function generateUpcomingLessons(weeklySchedule, count = 20) {
	const lessons = [];
	const weekdays = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const scheduleByDay = {};
	for (const slot of weeklySchedule) {
		scheduleByDay[slot.day] = slot.time;
	}

	let date = new Date();
	while (lessons.length < count) {
		const dayName = weekdays[date.getDay()];
		if (scheduleByDay[dayName]) {
			const [hours, minutes] = scheduleByDay[dayName].split(":").map(Number);
			const lessonDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				hours,
				minutes
			);
			lessons.push({
				dateTime: lessonDate.toISOString(),
			});
		}
		date.setDate(date.getDate() + 1);
	}
	return lessons;
}

export default function StudentRegistrationForm() {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			parentName: "",
			students: [
				{
					firstName: "",
					lastName: "",
					age: "",
					gender: "",
					courseName: "",
					lessons: [{ day: "", time: "" }],
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "students",
	});

	const [parents, setParents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		const fetchParents = async () => {
			const querySnapshot = await getDocs(collection(db, "parents"));
			setParents(
				querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		};
		fetchParents();
	}, []);

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const selectedParent = parents.find((p) => p.name === data.parentName);
			if (!selectedParent) {
				alert("Parent not found!");
				return;
			}

			const parentRef = doc(db, "parents", selectedParent.id);

			for (const student of data.students) {
				const studentRef = await addDoc(collection(db, "students"), {
					firstName: student.firstName,
					lastName: student.lastName,
					age: parseInt(student.age),
					gender: student.gender,
					parentId: selectedParent.id,
					lessons: student.lessons,
					course: student.courseName,
				});

				// Update parent's children list
				await updateDoc(parentRef, {
					children: arrayUnion(studentRef.id),
				});

				// Generate and save 20 upcoming lessons
				const lessons = generateUpcomingLessons(student.lessons, 20);

				console.log(lessons);

				for (const lesson of lessons) {
					await addDoc(collection(db, "classes"), {
						studentId: studentRef.id,
						dateTime: lesson.dateTime,
						status: "upcoming",
						isConducted: false,
						topic: "",
						homework: "",
						comments: "",
					});
				}
			}

			setSuccess(true);
			reset();
		} catch (err) {
			console.error("Error registering student:", err);
			alert("Error occurred. Check the console.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-6 bg-white shadow rounded'>
			<h2 className='text-xl font-bold mb-4'>Register Students</h2>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<select
					{...register("parentName", { required: true })}
					className='input'
				>
					<option value=''>Select Parent</option>
					{parents.map((p) => (
						<option key={p.id} value={p.name}>
							{p.name}
						</option>
					))}
				</select>

				{fields.map((field, index) => (
					<div key={field.id} className='bg-gray-100 p-4 rounded space-y-2'>
						<input
							{...register(`students.${index}.firstName`, { required: true })}
							placeholder='First Name'
							className='input'
						/>
						<input
							{...register(`students.${index}.lastName`, { required: true })}
							placeholder='Last Name'
							className='input'
						/>
						<input
							{...register(`students.${index}.age`, { required: true })}
							placeholder='Age'
							type='number'
							className='input'
						/>
						<select
							{...register(`students.${index}.gender`, { required: true })}
							className='input'
						>
							<option value=''>Select Gender</option>
							<option value='Female'>Female</option>
							<option value='Male'>Male</option>
						</select>
						<input
							{...register(`students.${index}.courseName`, { required: true })}
							placeholder='Course Name'
							className='input'
						/>

						<h4 className='mt-2 font-medium'>Weekly Schedule</h4>
						{[0, 1].map((j) => (
							<div key={j} className='flex gap-2'>
								<select
									{...register(`students.${index}.lessons.${j}.day`, {
										required: true,
									})}
									className='input w-1/2'
								>
									<option value=''>Day</option>
									{[
										"Sunday",
										"Monday",
										"Tuesday",
										"Wednesday",
										"Thursday",
										"Friday",
										"Saturday",
									].map((day) => (
										<option key={day} value={day}>
											{day}
										</option>
									))}
								</select>
								<input
									type='time'
									{...register(`students.${index}.lessons.${j}.time`, {
										required: true,
									})}
									className='input w-1/2'
								/>
							</div>
						))}

						{fields.length > 1 && (
							<button
								type='button'
								className='text-red-500'
								onClick={() => remove(index)}
							>
								Remove Student
							</button>
						)}
					</div>
				))}

				{/* <button
					type='button'
					onClick={() =>
						append({
							firstName: "",
							lastName: "",
							age: "",
							gender: "",
							lessons: [
								{ day: "", time: "" },
								{ day: "", time: "" },
							],
						})
					}
					className='bg-blue-100 px-4 py-2 rounded'
				>
					Add Another Student
				</button> */}

				<button
					type='submit'
					className='bg-green-600 text-white px-4 py-2 rounded'
					disabled={loading}
				>
					{loading ? "Registering..." : "Register"}
				</button>

				{success && <p className='text-green-600 mt-4'>Success!</p>}
			</form>
		</div>
	);
}
