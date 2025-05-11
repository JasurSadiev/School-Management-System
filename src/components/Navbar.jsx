import React from "react";
import { List, ListItemButton, ListItemText, Divider } from "@mui/material";
import { Link } from "react-router-dom"; // Import the Link component

const Navbar = ({ selectedItem }) => {
	const [selectedIndex, setSelectedIndex] = React.useState(selectedItem);

	const handleListItemClick = (event, index) => {
		setSelectedIndex(index);
	};

	return (
		<nav className='min-w-fit w-[15%] h-screen bg-gray-800 fixed top-0 left-0'>
			<Link to={"/"}>
				<h1 className='text-left text-white text-2xl font-medium pl-4 px-2 py-2'>
					CRM
				</h1>
			</Link>
			<Divider sx={{ bgcolor: "gray", mt: "5px" }} />
			<List
				component='nav'
				aria-label='main mailbox folders'
				sx={{ color: "white", mt: "10px" }}
			>
				{/* Wrap ListItemButton with Link */}
				<Link to='/my-students' style={{ textDecoration: "none" }}>
					<ListItemButton
						selected={selectedIndex === 0}
						onClick={(event) => handleListItemClick(event, 0)}
						sx={{
							color: selectedIndex === 0 ? "#649AF1" : "white",
							"&:hover": {
								backgroundColor: "#673ab7",
							},
						}}
					>
						<ListItemText primary='My Students' />
					</ListItemButton>
				</Link>

				<Link to='/my-schedule' style={{ textDecoration: "none" }}>
					<ListItemButton
						selected={selectedIndex === 1}
						onClick={(event) => handleListItemClick(event, 1)}
						sx={{
							color: selectedIndex === 1 ? "#649AF1" : "white",
							"&:hover": {
								backgroundColor: "#673ab7",
							},
						}}
					>
						<ListItemText primary='Schedule' />
					</ListItemButton>
				</Link>

				<Link to='/non-working-hours' style={{ textDecoration: "none" }}>
					<ListItemButton
						selected={selectedIndex === 2}
						onClick={(event) => handleListItemClick(event, 2)}
						sx={{
							color: selectedIndex === 2 ? "#649AF1" : "white",
							"&:hover": {
								backgroundColor: "#673ab7",
							},
						}}
					>
						<ListItemText primary='Working Hours' />
					</ListItemButton>
				</Link>
			</List>
		</nav>
	);
};

export default Navbar;
