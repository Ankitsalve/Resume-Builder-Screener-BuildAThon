"use client";
import React from "react";

function ResumeForm({ onSubmit, initialData = {} }) {
  const [skills, setSkills] = useState(initialData.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      experience: formData.get("experience"),
      education: formData.get("education"),
      skills: skills,
    };

    if (!data.name) {
      setError("Name is required");
      return;
    }

    onSubmit?.(data);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      {error && <div className="text-red-600 font-medium">{error}</div>}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          name="name"
          defaultValue={initialData.name}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={initialData.email}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          name="phone"
          defaultValue={initialData.phone}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Experience
        </label>
        <textarea
          name="experience"
          defaultValue={initialData.experience}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Education
        </label>
        <textarea
          name="education"
          defaultValue={initialData.education}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Skills
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
}

function ResumeFormStory() {
  const handleSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  const withData = {
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    experience: "10 years of software development",
    education: "BS in Computer Science",
    skills: ["JavaScript", "React", "Node.js"],
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Empty Form</h2>
        <ResumeForm onSubmit={handleSubmit} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Pre-filled Form</h2>
        <ResumeForm onSubmit={handleSubmit} initialData={withData} />
      </div>
    </div>
  );
}

export default ResumeForm;