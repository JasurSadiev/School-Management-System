import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./Context/AuthContext";
import SessionManager from "./components/SessionManager";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
	<Router>
		{" "}
		{/* Router wraps everything */}
		<AuthProvider>
			<SessionManager /> {/* Will now have Router context */}
			<App /> {/* All routing is handled inside App */}
		</AuthProvider>
	</Router>
);
