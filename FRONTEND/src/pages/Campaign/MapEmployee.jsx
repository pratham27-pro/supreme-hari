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
    menu: (provided) => ({
        ...provided,
        zIndex: 20,
    }),
};

const MapEmployee = () => {
    // Campaign Selection
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    const [assignedRetailers, setAssignedRetailers] = useState([]);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [loadingAssignedData, setLoadingAssignedData] = useState(false);

    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Common Filters
    const [stateFilter, setStateFilter] = useState(null);

    // Separate Search for Retailer and Employee
    const [searchRetailer, setSearchRetailer] = useState("");
    const [searchEmployee, setSearchEmployee] = useState("");

    const [filteredRetailers, setFilteredRetailers] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // ✅ Fetch Campaigns
    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Fetch campaigns from backend
    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "https://supreme-419p.onrender.com/api/admin/campaigns",
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Error fetching campaigns", {
                    theme: "dark",
                });
                return;
            }

            // Filter Active Campaigns ONLY
            const activeCampaigns = (data.campaigns || []).filter(
                (c) => c.isActive === true
            );

            const campaignOptions = activeCampaigns.map((c) => ({
                value: c._id,
                label: c.name,
                data: c,
            }));

            setCampaigns(campaignOptions);
        } catch (err) {
            console.log("Campaign Fetch Error:", err);
            toast.error("Failed to load campaigns", { theme: "dark" });
        } finally {
            setLoadingCampaigns(false);
        }
    };

    const handleSelectRetailer = (retailerId) => {
        setSelectedRetailers(prev =>
            prev.includes(retailerId)
                ? prev.filter(id => id !== retailerId)
                : [...prev, retailerId]
        );
    };

    const handleSelectEmployee = (employeeId) => {
        setSelectedEmployee(employeeId);
    };

    // Filter Retailers
    useEffect(() => {
        if (!assignedRetailers.length) {
            setFilteredRetailers([]);
            return;
        }

        let filtered = [...assignedRetailers];

        if (stateFilter) {
            filtered = filtered.filter(
                r => r.shopDetails?.shopAddress?.state === stateFilter.value
            );
        }

        if (searchRetailer.trim() !== "") {
            const query = searchRetailer.toLowerCase();
            filtered = filtered.filter(
                r =>
                    r.uniqueId?.toLowerCase().includes(query) ||
                    r.shopDetails?.shopName?.toLowerCase().includes(query)
            );
        }

        setFilteredRetailers(filtered);
    }, [stateFilter, searchRetailer, assignedRetailers]);

    // Filter Employees
    useEffect(() => {
        if (!assignedEmployees.length) {
            setFilteredEmployees([]);
            return;
        }

        let filtered = [...assignedEmployees];

        if (stateFilter) {
            filtered = filtered.filter(
                e => e.correspondenceAddress?.state === stateFilter.value
            );
        }

        if (searchEmployee.trim() !== "") {
            const query = searchEmployee.toLowerCase();
            filtered = filtered.filter(
                e =>
                    e.employeeId?.toLowerCase().includes(query) ||
                    e.name?.toLowerCase().includes(query)
            );
        }

        setFilteredEmployees(filtered);
    }, [stateFilter, searchEmployee, assignedEmployees]);

    const handleCampaignChange = async (selected) => {
        setSelectedCampaign(selected);

        if (!selected) {
            setAssignedRetailers([]);
            setFilteredRetailers([]);
            setSelectedRetailers([]);
            setAssignedEmployees([]);
            setFilteredEmployees([]);
            setSelectedEmployee(null);
            setStateFilter(null);
            setSearchRetailer("");
            setSearchEmployee("");
            return;
        }

        setLoadingAssignedData(true);
        setAssignedRetailers([]);
        setFilteredRetailers([]);
        setSelectedRetailers([]);
        setAssignedEmployees([]);
        setFilteredEmployees([]);
        setSelectedEmployee(null);
        setStateFilter(null);
        setSearchRetailer("");
        setSearchEmployee("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://supreme-419p.onrender.com/api/admin/campaign/${selected.value}/retailers-with-employees`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Error loading campaign data", { theme: "dark" });
                return;
            }

            // 💡 Set initial retailer/employee data properly
            const retailers = data.retailers || [];
            const employees = data.employees || [];
            setAssignedRetailers(retailers);
            setFilteredRetailers(retailers);
            setAssignedEmployees(employees);
            setFilteredEmployees(employees);

        } catch (err) {
            toast.error("Server error. Try again.", { theme: "dark" });
        } finally {
            setLoadingAssignedData(false);
        }
    };

    const handleAssignEmployee = async () => {
        if (!selectedEmployee) {
            toast.error("Please select an employee", { theme: "dark" });
            return;
        }
        if (selectedRetailers.length === 0) {
            toast.error("Please select at least one retailer", { theme: "dark" });
            return;
        }

        if (!window.confirm(
            `Assign selected ${selectedRetailers.length} retailers to this employee?`
        )) return;

        const token = localStorage.getItem("token");

        for (const retailerId of selectedRetailers) {
            try {
                const res = await fetch(
                    "https://supreme-419p.onrender.com/api/admin/campaign/assign-employee-to-retailer",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            campaignId: selectedCampaign.value,
                            retailerId,
                            employeeId: selectedEmployee,
                        }),
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    toast.warn(data.message || "Assignment failed", {
                        theme: "dark",
                    });
                } else {
                    toast.success("Assigned Successfully!", { theme: "dark" });

                    // Update table UI: Change status to "assigned"
                    setAssignedRetailers((prev) =>
                        prev.map((r) =>
                            r._id === retailerId ? { ...r, status: "assigned" } : r
                        )
                    );
                }
            } catch (err) {
                console.error("Assign error:", err);
                toast.error("Server error", { theme: "dark" });
            }
        }

        // Clear selection after assignment
        setSelectedRetailers([]);
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        Map Employee to Retailer
                    </h1>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">
                            Select Campaign *
                        </h2>
                        <Select
                            value={selectedCampaign}
                            onChange={handleCampaignChange}
                            options={campaigns}
                            isLoading={loadingCampaigns}
                            styles={customSelectStyles}
                            placeholder="Choose a campaign"
                            isSearchable
                            isClearable
                            className="max-w-md"
                        />
                        {selectedCampaign && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                                <p>
                                    <strong>Client:</strong> {selectedCampaign.data.client}
                                </p>
                                <p>
                                    <strong>Type:</strong> {selectedCampaign.data.type}
                                </p>
                                <p>
                                    <strong>Region(s):</strong>{" "}
                                    {Array.isArray(selectedCampaign.data.regions)
                                        ? selectedCampaign.data.regions.join(", ")
                                        : selectedCampaign.data.region || "N/A"}
                                </p>
                                <p>
                                    <strong>State(s):</strong>{" "}
                                    {Array.isArray(selectedCampaign.data.states)
                                        ? selectedCampaign.data.states.join(", ")
                                        : selectedCampaign.data.state || "N/A"}
                                </p>
                            </div>
                        )}
                    </div>

                    {selectedCampaign && (
                        <>
                            {/* Common State Filter */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                                    Common Filter
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* 🏙️ State Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                        <Select
                                            value={stateFilter}
                                            onChange={setStateFilter}
                                            options={[...new Set([
                                                ...assignedRetailers.map(r => r?.shopDetails?.shopAddress?.state),
                                                ...assignedEmployees.map(e => e?.correspondenceAddress?.state)
                                            ])]
                                                .filter(Boolean)
                                                .map(s => ({ label: s, value: s }))
                                            }
                                            styles={customSelectStyles}
                                            placeholder="Select State"
                                            isClearable
                                        />
                                    </div>
                                </div>

                                {/* Clear Filter Button */}
                                {stateFilter && (
                                    <button
                                        onClick={() => setStateFilter(null)}
                                        className="mt-4 text-sm text-red-600 underline hover:text-red-800"
                                    >
                                        Clear State Filter
                                    </button>
                                )}
                            </div>

                            {/* Retailer Table */}
                            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Select Retailers ({filteredRetailers.length} of {assignedRetailers.length})
                                </h3>

                                {/* Retailer Search Bar */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by Outlet Code or Outlet Name"
                                        value={searchRetailer}
                                        onChange={(e) => setSearchRetailer(e.target.value)}
                                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                                    />
                                    {searchRetailer && (
                                        <button
                                            onClick={() => setSearchRetailer("")}
                                            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>

                                {loadingAssignedData ? (
                                    <p className="text-gray-500 py-3">Loading...</p>
                                ) : assignedRetailers.length === 0 ? (
                                    <p className="text-gray-500 py-3">No retailers assigned yet.</p>
                                ) : filteredRetailers.length === 0 ? (
                                    <p className="text-gray-500 py-3">No retailers match your filters.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Select</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">S.No</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Outlet Code</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Outlet Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Business Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">State</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredRetailers.map((r, i) => (
                                                    <tr key={r._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="checkbox"
                                                                disabled={r.status?.toLowerCase() === "assigned"}
                                                                checked={selectedRetailers.includes(r._id)}
                                                                onChange={() => handleSelectRetailer(r._id)}
                                                                className={`w-4 h-4 cursor-pointer ${r.status?.toLowerCase() === "assigned"
                                                                        ? "cursor-not-allowed opacity-50"
                                                                        : ""
                                                                    }`}
                                                            />
                                                        </td>

                                                        <td className="px-4 py-2 text-sm">{i + 1}</td>

                                                        <td className="px-4 py-2 text-sm font-medium text-gray-700">
                                                            {r.uniqueId || "-"}
                                                        </td>

                                                        <td className="px-4 py-2 text-sm font-medium text-gray-700">
                                                            {r.shopDetails?.shopName || "-"}
                                                        </td>

                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {r.shopDetails?.businessType || "-"}
                                                        </td>

                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {r.shopDetails?.shopAddress?.state || "-"}
                                                        </td>

                                                        <td
                                                            className={`px-4 py-2 uppercase text-xs font-bold ${r.status?.toLowerCase() === "pending"
                                                                ? "text-yellow-600"
                                                                : r.status?.toLowerCase() === "assigned"
                                                                    ? "text-green-600"
                                                                    : "text-blue-600"
                                                                }`}
                                                        >
                                                            {r.status}
                                                        </td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Employee Table */}
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Select Employee ({filteredEmployees.length} of {assignedEmployees.length})
                                </h3>

                                {/* Employee Search Bar */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by Employee Code or Employee Name"
                                        value={searchEmployee}
                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                                    />
                                    {searchEmployee && (
                                        <button
                                            onClick={() => setSearchEmployee("")}
                                            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>

                                {loadingAssignedData ? (
                                    <p className="text-gray-500 py-3">Loading...</p>
                                ) : assignedEmployees.length === 0 ? (
                                    <p className="text-gray-500 py-3">No employees assigned yet.</p>
                                ) : filteredEmployees.length === 0 ? (
                                    <p className="text-gray-500 py-3">No employees match your filters.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Code</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredEmployees.map((e, i) => (
                                                    <tr key={e._id || i} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="radio"
                                                                name="employeeSelection"
                                                                checked={selectedEmployee === e._id}
                                                                onChange={() => handleSelectEmployee(e._id)}
                                                                className="w-4 h-4 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-sm">{i + 1}</td>
                                                        <td className="px-4 py-2 text-sm font-medium text-gray-700">{e.employeeId || "-"}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700">{e.name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">{e.email}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">{e.phone}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">{e.correspondenceAddress?.state || "-"}</td>
                                                        <td className="px-4 py-2 uppercase text-xs font-bold text-blue-600">{e.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="text-right mt-6">
                                <button
                                    onClick={handleAssignEmployee}
                                    disabled={!selectedEmployee || selectedRetailers.length === 0}
                                    className={`px-6 py-3 rounded-lg font-semibold text-white transition
            ${!selectedEmployee || selectedRetailers.length === 0
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    Assign Employee
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MapEmployee;