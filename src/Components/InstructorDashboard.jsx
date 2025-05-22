import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        mediaUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('https://localhost:7136/api/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response.data.fileUrl;
            setCourseData(prev => ({ ...prev, mediaUrl: uploadedUrl }));
            toast.success('File uploaded successfully!');
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
            toast.error(`Error uploading file: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!courseData.mediaUrl) {
            toast.error('Please upload course material first!');
            return;
        }

        try {
            const response = await axios.post('https://localhost:7136/api/courses', courseData);
            toast.success('Course created successfully!');
            navigate('/courses');
        } catch (error) {
            toast.error('Error creating course: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={courseData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter course title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Description
                            </label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter course description"
                            />
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Course Material</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    <label
                                        htmlFor="fileInput"
                                        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Select File
                                    </label>
                                    {selectedFile && (
                                        <span className="text-sm text-gray-600">
                                            Selected: {selectedFile.name}
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile || uploading}
                                    className={`px-4 py-2 rounded ${
                                        !selectedFile || uploading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                    } text-white transition-colors`}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Material'}
                                </button>

                                {courseData.mediaUrl && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Material:</p>
                                        <a 
                                            href={courseData.mediaUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                        >
                                            {courseData.mediaUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!courseData.mediaUrl}
                                className={`px-6 py-2 rounded-md text-white ${
                                    !courseData.mediaUrl
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                }`}
                            >
                                Create Course
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard; 