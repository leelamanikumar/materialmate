import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        const fetchSubjects = async () => {
            try {
                const res = await axios.get("http://localhost:3678/api/subjects", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubjects(res.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/signin");
                }
            }
        };

        fetchSubjects();
    }, [navigate]);

    const handleSubjectClick = async (subjectId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:3678/api/materials/${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(res.data);
            setSelectedSubject(subjects.find(subject => subject._id === subjectId));
        } catch (error) {
            console.error("Failed to fetch materials", error);
        }
    };

    const handleBack = () => {
        setSelectedSubject(null);
        setMaterials([]);
    };

    const handleDownload = async (material) => {
        try {
            setIsDownloading(true);
            
            if (material.cloudinaryId) {
                // Get a fresh signed URL
                const response = await axios.get(`http://localhost:3678/api/materials/url/${material._id}`);
                const { url } = response.data;
                
                console.log('Download URL:', url); // Debug log

                // Use window.location for direct download
                window.location.href = url;
            } else if (material.link) {
                window.open(material.link, '_blank');
            } else {
                console.error("No file URL or link available");
                alert("No file URL or link available");
            }
        } catch (error) {
            console.error("Failed to download material:", error);
            alert("Failed to download material. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (selectedSubject) {
        return (
            <div className="materials-view">
                <button className="back-button" onClick={handleBack}>← Back to Subjects</button>
                <h2>{selectedSubject.name}</h2>
                <p className="subject-description">{selectedSubject.description}</p>
                
                <div className="materials-container">
                    <h3>Available Materials</h3>
                    {materials.length > 0 ? (
                        <div className="materials-grid">
                            {materials.map(material => (
                                <div key={material._id} className="material-card">
                                    <h4>{material.title}</h4>
                                    <div className="material-content">
                                        {material.fileUrl && (
                                            <div className="material-file">
                                                <p>File: {material.fileName}</p>
                                                <button 
                                                    onClick={() => handleDownload(material)}
                                                    className="download-btn"
                                                    disabled={isDownloading}
                                                >
                                                    {isDownloading ? 'Loading...' : 'Download Material'}
                                                </button>
                                            </div>
                                        )}
                                        {material.link && (
                                            <div className="material-link">
                                                <a 
                                                    href={material.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="link-btn"
                                                >
                                                    Open Link
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-materials">No materials available for this subject yet.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Dashboard</h2>
            <div className="subjects-list">
                {subjects.map(subject => (
                    <div 
                        key={subject._id} 
                        className="subject-card clickable"
                        onClick={() => handleSubjectClick(subject._id)}
                    >
                        <h3>{subject.name}</h3>
                        <p>{subject.description}</p>
                        <div className="view-materials">Click to view materials →</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;