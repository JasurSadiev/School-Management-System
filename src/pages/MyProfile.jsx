import React from "react";
import Navbar from "../components/Navbar";
import Nav from "../components/ProfileDropdown";
import ProfileDetails from "../components/ProfileDetails";

const MyProfile = () => {
	return (
		<div>
			<Navbar selectedItem={-1} />
			<Nav />
			<ProfileDetails />
		</div>
	);
};

export default MyProfile;
