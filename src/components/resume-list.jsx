"use client";
import React from "react";

function ResumeList({ resumes = [], onStatusChange, onDownload }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredResumes = useMemo(() => {
    if (statusFilter === "all") return resumes;
    return resumes.filter((resume) => resume.status === statusFilter);
  }, [resumes, statusFilter]);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const handleDownload = async (resume) => {
    setLoading(true);
    setError(null);
    try {
      const blob = new Blob([JSON.stringify(resume, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.candidate_name.replace(/\s+/g, "_")}_resume.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download resume");
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-inter">Resumes</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredResumes.map((resume) => (
          <div
            key={resume.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <h3 className="font-medium text-gray-900">
                  {resume.candidate_name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm border ${
                    statusColors[resume.status || "pending"]
                  }`}
                >
                  {resume.status || "pending"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(resume.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={resume.status || "pending"}
                onChange={(e) => onStatusChange?.(resume.id, e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => handleDownload(resume)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <i className="fas fa-download mr-2"></i>
                Download
              </button>
            </div>
          </div>
        ))}
        {filteredResumes.length === 0 && (
          <div className="text-center py-8 text-gray-500">No resumes found</div>
        )}
      </div>
    </div>
  );
}

function ResumeListStory() {
  const [sampleResumes, setSampleResumes] = useState([
    {
      id: 1,
      candidate_name: "John Smith",
      created_at: "2025-01-15T12:00:00Z",
      status: "pending",
      email: "john@example.com",
      experience: "5 years of software development",
    },
    {
      id: 2,
      candidate_name: "Sarah Johnson",
      created_at: "2025-01-14T12:00:00Z",
      status: "accepted",
      email: "sarah@example.com",
      experience: "3 years of product management",
    },
    {
      id: 3,
      candidate_name: "Michael Brown",
      created_at: "2025-01-13T12:00:00Z",
      status: "rejected",
      email: "michael@example.com",
      experience: "2 years of UI/UX design",
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setSampleResumes((prev) =>
      prev.map((resume) =>
        resume.id === id ? { ...resume, status: newStatus } : resume
      )
    );
  };

  const handleDownload = (resume) => {
    console.log("Downloading resume:", resume);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <ResumeList
        resumes={sampleResumes}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default ResumeList;