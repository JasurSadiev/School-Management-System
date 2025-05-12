import React, { useState, useEffect } from "react";
import Navbar from "../../components/Client Components/Navbar";
import Schedule from "../../components/Client Components/Schedule";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../Context/AuthContext";

const DynamicCalendar = () => {
	const [lessons, setLessons] = useState([]);
	const [students, setStudents] = useState([]);
	const { user } = useAuth();

	console.log(lessons);
	console.log(students);

	const parentId = user.uid;
	useEffect(() => {
		const fetchAllLessons = async () => {
			try {
				// Step 1: Get all students for the parent
				const studentsQuery = query(
					collection(db, "students"),
					where("parentId", "==", parentId)
				);
				const studentsSnap = await getDocs(studentsQuery);
				const studentList = [];
				const lessonList = [];

				for (const studentDoc of studentsSnap.docs) {
					const studentData = { id: studentDoc.id, ...studentDoc.data() };
					studentList.push(studentData);

					// Step 2: Get all lessons for this student
					const lessonsQuery = query(
						collection(db, "classes"),
						where("studentId", "==", studentData.id)
					);
					const lessonsSnap = await getDocs(lessonsQuery);

					lessonsSnap.forEach((lessonDoc) => {
						lessonList.push({
							id: lessonDoc.id,
							...lessonDoc.data(),
							studentName: studentData.name, // optional, to show which kid
						});
					});
				}

				// Optional: Sort by date
				lessonList.sort((a, b) => {
					const dateA = a.dateTime?.toDate
						? a.dateTime.toDate()
						: new Date(a.dateTime);
					const dateB = b.dateTime?.toDate
						? b.dateTime.toDate()
						: new Date(b.dateTime);
					return dateA - dateB;
				});

				setLessons(lessonList);
				setStudents(studentList);
			} catch (error) {
				console.error("❌ Error fetching parent lessons:", error);
			}
		};

		fetchAllLessons();
	}, [parentId]);

	return (
		<div>
			<Navbar />
			<Schedule lessons={lessons} studentData={students} />
		</div>
	);
};

export default DynamicCalendar;
