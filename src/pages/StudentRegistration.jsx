// ParentRegistrationForm.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, db } from "../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function ParentRegistrationForm() {
	const { register, handleSubmit, reset } = useForm();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const userCred = await createUserWithEmailAndPassword(
				auth,
				data.email,
				data.password
			);
			const parentId = userCred.user.uid;

			// Create parent document
			await setDoc(doc(db, "parents", parentId), {
				name: data.parentName,
				email: data.email,
				phoneNumber: data.phoneNumber,
				balance: parseInt(data.balance, 10),
				children: [], // will be updated later
			});

			// Create user reference
			await setDoc(doc(db, "users", parentId), {
				uid: parentId,
				email: data.email,
				position: "Parent",
			});

			setSuccess(true);
			reset();
		} catch (err) {
			console.error("Parent registration failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-lg mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Register Parent</h2>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<input
					{...register("parentName", { required: true })}
					placeholder='Parent Name'
					className='input'
				/>
				<input
					{...register("email", { required: true })}
					type='email'
					placeholder='Email'
					className='input'
				/>
				<input
					{...register("password", { required: true })}
					type='password'
					placeholder='Password'
					className='input'
				/>
				<input
					{...register("phoneNumber", { required: true })}
					placeholder='Phone Number'
					className='input'
				/>
				<input
					{...register("balance", { required: true })}
					type='number'
					placeholder='Lesson Balance'
					className='input'
				/>
				<button
					type='submit'
					className='btn bg-green-600 text-white px-4 py-2'
					disabled={loading}
				>
					{loading ? "Registering..." : "Register Parent"}
				</button>
				{success && (
					<p className='text-green-500'>Parent registered successfully!</p>
				)}
			</form>
		</div>
	);
}
