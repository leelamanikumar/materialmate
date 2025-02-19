import React from 'react';

const Home = () => {
    return (
        <div className="home-container">
            <section className="hero-section">
                <h1>Welcome to Learning Management System</h1>
                <p>Explore our comprehensive learning materials and resources</p>
            </section>

            <section id="about-section" className="about-section">
                <div className="about-content">
                    <h2>About Us</h2>
                    <div className="about-grid">
                        <div className="about-card">
                            <h3>Our Mission</h3>
                            <p>To provide quality education and learning resources to students worldwide, making education accessible and engaging for everyone.</p>
                        </div>
                        <div className="about-card">
                            <h3>What We Offer</h3>
                            <p>Comprehensive study materials, interactive learning resources, and a user-friendly platform for both students and educators.</p>
                        </div>
                        <div className="about-card">
                            <h3>Our Vision</h3>
                            <p>To become the leading platform for educational resources and create a community of lifelong learners.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 