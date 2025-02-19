import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminSignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3678/api/auth/admin/signin", { email, password });
            localStorage.setItem("adminToken", res.data.token);
            navigate("/admin/dashboard");
        } catch (error) {
            console.error("Login Failed", error.response.data);
        }
    };

    return (
        <div>
            <h2>Admin Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default AdminSignIn;
