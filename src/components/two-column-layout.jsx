"use client";
import React from "react";

function TwoColumnLayout({ leftContent, rightContent }) {
  return (
    <div className="flex h-screen w-full">
      <div className="w-[60%] h-full border-r border-gray-200 dark:border-gray-700">
        {leftContent}
      </div>
      <div className="w-[40%] h-full">{rightContent}</div>
    </div>
  );
}

function TwoColumnLayoutStory() {
  return (
    <div>
      <TwoColumnLayout
        leftContent={
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-inter">
              Left Panel
            </h1>
          </div>
        }
        rightContent={
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-inter">
              Right Panel
            </h1>
          </div>
        }
      />
    </div>
  );
}

export default TwoColumnLayout;