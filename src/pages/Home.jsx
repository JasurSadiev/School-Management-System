import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Navbar from "../components/Navbar";
import Nav from "../components/ProfileDropdown";

const Home = () => {
	const { user, logout, role } = useAuth();
	const navigate = useNavigate();

	console.log(role);
	return (
		<div className='flex flex-col'>
			<Navbar />
			<Nav />
		</div>
	);
};

export default Home;
