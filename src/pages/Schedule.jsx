import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import {
	Typography,
	Button,
	Card,
	CardContent,
	Container,
	Grid,
	Box,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Nav from "../components/ProfileDropdown";
import { motion } from "framer-motion";
import LessonCard from "../components/LessonCard";
import ScheduleComponent from "../components/ScheduleComponent";

const Schedule = () => {
	const [schedule, setSchedule] = useState([]);
	const [currentDay, setCurrentDay] = useState("");
	const [teacherId, setTeacherId] = useState(null);
	const [students, setStudents] = useState({}); // To store student data by their UID

	const daysOfWeek = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	useEffect(() => {
		const auth = getAuth();
		const user = auth.currentUser;

		if (user) {
			setTeacherId(user.uid);
		} else {
			console.error("User not logged in");
		}
	}, []);

	useEffect(() => {
		const fetchSchedule = async () => {
			if (!teacherId) return;

			const classesQuery = query(collection(db, "classes"));
			const querySnapshot = await getDocs(classesQuery);
			const fetchedData = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();

				// Assuming `data` contains a `schedule` array with lessons
				if (data.schedule && Array.isArray(data.schedule)) {
					data.schedule.forEach((lesson) => {
						// If you need to match dates, uncomment and use this logic
						// const matchedDate = weekDates.find((d) => d.dayName === lesson.day);

						fetchedData.push({
							courseName: data.courseName, // Assuming `courseName` is a field in `data`
							fullDate: lesson.date, // Assuming `date` is a field in `lesson`
							status: lesson.status, // Assuming `status` is a field in `lesson`
							studentId: data.studentId, // Assuming `studentId` is a field in `data`
							isConducted: lesson.isConducted ? lesson.isConducted : false,
						});
					});
				} else {
					console.error("Invalid or missing schedule data:", data);
				}
			});

			// Now fetch student information by UID
			const studentsData = {};
			for (const lesson of fetchedData) {
				if (!studentsData[lesson.studentId]) {
					const studentRef = doc(db, "students", lesson.studentId); // Using document ID directly
					const studentSnapshot = await getDoc(studentRef); // Fetch the document by ID

					if (studentSnapshot.exists()) {
						const studentData = studentSnapshot.data();
						studentsData[lesson.studentId] =
							studentData.firstName + " " + studentData.lastName;
					} else {
						console.log(`No student found with ID: ${lesson.studentId}`);
					}
				}
			}

			setStudents(studentsData); // Set the student information in state
			setSchedule(fetchedData);
		};
		const getToday = () => {
			const today = new Date();
			setCurrentDay(daysOfWeek[today.getDay()]);
		};

		fetchSchedule();
		getToday();
	}, [teacherId]);

	return (
		<div className='bg-gray-100 min-h-screen'>
			<Navbar selectedItem={1} />
			<Nav />
			<ScheduleComponent lessons={schedule} studentInfo={students} />
		</div>
	);
};

export default Schedule;
