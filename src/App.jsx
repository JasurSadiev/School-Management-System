import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
	getFirestore,
	doc,
	getDoc,
	collection,
	addDoc,
	getDocs,
} from "firebase/firestore";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
// import Dashboard from "./pages/Dashboard"; // Example additional page
import PrivateRoute from "./components/PrivateRoute";
import AllStudents from "./pages/AllStudents";
import GeneralSchedule from "./pages/GeneralSchedule";
import WorkingHours from "./pages/WorkingHoursPage";
import SignUp from "./pages/SignUp";
import MyProfile from "./pages/MyProfile";
import StudentRegistrationForm from "./pages/StudentRegistration";
import AddStudentForm from "./pages/AddStudent";
import TeacherFinder from "./pages/TeacherFinder";
import { useAuth } from "./Context/AuthContext";
import ClientHome from "./pages/Client Pages/ClientHome";
import ClientProfile from "./pages/Client Pages/MyProfile";
import GenerateLessonsForm from "./components/GenerateLessonForm";

function App() {
	const navigate = useNavigate();
	const { user, loading, role } = useAuth(); // Assuming you have user and loading state in AuthContext
	const db = getFirestore();
	const [studentData, setStudentData] = useState(null);

	// Redirect user to /sign-in if they are not logged in
	useEffect(() => {
		if (loading) return; // Wait until loading is complete
		if (!user && window.location.pathname != "/sign-up") {
			navigate("/sign-in", { replace: true }); // Redirect to sign-in
		}
	}, [user, loading, navigate]);

	useEffect(() => {
		if (loading) return; // Wait until loading is complete
		if (user && window.location.pathname === "/sign-in") {
			navigate("/my-schedule", { replace: true }); // Redirect to home page if already logged in
		}
	}, [user, loading, navigate]);

	useEffect(() => {
		const fetchStudentData = async () => {
			if (user && role == "Student") {
				const uid = user.uid;
				try {
					const studentRef = doc(db, "students", uid);
					const studentSnap = await getDoc(studentRef);

					if (studentSnap.exists()) {
						console.log(studentSnap.data());
						setStudentData(studentSnap.data());
					} else {
						console.log("No student data found!");
					}
				} catch (error) {
					console.error("Error fetching student data:", error);
				}
			}
		};
		fetchStudentData();
	}, [user, db, role]); // Runs when auth state changes

	return (
		<Routes>
			{/* Public Routes */}
			{/* <Route path='/' element={<Home />} /> */}
			<Route path='/sign-in' element={<SignIn />} />
			<Route path='/sign-up' element={<SignUp />} />
			<Route path='/register-student' element={<StudentRegistrationForm />} />
			<Route path='/add-student' element={<AddStudentForm />} />
			<Route path='/find-teacher' element={<TeacherFinder />} />

			{/* Protected Routes */}
			<Route
				path='/my-students'
				element={
					<PrivateRoute
						allowedRoles={["Admin", "Teacher", "Manager", "Student"]}
					>
						<AllStudents />
					</PrivateRoute>
				}
			/>

			<Route
				path='/my-schedule'
				element={
					<PrivateRoute
						allowedRoles={["Admin", "Teacher", "Manager", "Parent"]}
					>
						<GeneralSchedule role={role} studentData={studentData} />
					</PrivateRoute>
				}
			/>

			<Route
				path='/my-profile'
				element={
					<PrivateRoute
						allowedRoles={["Student", "Admin", "Teacher", "Manager"]}
						roleBasedComponents={{
							Student: ClientProfile,
							Admin: MyProfile,
							Teacher: MyProfile,
							Manager: MyProfile,
						}}
					/>
				}
			/>

			<Route
				path='/'
				element={
					<PrivateRoute allowedRoles={["Admin", "Teacher", "Manager"]}>
						<Home />
					</PrivateRoute>
				}
			/>

			<Route
				path='/non-working-hours'
				element={
					<PrivateRoute allowedRoles={["Admin", "Teacher", "Manager"]}>
						<WorkingHours />
					</PrivateRoute>
				}
			/>

			<Route
				path='/my-students/:id'
				element={
					<PrivateRoute allowedRoles={["Admin", "Teacher", "Manager"]}>
						<GenerateLessonsForm />
					</PrivateRoute>
				}
			/>

			<Route
				path='/home'
				element={
					<PrivateRoute allowedRoles={["Parent"]}>
						<ClientHome user={user} studentData={studentData} />
					</PrivateRoute>
				}
			/>

			<Route
				path='/register-student'
				element={
					<PrivateRoute allowedRoles={["Admin", "Teacher", "Manager"]}>
						<StudentRegistrationForm />
					</PrivateRoute>
				}
			/>
		</Routes>
	);
}

export default App;
