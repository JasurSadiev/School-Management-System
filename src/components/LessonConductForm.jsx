import React, { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
	doc,
	getDoc,
	updateDoc,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { TextField, Button, Box, Typography, Modal } from "@mui/material";

const LessonConductForm = ({
	homework,
	balance,
	topic,
	openModal,
	setOpenModal,
	selectedLesson,
	setHomework,
	setTopic,
	setBalance,
}) => {
	// Fetch balance from Firebase when the modal opens
	useEffect(() => {
		if (selectedLesson?.studentId && openModal) {
			getStudentBalance(selectedLesson.studentId);
		}
	}, [selectedLesson, openModal]);

	// Function to get the student's balance from Firestore
	const getStudentBalance = async (studentId) => {
		try {
			const studentRef = doc(db, "students", studentId);
			const studentSnap = await getDoc(studentRef);

			if (studentSnap.exists()) {
				const studentData = studentSnap.data();
				setBalance(studentData.balance || 0);
			} else {
				console.log("No such student!");
			}
		} catch (error) {
			console.error("Error fetching student balance:", error);
		}
	};

	// Function to save lesson and update balance
	const handleSaveLesson = async () => {
		try {
			// Decrease the balance by 1
			const newBalance = balance - 1;

			// Update the student's balance in Firestore
			const studentRef = doc(db, "students", selectedLesson.studentId);
			await updateDoc(studentRef, { balance: newBalance });

			// Find the class by studentId and courseName
			const classesQuery = query(
				collection(db, "classes"),
				where("studentId", "==", selectedLesson.studentId),
				where("courseName", "==", selectedLesson.courseName)
			);

			const classesSnapshot = await getDocs(classesQuery);
			if (!classesSnapshot.empty) {
				classesSnapshot.forEach(async (classDoc) => {
					const classData = classDoc.data();
					const schedules = classData.schedule || [];

					// Find the current lesson by matching the date
					const updatedSchedules = schedules.map((lesson) => {
						if (lesson.date === selectedLesson.fullDate) {
							return {
								...lesson,
								isConducted: true,
								topic,
								homework,
								courseName: selectedLesson.courseName,
							};
						}
						return lesson;
					});

					// Update the class document with the updated schedules
					await updateDoc(doc(db, "classes", classDoc.id), {
						schedule: updatedSchedules,
					});
				});
			} else {
				console.log("No class found for this student and course!");
			}

			// Log the updated lesson info (optional)
			const updatedLesson = {
				...selectedLesson,
				topic,
				homework,
				balance: newBalance,
			};
			console.log("Updated Lesson:", updatedLesson);

			// Close the modal
			handleCloseModal();
		} catch (error) {
			console.error("Error updating lesson or balance:", error);
		}
	};

	// Handle closing the modal
	const handleCloseModal = () => {
		setOpenModal(false);
	};

	return (
		<Modal open={openModal} onClose={handleCloseModal}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 400,
					bgcolor: "background.paper",
					boxShadow: 24,
					p: 4,
				}}
			>
				<Typography variant='h6' gutterBottom>
					Conduct Lesson
				</Typography>
				<TextField
					label='Topic'
					fullWidth
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
					sx={{ mb: 2 }}
				/>
				<TextField
					label='Homework'
					fullWidth
					value={homework}
					onChange={(e) => setHomework(e.target.value)}
					sx={{ mb: 2 }}
				/>
				<Typography variant='body2' sx={{ mb: 2 }}>
					Balance: {balance}
				</Typography>
				<Button variant='contained' onClick={handleSaveLesson}>
					Save
				</Button>
			</Box>
		</Modal>
	);
};

export default LessonConductForm;
