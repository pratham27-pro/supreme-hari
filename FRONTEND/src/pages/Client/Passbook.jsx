import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#E4002B" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #E4002B" : "none",
    "&:hover": { borderColor: "#E4002B" },
    minHeight: "42px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#FEE2E2" : "white",
    color: "#333",
    "&:active": { backgroundColor: "#FECACA" },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#FEE2E2",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#E4002B",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "#E4002B",
    ":hover": {
      backgroundColor: "#E4002B",
      color: "white",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 20,
  }),
};

const ClientPassbook = () => {
  const token = localStorage.getItem("client_token");

  // All Data from APIs
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [allRetailers, setAllRetailers] = useState([]);
  const [allStates, setAllStates] = useState([]);

  // Selected Filters (Multi-select)
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [selectedRetailers, setSelectedRetailers] = useState([]);

  // Filtered Options for Dropdowns
  const [stateOptions, setStateOptions] = useState([]);
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [retailerOptions, setRetailerOptions] = useState([]);

  const [loading, setLoading] = useState(true);

  // Passbook display data
  const [displayData, setDisplayData] = useState([]);

  // ===============================
  // FETCH ALL DATA ON MOUNT
  // ===============================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch Client Campaigns (only campaigns for this client)
      const campaignsRes = await fetch(
        "https://srv1168036.hstgr.cloud/api/client/client/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const campaignsData = await campaignsRes.json();
      const campaigns = (campaignsData.campaigns || []).filter(
        (c) => c.isActive === true
      );

      // 2️⃣ Fetch Retailers
      const retailersRes = await fetch(
        "https://srv1168036.hstgr.cloud/api/admin/retailers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const retailersData = await retailersRes.json();
      const retailers = retailersData.retailers || [];

      setAllCampaigns(campaigns);
      setAllRetailers(retailers);

      // Extract all unique states from retailers
      const uniqueStates = [
        ...new Set(
          retailers
            .map((r) => r.shopDetails?.shopAddress?.state)
            .filter(Boolean)
        ),
      ];
      setAllStates(uniqueStates);

      // Initialize dropdown options
      setStateOptions(uniqueStates.map((s) => ({ label: s, value: s })));
      setCampaignOptions(
        campaigns.map((c) => ({ label: c.name, value: c._id, data: c }))
      );
      setRetailerOptions(
        retailers.map((r) => ({
          label: `${r.uniqueId} - ${r.shopDetails?.shopName || "N/A"}`,
          value: r.uniqueId,
          data: r,
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH PASSBOOK DATA WHEN FILTERS CHANGE
  // ===============================
  useEffect(() => {
    if (selectedStates.length > 0) {
      fetchPassbookData();
    } else {
      setDisplayData([]);
    }
  }, [selectedStates, selectedCampaigns, selectedRetailers]);

  const fetchPassbookData = async () => {
    try {
      const stateValues = selectedStates.map((s) => s.value);

      // Get retailers from selected states
      let retailersToFetch = allRetailers.filter((r) =>
        stateValues.includes(r.shopDetails?.shopAddress?.state)
      );

      // If specific retailers selected, filter to only those
      if (selectedRetailers.length > 0) {
        const retailerCodes = selectedRetailers.map((r) => r.value);
        retailersToFetch = retailersToFetch.filter((r) =>
          retailerCodes.includes(r.uniqueId)
        );
      }

      const allPassbookData = [];

      // Fetch passbook data for each retailer
      for (const retailer of retailersToFetch) {
        const response = await fetch(
          `https://deployed-site-o2d3.onrender.com/api/budgets/passbook?retailerId=${retailer._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            allPassbookData.push(...data.data);
          }
        }
      }

      // ✅ Get client's campaign IDs from the campaigns dropdown
      const clientCampaignIds = allCampaigns.map((c) => c._id);

      // Filter and flatten the data
      const campaignIds = selectedCampaigns.map((c) => c.value);

      const flattenedData = [];

      allPassbookData.forEach((budgetRecord) => {
        // Check if retailer's state matches
        if (!stateValues.includes(budgetRecord.state)) return;

        // Filter campaigns
        budgetRecord.campaigns.forEach((campaign) => {
          const campaignIdStr = campaign.campaignId._id || campaign.campaignId;

          // ✅ ONLY show campaigns that belong to this client
          if (!clientCampaignIds.includes(campaignIdStr)) return;

          // If specific campaigns are selected, filter to those
          if (
            selectedCampaigns.length === 0 ||
            campaignIds.includes(campaignIdStr)
          ) {
            flattenedData.push({
              outletCode: budgetRecord.outletCode,
              shopName: budgetRecord.shopName,
              state: budgetRecord.state,
              campaignName: campaign.campaignName,
              campaignId: campaignIdStr,
              tca: campaign.tca,
              cPaid: campaign.cPaid,
              cPending: campaign.cPending,
            });
          }
        });
      });

      setDisplayData(flattenedData);
    } catch (error) {
      console.error("Error fetching passbook:", error);
      toast.error("Failed to fetch passbook data", { theme: "dark" });
    }
  };

  // ===============================
  // FILTER LOGIC (Same as Admin)
  // ===============================
  useEffect(() => {
    if (
      selectedStates.length === 0 &&
      selectedCampaigns.length === 0 &&
      selectedRetailers.length === 0
    ) {
      setStateOptions(allStates.map((s) => ({ label: s, value: s })));
      setCampaignOptions(
        allCampaigns.map((c) => ({ label: c.name, value: c._id, data: c }))
      );
      setRetailerOptions(
        allRetailers.map((r) => ({
          label: `${r.uniqueId} - ${r.shopDetails?.shopName || "N/A"}`,
          value: r.uniqueId,
          data: r,
        }))
      );
      return;
    }

    applyFilters();
  }, [selectedStates, selectedCampaigns, selectedRetailers]);

  const applyFilters = () => {
    let filteredRetailers = [...allRetailers];
    let filteredCampaigns = [...allCampaigns];
    let filteredStates = [...allStates];

    if (selectedStates.length > 0) {
      const stateValues = selectedStates.map((s) => s.value);

      filteredRetailers = filteredRetailers.filter((r) =>
        stateValues.includes(r.shopDetails?.shopAddress?.state)
      );

      filteredCampaigns = filteredCampaigns.filter((c) => {
        if (Array.isArray(c.states)) {
          return c.states.some((state) => stateValues.includes(state));
        }
        return stateValues.includes(c.state);
      });
    }

    if (selectedCampaigns.length > 0) {
      const campaignIds = selectedCampaigns.map((c) => c.value);
      const campaignData = allCampaigns.filter((c) =>
        campaignIds.includes(c._id)
      );

      if (campaignData.length > 0) {
        const campaignStates = new Set();
        campaignData.forEach((c) => {
          const states = Array.isArray(c.states)
            ? c.states
            : c.state
            ? [c.state]
            : [];
          states.forEach((s) => campaignStates.add(s));
        });

        if (selectedStates.length === 0) {
          filteredStates = filteredStates.filter((s) =>
            campaignStates.has(s)
          );
        }

        filteredRetailers = filteredRetailers.filter((r) => {
          const inCampaignState = campaignStates.has(
            r.shopDetails?.shopAddress?.state
          );
          const assignedToCampaign =
            Array.isArray(r.assignedCampaigns) &&
            r.assignedCampaigns.some((ac) =>
              campaignIds.includes(typeof ac === "string" ? ac : ac._id)
            );
          return inCampaignState && assignedToCampaign;
        });
      }
    }

    if (selectedRetailers.length > 0) {
      const retailerCodes = selectedRetailers.map((r) => r.value);
      const retailerData = allRetailers.filter((r) =>
        retailerCodes.includes(r.uniqueId)
      );

      if (retailerData.length > 0) {
        const retailerStates = new Set(
          retailerData
            .map((r) => r.shopDetails?.shopAddress?.state)
            .filter(Boolean)
        );

        if (selectedStates.length === 0 && retailerStates.size > 0) {
          filteredStates = filteredStates.filter((s) =>
            retailerStates.has(s)
          );
        }

        if (selectedCampaigns.length === 0) {
          const retailerCampaignIds = new Set();
          retailerData.forEach((r) => {
            (r.assignedCampaigns || []).forEach((ac) =>
              retailerCampaignIds.add(typeof ac === "string" ? ac : ac._id)
            );
          });

          filteredCampaigns = filteredCampaigns.filter((c) =>
            retailerCampaignIds.has(c._id)
          );
        }
      }
    }

    setStateOptions(filteredStates.map((s) => ({ label: s, value: s })));
    setCampaignOptions(
      filteredCampaigns.map((c) => ({
        label: c.name,
        value: c._id,
        data: c,
      }))
    );
    setRetailerOptions(
      filteredRetailers.map((r) => ({
        label: `${r.uniqueId} - ${r.shopDetails?.shopName || "N/A"}`,
        value: r.uniqueId,
        data: r,
      }))
    );
  };

  // ===============================
  // HANDLE FILTER CHANGES
  // ===============================
  const handleStateChange = (selected) => {
    setSelectedStates(selected || []);
  };

  const handleCampaignChange = (selected) => {
    setSelectedCampaigns(selected || []);
  };

  const handleRetailerChange = (selected) => {
    setSelectedRetailers(selected || []);
  };

  const handleClearAllFilters = () => {
    setSelectedStates([]);
    setSelectedCampaigns([]);
    setSelectedRetailers([]);
    setDisplayData([]);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-[#171717] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#E4002B] mb-8">
            Client Passbook
          </h1>

          {loading ? (
            <div className="bg-[#EDEDED] rounded-lg shadow-md p-6">
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-[#EDEDED] rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  Filter Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* State Filter (Required) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <Select
                      isMulti
                      value={selectedStates}
                      onChange={handleStateChange}
                      options={stateOptions}
                      styles={customSelectStyles}
                      placeholder="Select States"
                      isSearchable
                    />
                  </div>

                  {/* Campaign Filter (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign (Optional)
                    </label>
                    <Select
                      isMulti
                      value={selectedCampaigns}
                      onChange={handleCampaignChange}
                      options={campaignOptions}
                      styles={customSelectStyles}
                      placeholder="All Campaigns"
                      isSearchable
                    />
                  </div>

                  {/* Retailer Filter (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retailer (Optional)
                    </label>
                    <Select
                      isMulti
                      value={selectedRetailers}
                      onChange={handleRetailerChange}
                      options={retailerOptions}
                      styles={customSelectStyles}
                      placeholder="All Retailers"
                      isSearchable
                    />
                  </div>
                </div>

                {(selectedStates.length > 0 ||
                  selectedCampaigns.length > 0 ||
                  selectedRetailers.length > 0) && (
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-4 text-sm text-red-600 underline hover:text-red-800"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Passbook Table */}
              {selectedStates.length > 0 ? (
                <div className="bg-[#EDEDED] rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Passbook Records ({displayData.length})
                  </h2>

                  {displayData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              S.No
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              State
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Outlet Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Campaign Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Total Amount (TCA)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Paid
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Pending
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {displayData.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{index + 1}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {record.state}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-700">
                                {record.shopName}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {record.campaignName}
                              </td>
                              <td className="px-4 py-2 text-sm font-semibold text-blue-600">
                                ₹{record.tca}
                              </td>
                              <td className="px-4 py-2 text-sm font-semibold text-green-600">
                                ₹{record.cPaid}
                              </td>
                              <td className="px-4 py-2 text-sm font-semibold text-yellow-600">
                                ₹{record.cPending}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4 text-center">
                      No records found for the selected filters.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <p className="font-semibold">Selection Required</p>
                  <p>
                    Please select at least one state to view passbook data.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientPassbook;
