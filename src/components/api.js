import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

export const getLessonStatus = async (lessonId) => {
	try {
		// Reference the ConductedLessons collection
		const lessonsCollection = collection(db, "ConductedLessons");

		// Fetch all documents in the collection
		const querySnapshot = await getDocs(lessonsCollection);

		// Loop through each document to find a match for lessonId
		for (const docSnap of querySnapshot.docs) {
			const data = docSnap.data();
			if (data.lessonId === lessonId) {
				// Check if the status is "completed"
				return data.status === "completed";
			}
		}

		// If no matching lessonId is found, return false
		return false;
	} catch (error) {
		console.error("Error fetching lesson status:", error);
		return false; // Return false on error
	}
};
