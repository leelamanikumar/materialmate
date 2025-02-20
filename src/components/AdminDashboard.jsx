import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: "", description: "" });
    const [newMaterial, setNewMaterial] = useState({ 
        title: "", 
        subjectId: "",
        file: null,
        link: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/signin");
            return;
        }
        fetchSubjectsWithMaterials();
    }, [navigate]);

    const fetchSubjectsWithMaterials = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subjects`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
            });
            console.log('Fetched subjects with materials:', res.data);
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/subjects`, newSubject, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
            });
            setNewSubject({ name: "", description: "" });
            fetchSubjectsWithMaterials();
        } catch (error) {
            console.error("Failed to add subject", error);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        try {
            console.log('Deleting subject:', subjectId);
            
            if (!subjectId) {
                console.error('Missing subjectId');
                return;
            }

            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
            });
            
            console.log('Subject deleted successfully');
            fetchSubjectsWithMaterials();
        } catch (error) {
            console.error("Failed to delete subject:", error.response?.data || error.message);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            console.log('Starting material upload...');
            console.log('Material data:', newMaterial);

            const formData = new FormData();
            formData.append('title', newMaterial.title);
            formData.append('subjectId', newMaterial.subjectId);
            if (newMaterial.file) {
                formData.append('file', newMaterial.file);
                console.log('File being uploaded:', newMaterial.file);
            }
            if (newMaterial.link) {
                formData.append('link', newMaterial.link);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/materials`,
                formData,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Upload response:', response.data);
            setNewMaterial({ title: "", subjectId: "", file: null, link: "" });
            fetchSubjectsWithMaterials();
        } catch (error) {
            console.error('Material upload error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(`Failed to add material: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteMaterial = async (materialId, subjectId) => {
        try {
            console.log('Attempting to delete material:', { materialId, subjectId });
            
            if (!materialId || !subjectId) {
                console.error('Missing materialId or subjectId');
                return;
            }

            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/materials/${materialId}`, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                },
                data: { subjectId }
            });
            
            console.log('Material deletion response:', response.data);
            fetchSubjectsWithMaterials();
        } catch (error) {
            console.error("Failed to delete material:", error.response?.data || error.message);
        }
    };

    const handleFileChange = (e) => {
        setNewMaterial({
            ...newMaterial,
            file: e.target.files[0]
        });
    };

    const handleDownload = async (material) => {
        try {
            if (material.fileUrl) {
                // For Cloudinary files, directly open in a new tab
                window.open(material.fileUrl, '_blank');
            } else if (material.link) {
                // For external links
                window.open(material.link, '_blank');
            } else {
                console.error("No file URL or link available");
            }
        } catch (error) {
            console.error("Failed to download material:", error);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard - Manage Subjects and Materials</h2>
            
            <form onSubmit={handleAddSubject}>
                <h3>Add New Subject</h3>
                <input
                    type="text"
                    placeholder="Subject Name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                    required
                />
                <button type="submit">Add Subject</button>
            </form>

            <form onSubmit={handleAddMaterial} className="material-form">
                <h3>Add New Material</h3>
                <select
                    value={newMaterial.subjectId}
                    onChange={(e) => setNewMaterial({...newMaterial, subjectId: e.target.value})}
                    required
                >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Material Title"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                    required
                />
                <div className="material-upload-section">
                    <div className="file-input-container">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            id="file-upload"
                            className="file-input"
                        />
                        <label htmlFor="file-upload" className="file-label">
                            {newMaterial.file ? newMaterial.file.name : 'Choose File (Optional)'}
                        </label>
                    </div>
                    <div className="link-input-container">
                        <input
                            type="url"
                            placeholder="Or enter a downloadable link"
                            value={newMaterial.link}
                            onChange={(e) => setNewMaterial({...newMaterial, link: e.target.value})}
                            className="link-input"
                        />
                    </div>
                </div>
                <div className="form-note">
                    Note: You can either upload a file or provide a downloadable link
                </div>
                <button type="submit">Add Material</button>
            </form>

            <div className="subjects-list">
                {subjects.map(subject => (
                    <div key={subject._id} className="subject-card">
                        <h3>{subject.name}</h3>
                        <p>{subject.description}</p>
                        <button 
                            onClick={() => handleDeleteSubject(subject._id)}
                            className="delete-subject-btn"
                        >
                            Delete Subject
                        </button>
                        
                        <div className="materials-list">
                            <h4>Materials:</h4>
                            {subject.materials && subject.materials.map(material => (
                                <div key={material._id} className="material-item">
                                    <div className="material-content">
                                        <h5>{material.title}</h5>
                                        {material.fileUrl && (
                                            <div className="material-file">
                                                <p>File: {material.fileName}</p>
                                                <button 
                                                    onClick={() => handleDownload(material)}
                                                    className="download-btn"
                                                >
                                                    Download Material
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
                                    <div className="material-actions">
                                        <p className="material-name">
                                            Material Name: {material.title}
                                        </p>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMaterial(material._id, subject._id);
                                            }}
                                            className="delete-material-btn"
                                        >
                                            Delete Material
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;