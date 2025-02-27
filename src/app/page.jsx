"use client";
import React from "react";
import ResumeDropzone from "../components/resume-dropzone";
import ResumeForm from "../components/resume-form";
import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "Hello! I'm your resume assistant. I can help you create a professional resume or review existing ones. To get started, you can either create a new resume or upload an existing one. What would you like to do?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [upload] = useUpload();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/get-resumes", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const generatePDF = async (data) => {
    setPdfLoading(true);
    try {
      const jsonResumeFormat = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert at converting resume data into JSON Resume format. Return only the JSON, no explanation.",
              },
              {
                role: "user",
                content: `Convert this resume data to JSON Resume format:
                Name: ${data.name}
                Email: ${data.email}
                Phone: ${data.phone}
                Experience: ${data.experience}
                Education: ${data.education}
                Skills: ${data.skills.join(", ")}
              `,
              },
            ],
            json_schema: {
              name: "json_resume",
              schema: {
                type: "object",
                properties: {
                  basics: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      summary: { type: "string" },
                    },
                    required: ["name", "email", "phone", "summary"],
                    additionalProperties: false,
                  },
                  work: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        position: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        highlights: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: [
                        "company",
                        "position",
                        "startDate",
                        "endDate",
                        "highlights",
                      ],
                      additionalProperties: false,
                    },
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        area: { type: "string" },
                        studyType: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                      },
                      required: [
                        "institution",
                        "area",
                        "studyType",
                        "startDate",
                        "endDate",
                      ],
                      additionalProperties: false,
                    },
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["basics", "work", "education", "skills"],
                additionalProperties: false,
              },
            },
          }),
        }
      );

      const jsonResumeResult = await jsonResumeFormat.json();
      const jsonResume = JSON.parse(
        jsonResumeResult.choices[0].message.content
      );

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const formatResponse = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "Create professional resume HTML with inline CSS styles.",
              },
              {
                role: "user",
                content: `Create a professional resume HTML using this data: ${JSON.stringify(
                  jsonResume
                )}
                Requirements:
                - Use inline CSS only
                - Use Arial/Helvetica fonts
                - Clean, modern layout
                - Proper spacing/margins
                - Skills as tags
                - Print-optimized
                Return ONLY HTML.`,
              },
            ],
          }),
        }
      );

      const formattedResult = await formatResponse.json();
      const htmlContent = formattedResult.choices[0].message.content;

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume - ${data.name}</title>
            <meta charset="utf-8">
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .skill-tag {
                display: inline-block;
                background: #f0f0f0;
                padding: 4px 8px;
                margin: 2px;
                border-radius: 4px;
                font-size: 14px;
              }
              section { margin-bottom: 20px; }
              h1, h2, h3 { 
                color: #2c5282;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.print();

          setTimeout(() => {
            document.body.removeChild(iframe);
            setPdfLoading(false);
          }, 1000);
        } catch (error) {
          console.error("Print error:", error);
          setError("Failed to generate PDF. Please try again.");
          document.body.removeChild(iframe);
          setPdfLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF");
      setPdfLoading(false);
    }
  };

  const handleResumeSubmit = async (data) => {
    try {
      setIsTyping(true);
      setPdfLoading(true);

      // First save the resume to the database
      const createResponse = await fetch("/api/create-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: data.name,
          email: data.email,
          phone: data.phone,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
          status: "pending",
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to save resume");
      }

      const { resume } = await createResponse.json();

      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content:
            "I've created a new resume with the following details:\n\n" +
            `Name: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Phone: ${data.phone}\n` +
            `Experience:\n${data.experience}\n\n` +
            `Education:\n${data.education}\n\n` +
            `Skills: ${data.skills.join(", ")}`,
        },
      ]);

      const aiResponse = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Please review this resume and provide feedback:\n\n${JSON.stringify(
                  data,
                  null,
                  2
                )}`,
              },
            ],
          }),
        }
      );

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: aiResult.choices[0].message.content,
          },
        ]);
      }

      await fetchResumes();
      await generatePDF(data);
    } catch (error) {
      console.error("Error creating resume:", error);
      setError("Failed to create resume");
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "Sorry, I encountered an error while processing your resume.",
        },
      ]);
    } finally {
      setIsTyping(false);
      setPdfLoading(false);
    }
  };

  const handleResumeSelect = async (resumeId) => {
    setSelectedResumeId(resumeId);
    try {
      const [chatResponse, resumeResponse] = await Promise.all([
        fetch("/api/get-chat-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_id: resumeId }),
        }),
        fetch("/api/get-resume-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_id: resumeId }),
        }),
      ]);

      if (!chatResponse.ok || !resumeResponse.ok) {
        throw new Error("Failed to fetch resume data");
      }

      const { messages: chatHistory } = await chatResponse.json();
      const { resume } = await resumeResponse.json();

      setMessages(
        chatHistory.map((msg) => ({
          type: msg.is_bot ? "bot" : "user",
          content: msg.message,
        }))
      );

      const aiResponse = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Analyze this resume and provide screening feedback: ${JSON.stringify(
                  resume
                )}`,
              },
            ],
          }),
        }
      );

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        handleSendMessage(aiResult.choices[0].message.content);
      }
    } catch (error) {
      console.error("Error fetching resume data:", error);
      setError("Failed to fetch resume data");
    }
  };

  const handleSendMessage = async (message) => {
    setMessages((prev) => [...prev, { type: "user", content: message }]);
    setIsTyping(true);

    try {
      if (selectedResumeId) {
        await fetch("/api/send-chat-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            resume_id: selectedResumeId,
          }),
        });
      }

      const aiResponse = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((msg) => ({
                role: msg.type === "user" ? "user" : "assistant",
                content: msg.content,
              })),
              { role: "user", content: message },
            ],
          }),
        }
      );

      if (!aiResponse.ok) {
        throw new Error("Failed to get AI response");
      }

      const aiResult = await aiResponse.json();
      const botResponse = aiResult.choices[0].message.content;

      setMessages((prev) => [...prev, { type: "bot", content: botResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      console.log(
        "Uploading file:",
        file.name,
        "Type:",
        file.type,
        "Size:",
        file.size
      );

      if (
        !file.type.match(
          "application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        throw new Error(
          `File type ${file.type} not supported. Please upload PDF, DOC, or DOCX files only`
        );
      }

      const { url, error: uploadError } = await upload({
        file,
        contentType: file.type,
      });

      if (uploadError) {
        throw new Error(uploadError);
      }

      console.log("File uploaded successfully, URL:", url);

      const createResponse = await fetch("/api/create-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: file.name.split(".")[0],
          resume_file_url: url,
          status: "pending",
        }),
      });

      if (!createResponse.ok) {
        throw new Error(
          `Failed to create resume entry: ${createResponse.status}`
        );
      }

      const { resume } = await createResponse.json();

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: url }),
      });

      if (!parseResponse.ok) {
        throw new Error(`Failed to parse resume: ${parseResponse.status}`);
      }

      const parsedData = await parseResponse.json();

      const updateResponse = await fetch("/api/update-resume-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: resume.id,
          ...parsedData,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update resume data: ${updateResponse.status}`
        );
      }

      await fetchResumes();
      await handleResumeSelect(resume.id);
    } catch (error) {
      console.error("Error details:", error);
      setError(error.message || "Failed to process resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    {
      label: "Create Resume",
      content: <ResumeForm onSubmit={handleResumeSubmit} />,
    },
    {
      label: "Screen Resumes",
      content: (
        <div className="space-y-6">
          <ResumeDropzone
            onFileUpload={handleFileUpload}
            onError={setError}
            acceptedFileTypes={[".pdf", ".doc", ".docx"]}
          />
          <ResumeList
            resumes={resumes}
            onResumeSelect={handleResumeSelect}
            onStatusChange={async (resumeId, status) => {
              try {
                await fetch("/api/update-resume-status", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resume_id: resumeId, status }),
                });
                await fetchResumes();
              } catch (error) {
                console.error("Error updating status:", error);
                setError("Failed to update status");
              }
            }}
          />
          {isUploading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p>Processing resume...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 border-b border-gray-200">
        <TabNavigation
          tabs={[{ label: "Create Resume" }, { label: "Screen Resumes" }]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-7/12 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 0 ? (
              <>
                <ResumeForm onSubmit={handleResumeSubmit} />
                {pdfLoading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <p>Generating resume...</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <ResumeDropzone onFileUpload={handleFileUpload} />
                <ResumeList
                  resumes={resumes}
                  onResumeSelect={handleResumeSelect}
                  onStatusChange={async (resumeId, status) => {
                    try {
                      const response = await fetch(
                        "/api/update-resume-status",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ resume_id: resumeId, status }),
                        }
                      );
                      if (response.ok) {
                        await fetchResumes();
                      }
                    } catch (error) {
                      console.error("Error updating status:", error);
                      setError("Failed to update status");
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-5/12 flex flex-col">
          <div className="flex-1">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;