import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../Context/AuthContext";

const StudentNavbar = () => {
	const linkStyle = {
		textDecoration: "none",
		color: "inherit",
	};

	const { logout } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = () => {
		logout();
		navigate("/sign-in");
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<AppBar position='static' sx={{ backgroundColor: "#1976D2" }}>
				<Toolbar>
					{/* Logo Section */}
					<motion.div
						whileHover={{ scale: 1.1 }}
						transition={{ duration: 0.3 }}
					>
						<Typography
							variant='h6'
							sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
							component={Link}
							to='/home'
							style={linkStyle}
						>
							Student Portal
						</Typography>
					</motion.div>

					{/* Navigation Links */}
					<div
						style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
					>
						{["Home", "My Schedule", "Conducted Lessons", "My Profile"].map(
							(item, index) => (
								<motion.div
									key={index}
									whileHover={{ scale: 1.1 }}
									transition={{ duration: 0.3 }}
								>
									<Button
										component={Link}
										to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
										color='inherit'
										sx={{ mx: 1 }}
									>
										{item}
									</Button>
								</motion.div>
							)
						)}
					</div>

					{/* Menu Button for Mobile */}
					<IconButton
						color='inherit'
						edge='start'
						sx={{ display: { xs: "block", sm: "none" } }}
					>
						<MenuIcon />
					</IconButton>

					{/* Logout Button */}
					<motion.div
						whileHover={{ scale: 1.1 }}
						transition={{ duration: 0.3 }}
					>
						<Button
							color='error'
							variant='contained'
							sx={{
								textTransform: "none",
								fontWeight: "bold",
								ml: 2,
							}}
							onClick={() => {
								handleSignOut();
							}}
						>
							Logout
						</Button>
					</motion.div>
				</Toolbar>
			</AppBar>
		</motion.div>
	);
};

export default StudentNavbar;
