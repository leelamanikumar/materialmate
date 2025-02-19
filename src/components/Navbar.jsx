import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const scrollToAbout = () => {
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToHome = () => {
        navigate('/');
        // Scroll to top when returning home
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav>
            <button onClick={goToHome} className="nav-button">Home</button>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={scrollToAbout} className="nav-button">About</button>
        </nav>
    );
};

export default Navbar;