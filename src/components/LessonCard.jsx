import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	Typography,
	IconButton,
	Modal,
	Box,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LessonConductForm from "./LessonConductForm"; // Assuming the lesson conducting form is in a separate component
import { getLessonStatus } from "./api"; // Mock API function to check if the lesson is conducted

const LessonCard = ({ fullDate, lesson, index, teacherId }) => {
	const [openModal, setOpenModal] = useState(false);
	const [isConducted, setIsConducted] = useState(false); // State to track if the lesson has been conducted

	// Helper function to format the date
	const formatDate = (date) => {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${month}/${day}/${year}`;
	};

	// Helper function to construct lessonId
	const constructLessonId = (studentName, fullDate, time) => {
		// Format the lesson date to YYYY-MM-DD
		// const formattedDate = lessonDate.toISOString().split("T")[0];
		// Include the time (e.g., 10:00)
		return `${studentName}_${fullDate}_${time}`;
	};

	const handleIconClick = () => {
		if (!isConducted) {
			setOpenModal(true);
		}
	};

	// Parse time and create a full date

	const handleModalClose = () => {
		setOpenModal(false);
	};

	// Callback to change the icon after successful submission
	const handleFormSubmitSuccess = () => {
		setIsConducted(true); // Mark the lesson as conducted
		setOpenModal(false); // Close the modal
	};

	// Generate full date and lessonId
	// Generate the full date object
	const lessonDate = `${fullDate}_${lesson.time}`;
	// Construct the lessonId using the corrected date and time
	const currentLessonId = constructLessonId(
		lesson.studentName,
		fullDate,
		lesson.time
	);
	// console.log(currentLessonId);

	// Check the conductedLessons collection for the current lessonId
	useEffect(() => {
		const checkLessonConducted = async () => {
			const conducted = await getLessonStatus(currentLessonId); // Replace with actual API call
			setIsConducted(conducted);
			console.log(conducted);
		};

		checkLessonConducted();
	}, [currentLessonId]);

	return (
		<div>
			<Card
				key={index}
				className='shadow-md'
				component={motion.div}
				whileHover={{ scale: 1.05 }}
			>
				<CardContent>
					<Typography variant='subtitle1' className='font-bold'>
						{lesson.courseName}
					</Typography>
					<Typography variant='body2' className='text-gray-600'>
						{lesson.time}
					</Typography>
					<Typography variant='body2' className='text-gray-500'>
						Student: {lesson.studentName}
					</Typography>
					{/* Icon that opens the modal */}
					<IconButton onClick={handleIconClick} style={{ float: "right" }}>
						{isConducted ? <CheckCircleIcon color='success' /> : <EditIcon />}
					</IconButton>
				</CardContent>
			</Card>

			{/* Modal for the lesson conducting form */}
			<Modal
				open={openModal}
				onClose={handleModalClose}
				aria-labelledby='lesson-conduct-modal'
				aria-describedby='lesson-conduct-form'
			>
				<Box sx={modalStyle}>
					<LessonConductForm
						lessonId={currentLessonId} // Pass the dynamically constructed lessonId
						teacherId={teacherId}
						studentId={lesson.studentId}
						lessonDate={lessonDate}
						onClose={handleModalClose}
						onSubmitSuccess={handleFormSubmitSuccess} // Pass the success callback
					/>
				</Box>
			</Modal>
		</div>
	);
};

// Modal styling for the form
const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "400px",
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
};

export default LessonCard;
