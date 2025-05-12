import React from "react";
import Schedule from "./Schedule"; // Component for teacher's schedule
import StudentSchedule from "../pages/Client Pages/StudentSchedule"; // Component for student's schedule

const GeneralSchedule = ({ role, studentData }) => {
	return (
		<div>
			{role === "Teacher" && <Schedule />}
			{role === "Parent" && <StudentSchedule />}
			{!["Teacher", "Parent"].includes(role) && (
				<p>No schedule available for your role.</p>
			)}
		</div>
	);
};

export default GeneralSchedule;
