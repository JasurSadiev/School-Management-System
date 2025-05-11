import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { auth } from "../firebase.config"; // Assuming Firebase auth is set up

const ProfileDropdown = () => {
	const [anchorEl, setAnchorEl] = useState(null);

	// Open menu
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	// Close menu
	const handleClose = () => {
		setAnchorEl(null);
	};

	// Redirect to profile
	const handleProfileClick = () => {
		handleClose();
	};

	// Handle logout
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = () => {
		logout();
		navigate("/sign-in");
	};

	return (
		<div className='flex items-center'>
			{/* Profile Icon */}
			<IconButton onClick={handleClick}>
				<Avatar>
					<AccountCircleIcon />
				</Avatar>
			</IconButton>

			{/* Dropdown Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
			>
				<MenuItem onClick={handleProfileClick}>
					<Link to={"/my-profile"}>Profile</Link>
				</MenuItem>
				<MenuItem onClick={handleSignOut}>Logout</MenuItem>
			</Menu>
		</div>
	);
};

const Nav = () => {
	return (
		<div className='h-14 w-[100%] bg-white shadow-2xl flex flex-row-reverse'>
			<ProfileDropdown />
		</div>
	);
};

export default Nav;
