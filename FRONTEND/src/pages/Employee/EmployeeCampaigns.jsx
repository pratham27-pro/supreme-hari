import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const EmployeeCampaign = ({ campaigns = [], onView }) => {
  const [campaignData, setCampaignData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState({});

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
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
          throw new Error("Failed to fetch campaigns");
        }

        const data = await response.json();

        // Transform the campaigns data to match the component structure
        const formattedCampaigns = data.campaigns.map((campaign) => {
          // Find the employee's status in assignedEmployees array
          const employeeStatus = campaign.assignedEmployees?.find(
            (emp) => emp.employeeId._id === data.employee.id
          );

          return {
            id: campaign._id,
            name: campaign.name,
            type: campaign.type,
            startDate: new Date(campaign.startDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            }),
            endDate: new Date(campaign.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            }),
            status: employeeStatus?.status || "pending", // pending, accepted, rejected
            description: campaign.description,
            assignedRetailers: campaign.assignedRetailers?.length || 0,
          };
        });

        setCampaignData(formattedCampaigns);
        setError("");
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(err.message || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Update campaign status (Accept/Reject)
  const handleStatusUpdate = async (campaignId, newStatus) => {
    try {
      setStatusUpdating((prev) => ({ ...prev, [campaignId]: true }));

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      const response = await fetch(
        `https://srv1168036.hstgr.cloud/api/employee/employee/campaigns/${campaignId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      const data = await response.json();

      // Update local state
      setCampaignData((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: newStatus }
            : campaign
        )
      );

      // Show success message
      alert(data.message || `Campaign ${newStatus} successfully`);
    } catch (err) {
      console.error("Error updating campaign status:", err);
      alert(err.message || "Failed to update campaign status");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-[#E4002B]" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#E4002B] text-white px-6 py-2 rounded-md hover:bg-[#C00026] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#E4002B]">My Campaigns</h2>

      {campaignData.length === 0 ? (
        <div className="text-center py-10 rounded-lg">
          <p className="text-gray-200 text-lg">No campaigns assigned yet.</p>
          <p className="text-gray-200 text-sm mt-2">
            Check back later for new assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignData.map((campaign) => (
            <div
              key={campaign.id}
              className="border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition bg-[#EDEDED]"
            >
              {/* Campaign Name */}
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {campaign.name}
              </h3>

              {/* Campaign Type */}
              <p className="text-xs text-gray-500 mb-3 uppercase font-medium">
                {campaign.type}
              </p>

              {/* Dates */}
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Start:</span> {campaign.startDate}
              </p>

              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">End:</span> {campaign.endDate}
              </p>

              {/* Assigned Retailers */}
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Retailers:</span>{" "}
                {campaign.assignedRetailers}
              </p>

              {/* VIEW DETAILS BUTTON */}
              {campaign.status !== "rejected" && (
                <button
                  className="w-full bg-[#E4002B] text-white py-2 rounded-md hover:bg-[#C00026] transition font-medium text-sm mb-3"
                  onClick={() => onView?.(campaign.id)}
                >
                  View Details
                </button>
              )}

              {/* STATUS MESSAGE */}
              {campaign.status === "accepted" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-3">
                  <p className="text-green-700 font-semibold flex items-center gap-2 text-sm">
                    <FaCheck className="text-sm" /> Campaign Accepted
                  </p>
                </div>
              )}

              {campaign.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
                  <p className="text-red-700 font-semibold flex items-center gap-2 text-sm">
                    <FaTimes className="text-sm" /> Campaign Rejected
                  </p>
                </div>
              )}

              {/* ACCEPT + REJECT BUTTONS */}
              {campaign.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-1.5 rounded-md text-xs hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handleStatusUpdate(campaign.id, "accepted")}
                    disabled={statusUpdating[campaign.id]}
                  >
                    {statusUpdating[campaign.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaCheck /> Accept
                      </>
                    )}
                  </button>

                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-1.5 rounded-md text-xs hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handleStatusUpdate(campaign.id, "rejected")}
                    disabled={statusUpdating[campaign.id]}
                  >
                    {statusUpdating[campaign.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaTimes /> Reject
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeCampaign;