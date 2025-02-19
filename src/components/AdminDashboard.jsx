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
            const res = await axios.get("http://localhost:3678/api/admin/subjects", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
            });
            console.log('Fetched subjects with materials:', res.data); // Debug log
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3678/api/admin/subjects", newSubject, {
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
            console.log('Deleting subject:', subjectId); // Debug log
            
            if (!subjectId) {
                console.error('Missing subjectId');
                return;
            }

            await axios.delete(`http://localhost:3678/api/admin/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
            });
            
            console.log('Subject deleted successfully');
            fetchSubjectsWithMaterials(); // Refresh the subjects list
        } catch (error) {
            console.error("Failed to delete subject:", error.response?.data || error.message);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newMaterial.title);
            formData.append('subjectId', newMaterial.subjectId);
            if (newMaterial.file) {
                formData.append('file', newMaterial.file);
            }
            if (newMaterial.link) {
                formData.append('link', newMaterial.link);
            }

            await axios.post("http://localhost:3678/api/materials/create", formData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNewMaterial({ title: "", subjectId: "", file: null, link: "" });
            fetchSubjectsWithMaterials();
        } catch (error) {
            console.error("Failed to add material", error);
        }
    };

    const handleDeleteMaterial = async (materialId, subjectId) => {
        try {
            console.log('Attempting to delete material:', { materialId, subjectId }); // Debug log
            
            if (!materialId || !subjectId) {
                console.error('Missing materialId or subjectId');
                return;
            }

            const response = await axios.delete(`http://localhost:3678/api/admin/materials/${materialId}`, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                },
                data: { subjectId }
            });
            
            console.log('Material deletion response:', response.data);
            fetchSubjectsWithMaterials(); // Refresh the subjects list
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
            const response = await axios.get(
                `http://localhost:3678/api/admin/materials/download/${material._id}`,
                {
                    headers: { 
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}` 
                    },
                    responseType: 'blob'
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = material.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
                                        {material.fileName && (
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