import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import StudentNavbar from "../../components/Client Components/Navbar";
import {
	getFirestore,
	doc,
	getDoc,
	collection,
	addDoc,
	getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ClientHome = ({ user, studentData }) => {
	// const [studentData, setStudentData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [upcomingLesson, setUpcomingLesson] = useState(null);

	const db = getFirestore();

	console.log(studentData);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const querySnapshot = await getDocs(
					collection(db, "motivational_messages")
				);
				const messagesArray = querySnapshot.docs.map((doc) => doc.data().text);

				if (messagesArray.length > 0) {
					const randomMessage =
						messagesArray[Math.floor(Math.random() * messagesArray.length)];
					setMessage(randomMessage);
				}
			} catch (error) {
				console.error("❌ Error fetching messages:", error);
			}
		};

		fetchMessages();
	}, []);

	useEffect(() => {
		if (studentData) {
			setLoading(false);
		}
	}, [studentData]); // Runs when auth state changes

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
						if (classData.schedule && classData.schedule.length > 0) {
							const sortedSchedule = classData.schedule
								.filter((lesson) => new Date(lesson.date) > new Date()) // Filter future lessons
								.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
							console.log(sortedSchedule);
							if (sortedSchedule.length > 0) {
								upcoming = {
									date: sortedSchedule[0],
									course: classData.courseName,
								}; // First lesson in sorted list
								break; // Stop after finding the first upcoming lesson
							}
						}
					}
				}

				setUpcomingLesson(upcoming);
			} catch (error) {
				console.error("❌ Error fetching upcoming lesson:", error);
			}
		};

		fetchUpcomingLesson();
	}, [studentData]);

	if (loading) return <p>Loading...</p>;

	return (
		<div>
			<StudentNavbar />
			<div className='flex p-10 justify-between'>
				<h1 className=' text-2xl font-semibold'>
					Welcome back 🖐️ {studentData.firstName}!
				</h1>

				<p className='text-2xl'>Balance: {studentData.balance}</p>
			</div>
			<div className='flex justify-center mt-6'>
				<Card
					sx={{ maxWidth: 600, boxShadow: 3, borderLeft: "5px solid #1976d2" }}
				>
					<CardContent>
						<Typography
							variant='h6'
							component='blockquote'
							sx={{ fontStyle: "italic", textAlign: "center" }}
						>
							"{message || "Loading motivation..."}"
						</Typography>
					</CardContent>
				</Card>
			</div>
			{upcomingLesson && (
				<div className='flex mt-20 ml-10'>
					<Card
						sx={{
							maxWidth: 600,
							boxShadow: 3,
							borderLeft: "5px solid #28a745",
						}}
					>
						<CardContent>
							<Typography
								variant='h6'
								sx={{ fontWeight: "bold", textAlign: "center" }}
							>
								📅 Upcoming Lesson
							</Typography>
							<Typography variant='body1' sx={{ textAlign: "center", mt: 1 }}>
								{upcomingLesson.course || "No topic specified"}
							</Typography>
							<Typography
								variant='body2'
								sx={{ textAlign: "center", color: "gray" }}
							>
								{new Date(upcomingLesson.date.date).toLocaleString()}
							</Typography>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default ClientHome;
