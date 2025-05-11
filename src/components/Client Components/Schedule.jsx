import React, { useState } from "react";
import { Box, Typography, Card, CardContent, IconButton } from "@mui/material";
import { ArrowLeft, ArrowRight, PlayArrow } from "@mui/icons-material";
import { motion } from "framer-motion";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import { span } from "framer-motion/client";

const ScheduleComponent = ({ lessons, studentData }) => {
	const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
	const [selectedLesson, setSelectedLesson] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const [topic, setTopic] = useState("");
	const [homework, setHomework] = useState("");
	const [balance, setBalance] = useState(0);

	// Helper function to get the start of the week (Monday)
	const getStartOfWeek = (date) => {
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
		return new Date(date.setDate(diff));
	};

	// Helper function to get all days of the current week
	const getWeekDays = (startOfWeek) => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startOfWeek);
			day.setDate(startOfWeek.getDate() + i);
			days.push(day);
		}
		return days;
	};

	// Filter lessons for the current week
	const getLessonsForWeek = (weekDays) => {
		return lessons.filter((lesson) => {
			const lessonDate = new Date(lesson.date);
			return weekDays.some(
				(day) =>
					lessonDate.getFullYear() === day.getFullYear() &&
					lessonDate.getMonth() === day.getMonth() &&
					lessonDate.getDate() === day.getDate()
			);
		});
	};

	// Handle navigation to the previous week
	const handlePreviousWeek = () => {
		const newWeekStart = new Date(currentWeekStart);
		newWeekStart.setDate(newWeekStart.getDate() - 7);
		setCurrentWeekStart(newWeekStart);
	};

	// Handle navigation to the next week
	const handleNextWeek = () => {
		const newWeekStart = new Date(currentWeekStart);
		newWeekStart.setDate(newWeekStart.getDate() + 7);
		setCurrentWeekStart(newWeekStart);
	};

	// Handle opening the modal
	const handleOpenModal = (lesson) => {
		setSelectedLesson(lesson);
		setTopic(lesson.topic || "");
		setHomework(lesson.homework || "");
		setBalance(lesson.balance || 0);
		setOpenModal(true);
	};

	// Handle saving the lesson details

	// Get the current week's days and lessons
	const weekDays = getWeekDays(getStartOfWeek(currentWeekStart));
	const weekLessons = getLessonsForWeek(weekDays);
	console.log(weekLessons);
	return (
		<Box sx={{ p: 3, mx: "auto" }}>
			{/* Week Navigation */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<IconButton onClick={handlePreviousWeek}>
					<ArrowLeft />
				</IconButton>
				<Typography variant='h6'>
					{weekDays[0].toLocaleDateString()} -{" "}
					{weekDays[6].toLocaleDateString()}
				</Typography>
				<IconButton onClick={handleNextWeek}>
					<ArrowRight />
				</IconButton>
			</Box>

			{/* Weekly ScheduleComponent */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(7, 1fr)",
					gap: 2,
				}}
			>
				{weekDays.map((day, index) => {
					const dayLessons = weekLessons.filter((lesson) => {
						const lessonDate = new Date(lesson.date);
						return (
							lessonDate.getFullYear() === day.getFullYear() &&
							lessonDate.getMonth() === day.getMonth() &&
							lessonDate.getDate() === day.getDate()
						);
					});

					console.log(studentData);

					return (
						<Box key={index}>
							<Typography variant='subtitle1' align='center'>
								{day.toLocaleDateString("en-US", { weekday: "long" })}
							</Typography>
							<Typography variant='body2' align='center'>
								{day.toLocaleDateString()}
							</Typography>
							<Box sx={{ mt: 1 }}>
								{dayLessons.map((lesson, lessonIndex) => {
									const lessonEndTime = new Date(lesson.date);
									lessonEndTime.setMinutes(lessonEndTime.getMinutes() + 55); // Assuming each lesson is 55 minutes long

									const isLessonEnded = new Date() > lessonEndTime;

									console.log(isLessonEnded);

									return (
										<motion.div
											key={lessonIndex}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: lessonIndex * 0.1 }}
										>
											<Card
												sx={{
													mb: 1,
													mt: "20px",
													borderLeft: `${
														lesson.isConducted
															? "5px solid #07ba49"
															: "5px solid #078bde"
													}`,
												}}
											>
												<CardContent>
													<Typography variant='body2'>
														{new Date(lesson.date).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</Typography>
													<Typography variant='caption'>
														{`${studentData.firstName} - ${studentData.courses[0].courseName}`}
													</Typography>
													<br />
													<Typography variant='caption'>
														Status: {lesson.status}
													</Typography>
													{isLessonEnded && (
														<IconButton
															onClick={() => handleOpenModal(lesson)}
															sx={{ float: "right" }}
														>
															{lesson.isConducted && <InfoIcon />}
														</IconButton>
													)}
													{openModal && (
														<HomeworkModal
															open={openModal}
															onClose={() => setOpenModal(false)}
															lesson={selectedLesson}
														/>
													)}
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</Box>
						</Box>
					);
				})}
			</Box>

			{/* Modal for Conducting Lesson */}
		</Box>
	);
};

import { Modal, TextField, Button } from "@mui/material";
const HomeworkModal = ({ open, onClose, lesson }) => {
	console.log(lesson);
	return (
		<Modal open={open} onClose={onClose}>
			<Box
				sx={{
					p: 4,
					backgroundColor: "white",
					borderRadius: 2,
					width: "50%",
					mx: "auto",
					mt: "15%",
					display: "flex",
					flexDirection: "column",
					gap: "50px",
				}}
			>
				<Typography variant='h6'>Lesson Details</Typography>
				<TextField
					label='Topic'
					defaultValue={lesson?.topic}
					fullWidth
					InputProps={{ readOnly: true }}
				/>
				<TextField
					label='Homework'
					defaultValue={lesson?.homework}
					fullWidth
					InputProps={{ readOnly: true }}
				/>
				<Button onClick={onClose}>Close</Button>
			</Box>
		</Modal>
	);
};

export default ScheduleComponent;
