import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const SessionManager = () => {
	const { logout, user } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		const oneDayInMs = 60 * 60 * 24 * 1000; // 1 minute for testing
		const sessionStartTime = localStorage.getItem("sessionStartTime");

		if (sessionStartTime) {
			const elapsedTime = Date.now() - parseInt(sessionStartTime, 10);
			if (elapsedTime > oneDayInMs) {
				// Session expired
				logout();
				localStorage.removeItem("sessionStartTime");
				console.log("Session expired");
				navigate("/sign-in");
			}
		} else {
			// Start a new session timer
			localStorage.setItem("sessionStartTime", Date.now().toString());
		}
	}, [logout]);

	return null; // Does not render anything
};

export default SessionManager;
