import React, { useState, useEffect } from "react";
import {
	Typography,
	Box,
	Grid,
	Card,
	CardContent,
	Button,
	Modal,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../../components/Client Components/Navbar";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore functions
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.config";
import Schedule from "../../components/Client Components/Schedule";
const DynamicCalendar = ({ studentData }) => {
	const [lessons, setLessons] = useState([]);
	const [classData, setClassData] = useState([]);

	useEffect(() => {
		const fetchUpcomingLesson = async () => {
			try {
				if (!studentData?.courses || studentData.courses.length === 0) return;

				let upcoming = null;

				for (const course of studentData.courses) {
					const classRef = doc(db, "classes", course.classId);
					const classSnap = await getDoc(classRef);

					if (classSnap.exists()) {
						const classData = classSnap.data();
						console.log(classData);
						setLessons(classData.schedule);
						setClassData(classData);
					}
				}
			} catch (error) {
				console.error("❌ Error fetching upcoming lesson:", error);
			}
		};

		fetchUpcomingLesson();
	}, [studentData]);

	return (
		<div>
			<Navbar />
			<Schedule lessons={lessons} studentData={studentData} />
		</div>
	);
};

export default DynamicCalendar;
