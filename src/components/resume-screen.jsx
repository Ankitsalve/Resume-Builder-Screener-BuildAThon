"use client";
import React from "react";

function ResumeScreen() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch("/api/resumes/list", { method: "POST" });
        if (!response.ok) {
          throw new Error(`Failed to fetch resumes: ${response.status}`);
        }
        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setError("Could not load resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleResumeClick = async (id) => {
    try {
      const response = await fetch("/api/resumes/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.status}`);
      }
      const data = await response.json();
      setSelectedResume(data.resume);
    } catch (err) {
      console.error("Error fetching resume details:", err);
      setError("Could not load resume details");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <TwoColumnLayout
      leftContent={
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 font-inter">
            Submitted Resumes
          </h2>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => handleResumeClick(resume.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                  selectedResume?.id === resume.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-900">{resume.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
            {resumes.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No resumes found
              </div>
            )}
          </div>
        </div>
      }
      rightContent={
        <div className="p-6">
          {selectedResume ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-inter">
                {selectedResume.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-gray-700">Email</div>
                  <div>{selectedResume.email}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Phone</div>
                  <div>{selectedResume.phone}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Experience</div>
                  <div className="whitespace-pre-wrap">
                    {selectedResume.experience}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Education</div>
                  <div className="whitespace-pre-wrap">
                    {selectedResume.education}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Skills</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedResume.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a resume to view details
            </div>
          )}
        </div>
      }
    />
  );
}

function ResumeScreenStory() {
  const sampleResumes = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "123-456-7890",
      experience: "Senior Software Engineer\nTech Corp (2018-Present)",
      education: "BS Computer Science\nUniversity of Technology (2014-2018)",
      skills: ["JavaScript", "React", "Node.js"],
      createdAt: "2025-01-15T12:00:00Z",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "987-654-3210",
      experience: "Product Manager\nStartup Inc (2019-Present)",
      education: "MBA\nBusiness School (2017-2019)",
      skills: ["Product Strategy", "Team Leadership", "Agile"],
      createdAt: "2025-01-10T12:00:00Z",
    },
  ];

  beforeAll(() => {
    global.fetch = jest.fn((url) => {
      if (url === "/api/resumes/list") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ resumes: sampleResumes }),
        });
      }
      if (url === "/api/resumes/get") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ resume: sampleResumes[0] }),
        });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  return (
    <div className="h-screen bg-gray-100">
      <ResumeScreen />
    </div>
  );
}

export default ResumeScreen;