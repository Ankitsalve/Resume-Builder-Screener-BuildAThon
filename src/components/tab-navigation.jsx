"use client";
import React from "react";

function TabNavigation({ tabs = [], activeTab = 0, onTabChange }) {
  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange?.(index)}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 relative ${
              activeTab === index
                ? "text-blue-600 hover:text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[activeTab]?.content}</div>
    </div>
  );
}

function TabNavigationStory() {
  const [activeTab, setActiveTab] = useState(0);

  const sampleTabs = [
    {
      label: "Personal Info",
      content: (
        <div className="p-4 bg-white rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">
            Personal Information
          </h2>
          <p className="mt-2 text-gray-600">
            This is the personal information tab content.
          </p>
        </div>
      ),
    },
    {
      label: "Experience",
      content: (
        <div className="p-4 bg-white rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">Work Experience</h2>
          <p className="mt-2 text-gray-600">
            This is the work experience tab content.
          </p>
        </div>
      ),
    },
    {
      label: "Education",
      content: (
        <div className="p-4 bg-white rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">Education</h2>
          <p className="mt-2 text-gray-600">
            This is the education tab content.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <TabNavigation
        tabs={sampleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default TabNavigation;