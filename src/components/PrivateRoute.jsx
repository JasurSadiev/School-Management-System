import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const PrivateRoute = ({ children, allowedRoles, roleBasedComponents }) => {
	const { user, loading, role } = useAuth();
	const location = useLocation();

	// Show a loading spinner while auth state is being determined
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh", // Full viewport height
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	// Redirect to sign-in if not authenticated
	if (!user) {
		return <Navigate to='/sign-in' state={{ from: location }} />;
	}

	// Redirect if the user's role is not allowed
	if (allowedRoles && !allowedRoles.includes(role)) {
		return <Navigate to='/sign-in' />;
	}

	// If a role-based mapping is provided, render the component for the user's role
	if (roleBasedComponents) {
		const Component = roleBasedComponents[role];
		if (Component) {
			return <Component />;
		}
		// Optionally, you can return a fallback component or redirect if the role isn't mapped.
		return <Navigate to='/sign-in' />;
	}

	// Otherwise, render the children
	return children;
};

export default PrivateRoute;
