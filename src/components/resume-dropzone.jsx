"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function ResumeDropzone({ onFileUpload, onFileRemove }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [upload, { loading: uploadLoading }] = useUpload();

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      setLoading(true);
      setError(null);

      for (const file of acceptedFiles) {
        if (
          !file.type.match(
            "application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
        ) {
          setError("Please upload PDF or DOCX files only");
          setLoading(false);
          return;
        }

        try {
          const { url, error: uploadError } = await upload({ file });
          if (uploadError) {
            throw new Error(uploadError);
          }

          const response = await fetch("/api/resumes/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidate_name: file.name.split(".")[0],
              file_url: url,
            }),
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }

          const data = await response.json();
          setParsedData(data.resume);
          setFiles((prev) => [...prev, { file, url }]);
          onFileUpload?.(data.resume);
        } catch (err) {
          console.error("Upload error:", err);
          setError("Failed to upload file. Please try again.");
        }
      }
      setLoading(false);
    },
    [upload, onFileUpload]
  );

  const removeFile = useCallback(
    (fileToRemove) => {
      setFiles((files) => files.filter((f) => f.file !== fileToRemove));
      onFileRemove?.(fileToRemove);
      setParsedData(null);
    },
    [onFileRemove]
  );

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          loading
            ? "border-gray-300 bg-gray-50"
            : "border-blue-300 hover:border-blue-400"
        }`}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(Array.from(e.dataTransfer.files));
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          <i className="fas fa-cloud-upload-alt text-4xl text-blue-500"></i>
          <div className="text-gray-600">
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <p>Drag and drop your resume here</p>
                <p className="text-sm">or</p>
                <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => handleDrop(Array.from(e.target.files))}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(({ file }, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <i className="fas fa-file-alt text-gray-500"></i>
                <span className="text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(file)}
                className="text-red-500 hover:text-red-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {parsedData && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">
            Resume Parsed Successfully
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>Name: {parsedData.candidate_name}</p>
            {parsedData.email && <p>Email: {parsedData.email}</p>}
            {parsedData.phone && <p>Phone: {parsedData.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeDropzoneStory() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = useCallback((resumeData) => {
    setUploadedFiles((prev) => [...prev, resumeData]);
  }, []);

  const handleFileRemove = useCallback((file) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Resume Upload</h2>
      <ResumeDropzone
        onFileUpload={handleFileUpload}
        onFileRemove={handleFileRemove}
      />
    </div>
  );
}

export default ResumeDropzone;