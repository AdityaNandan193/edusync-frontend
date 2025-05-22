import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FileUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
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
            setUploadedUrl(uploadedUrl);
            toast.success('File uploaded successfully!');
            onUploadSuccess(uploadedUrl);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
            toast.error(`Error uploading file: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => {
                toast.success('URL copied to clipboard!');
            },
            () => {
                toast.error('Failed to copy URL');
            }
        );
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    <p className="mt-2 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                    </p>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`mt-4 px-4 py-2 rounded ${
                        !selectedFile || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                    } text-white transition-colors`}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>

                {uploadedUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded File URL:</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={uploadedUrl}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(uploadedUrl)}
                                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Click the copy button to copy this URL for use in your course
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload; 