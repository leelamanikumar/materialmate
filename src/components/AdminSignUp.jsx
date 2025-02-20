import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminSignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/admin/signup`, { email, password });
            navigate("/admin/signin");
        } catch (error) {
            console.error("Signup failed", error);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign Up</button>
        </form>
    );
};
export default AdminSignUp;