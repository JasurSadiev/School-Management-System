import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WorkingHoursDisplay from "../components/WorkingHoursDisplay";
import WorkingHoursForm from "../components/HoursForm";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
} from "@mui/material";
import ProfileDropdown from "../components/ProfileDropdown";
import Nav from "../components/ProfileDropdown";

const NonWorkingHours = () => {
	const [openModal, setOpenModal] = useState(false); // Track modal open state

	// Handle modal open and close
	const handleOpen = () => setOpenModal(true);
	const handleClose = () => setOpenModal(false);

	return (
		<div className='flex flex-col max-w-screen overflow-x-hidden min-h-screen'>
			<Navbar selectedItem={2} />
			<div className='ml-[15%] flex flex-col bg-[#d4d6da] min-h-screen'>
				<Nav />

				{/* Add Non-Working Hours Button */}
				<button
					onClick={handleOpen}
					className='bg-blue-600 text-white font-bold w-fit px-2 py-2 rounded-md self-start ml-2 mt-2'
				>
					Add Working Hours
				</button>

				{/* Non-Working Hours Display */}
				<WorkingHoursDisplay />

				{/* Modal for Adding Non-Working Hours */}
				<Dialog open={openModal} onClose={handleClose}>
					<DialogContent>
						<WorkingHoursForm closeModal={handleClose} />
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose} color='primary'>
							Cancel
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		</div>
	);
};

export default NonWorkingHours;
