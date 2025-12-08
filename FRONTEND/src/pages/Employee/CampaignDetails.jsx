import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

import Info from "./Info";
import Gratification from "./Gratification";
import Report from "./Report";
import Period from "./Period";
import Status from "./Status";
import OutletsAssigned from "./OutletsAssigned";
import SubmitReport from "./SubmitReport";

const CampaignDetails = ({ campaignId, onBack }) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  // Fetch campaign details from API
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const response = await fetch(
          "https://srv1168036.hstgr.cloud/api/employee/employee/campaigns",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch campaign details");
        }

        const data = await response.json();
        const selectedCampaign = data.campaigns.find(
          (c) => c._id === campaignId
        );

        if (!selectedCampaign) {
          throw new Error("Campaign not found");
        }

        setCampaign(selectedCampaign);
        setError("");
      } catch (err) {
        console.error("Error fetching campaign details:", err);
        setError(err.message || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignDetails();
    }
  }, [campaignId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <FaSpinner className="animate-spin text-5xl text-[#E4002B]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
        <button
          onClick={onBack}
          className="bg-[#E4002B] text-white px-6 py-2 rounded-md hover:bg-[#C00026] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // No campaign found
  if (!campaign) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600 mb-4">Campaign not found</p>
        <button
          onClick={onBack}
          className="bg-[#E4002B] text-white px-6 py-2 rounded-md hover:bg-[#C00026] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const tabComponents = {
    info: <Info campaign={campaign} />,
    gratification: <Gratification campaign={campaign} />,
    report: <Report campaign={campaign} />,
    period: <Period campaign={campaign} />,
    status: <Status campaign={campaign} />,
    outlets: <OutletsAssigned campaign={campaign} />,
    submitReport: <SubmitReport campaign={campaign} campaignId={campaignId} />,
  };

  return (
    <div className="p-6 bg-[#EDEDED] rounded-lg shadow-md">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 text-[#E4002B] font-medium hover:underline"
      >
        ← Back
      </button>

      {/* Campaign Name Heading */}
      <h2 className="text-2xl font-bold text-[#E4002B] mb-6">
        {campaign.name}
      </h2>

      {/* Submit Report Button */}
      <button
        onClick={() => setActiveTab("submitReport")}
        className="px-4 py-2 rounded-lg bg-[#E4002B] text-white font-medium shadow-md hover:bg-[#c60025] mb-4"
      >
        Submit Report
      </button>

      {/* Black Separation Line */}
      <div className="w-full h-[1px] bg-black mb-6"></div>

      {/* 3×2 Grid Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { key: "info", label: "Info" },
          { key: "gratification", label: "Gratification" },
          { key: "report", label: "View Report" },
          { key: "period", label: "Period" },
          { key: "outlets", label: "Outlets Assigned" },
          { key: "status", label: "Status" },
        ].map((item) => (
          <button
            key={item.key}
            className={`p-4 border rounded-lg text-center shadow-sm font-medium transition
              ${
                activeTab === item.key
                  ? "bg-[#E4002B] text-white"
                  : "hover:shadow-md hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENT SECTION */}
      <div className="mt-6 border-2 border-[#E4002B] rounded-lg p-6">
        {tabComponents[activeTab]}
      </div>
    </div>
  );
};

export default CampaignDetails;