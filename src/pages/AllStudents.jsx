import React, { useState, useEffect } from "react";
import {
	Typography,
	Box,
	Card,
	CardContent,
	CardActions,
	Button,
	Modal,
	CircularProgress,
	Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.config"; // Adjust path to your Firebase config
import { getAuth } from "firebase/auth";
import Navbar from "../components/Navbar";
import Nav from "../components/ProfileDropdown";
import { Link } from "react-router-dom";

// Student Detail Modal Component
const StudentDetailModal = ({ open, onClose, student }) => {
	if (!student) return null;
	console.log(student);

	return (
		<Modal open={open} onClose={onClose} aria-labelledby='student-modal-title'>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "90%",
					maxWidth: 600,
					bgcolor: "background.paper",
					boxShadow: 24,
					p: 4,
					borderRadius: 2,
				}}
			>
				<Typography id='student-modal-title' variant='h5' gutterBottom>
					{student.firstName} {student.lastName}
				</Typography>
				<Typography variant='body1'>
					<strong>Email:</strong> {student.email}
				</Typography>
				<Typography variant='body1'>
					<strong>Phone:</strong> {student.phoneNumber}
				</Typography>
				<Typography variant='body1'>
					<strong>Parent's Name:</strong> {student.parentName}
				</Typography>
				<Typography variant='body1'>
					<strong>Age:</strong> {student.age}
				</Typography>
				<Typography variant='body1'>
					<strong>Timezone:</strong> {student.timezone}
				</Typography>
				<Typography variant='body1'>
					<strong>Notes:</strong> {student.notes || "N/A"}
				</Typography>
				<Typography variant='body1'>
					<strong>Balance:</strong> {student.balance || "N/A"}
				</Typography>
				<Box mt={3}>
					<Typography variant='h6'>Courses</Typography>
					{student.courses.map((course, index) => (
						<Box key={index} sx={{ mt: 2 }}>
							<Typography variant='body1'>
								<strong>Course:</strong> {course.courseName}
							</Typography>
							<Typography variant='body1'>
								<strong>Teacher:</strong> Jasurbek Sadiev
							</Typography>
							{/* <Typography variant='body1'>
								<strong>Schedule:</strong>
								<ul>
									{course.schedule.map((sched, i) => (
										<li key={i}>
											{sched.day} at {sched.time}
										</li>
									))}
								</ul>
							</Typography> */}
						</Box>
					))}
				</Box>
				<Button>
					<Link to={`/my-students/${student.id}`}>Add More Lesson</Link>
				</Button>
			</Box>
		</Modal>
	);
};

const AllStudents = () => {
	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	const auth = getAuth();
	const teacherId = auth.currentUser ? auth.currentUser.uid : null;
	console.log(students);
	useEffect(() => {
		const fetchStudents = async () => {
			if (!teacherId) return;

			setLoading(true);

			try {
				const studentsRef = collection(db, "students");
				const querySnapshot = await getDocs(studentsRef);

				const filteredStudents = [];
				querySnapshot.forEach((doc) => {
					const student = doc.data();
					// Check if any course has the teacher's ID

					student.courses.forEach((course) => {
						if (course.teacherId === teacherId) {
							filteredStudents.push({ id: doc.id, ...student });
						}
					});
				});

				setStudents(filteredStudents);
			} catch (error) {
				console.error("Error fetching students:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchStudents();
	}, [teacherId]);

	const handleOpenModal = (student) => {
		setSelectedStudent(student);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedStudent(null);
		setModalOpen(false);
	};

	return (
		<div>
			<Navbar selectedItem={0} />
			<Nav />
			<Box sx={{ p: 4, ml: "15%" }}>
				<Typography
					variant='h4'
					sx={{ mb: 4 }}
					component={motion.div}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					My Students
				</Typography>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
						<CircularProgress />
					</Box>
				) : students.length === 0 ? (
					<Typography>No students found.</Typography>
				) : (
					<Grid container spacing={3}>
						{students &&
							students.map((student) => (
								<Grid item xs={12} sm={6} md={4} key={student.id}>
									<Card
										component={motion.div}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										sx={{ boxShadow: 4, borderRadius: 2 }}
									>
										<CardContent>
											<Typography variant='h6'>
												{student.firstName} {student.lastName}
											</Typography>
											<Typography variant='body2'>
												Email: {student.email}
											</Typography>
											<Typography variant='body2'>
												Phone: {student.phoneNumber}
											</Typography>
										</CardContent>
										<CardActions>
											<Button
												size='small'
												onClick={() => handleOpenModal(student)}
											>
												View Details
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))}
					</Grid>
				)}

				{/* Modal for student details */}
				<StudentDetailModal
					open={modalOpen}
					onClose={handleCloseModal}
					student={selectedStudent}
				/>
			</Box>
		</div>
	);
};

export default AllStudents;
