import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { FaFileDownload, FaFilter, FaSpinner } from "react-icons/fa";

const DetailedReport = () => {
    // State variables
    const [reportData, setReportData] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const regionStates = {
        North: [
            "Jammu and Kashmir",
            "Ladakh",
            "Himachal Pradesh",
            "Punjab",
            "Haryana",
            "Uttarakhand",
            "Uttar Pradesh",
            "Delhi",
            "Chandigarh",
        ],
        South: [
            "Andhra Pradesh",
            "Karnataka",
            "Kerala",
            "Tamil Nadu",
            "Telangana",
            "Puducherry",
            "Lakshadweep",
        ],
        East: [
            "Bihar",
            "Jharkhand",
            "Odisha",
            "West Bengal",
            "Sikkim",
            "Andaman and Nicobar Islands",
            "Arunachal Pradesh",
            "Assam",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Tripura",
        ],
        West: [
            "Rajasthan",
            "Gujarat",
            "Maharashtra",
            "Madhya Pradesh",
            "Goa",
            "Chhattisgarh",
            "Dadra and Nagar Haveli and Daman and Diu",
        ],
    };

    const dateOptions = [
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
        { value: "thisMonth", label: "This Month" },
        { value: "lastMonth", label: "Last Month" },
        { value: "custom", label: "Custom Range" },
    ];

    const statusOptions = [
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "cancelled", label: "Cancelled" },
    ];

    // Filter state variables
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Generate campaign options from actual data
    const campaignOptions = useMemo(() => {
        return campaigns.map(c => ({
            value: c._id,
            label: c.name
        }));
    }, [campaigns]);

    // Generate region options from actual campaigns
    const regionOptions = useMemo(() => {
        const uniqueRegions = new Set();
        campaigns.forEach(c => {
            c.regions?.forEach(r => uniqueRegions.add(r));
        });
        return Array.from(uniqueRegions).map(r => ({
            value: r.toLowerCase(),
            label: r
        }));
    }, [campaigns]);

    // Generate state options from actual campaigns
    const allocatedStates = useMemo(() => {
        const uniqueStates = new Set();
        campaigns.forEach(c => {
            c.states?.forEach(s => uniqueStates.add(s));
        });
        return Array.from(uniqueStates);
    }, [campaigns]);

    const getStateOptions = () => {
        if (selectedRegions.length === 0) {
            return allocatedStates.map(state => ({
                value: state.toLowerCase().replace(/\s+/g, '-'),
                label: state
            }));
        }

        const filteredStates = selectedRegions.flatMap(region => {
            const regionKey = region.label;
            return regionStates[regionKey] || [];
        });

        const validStates = filteredStates.filter(state => 
            allocatedStates.includes(state)
        );

        return validStates.map(state => ({
            value: state.toLowerCase().replace(/\s+/g, '-'),
            label: state
        }));
    };

    const stateOptions = getStateOptions();

    // Handle region change
    const handleRegionChange = (selected) => {
        setSelectedRegions(selected);
        if (selected.length > 0) {
            const validStateLabels = selected.flatMap(
                (region) => regionStates[region.label] || []
            );
            const filteredStates = selectedStates.filter((state) =>
                validStateLabels.some(
                    (validState) =>
                        validState.toLowerCase().replace(/\s+/g, "-") === state.value
                ) && allocatedStates.includes(state.label)
            );
            setSelectedStates(filteredStates);
        }
    };

    // Handle date change
    const handleDateChange = (selected) => {
        setSelectedDateRange(selected);
        if (selected?.value === "custom") {
            setShowCustomDate(true);
        } else {
            setShowCustomDate(false);
            setFromDate("");
            setToDate("");
        }
    };

    // Fetch campaigns and reports
    useEffect(() => {
        fetchCampaignsAndReports();
    }, []);

    const fetchCampaignsAndReports = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch campaigns first to populate dropdowns
            const campaignResponse = await fetch('https://supreme-419p.onrender.com/api/client/client/campaigns', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('client_token')}`
                }
            });

            if (!campaignResponse.ok) {
                throw new Error('Failed to fetch campaigns');
            }

            const campaignData = await campaignResponse.json();
            setCampaigns(campaignData.campaigns || []);

            // Fetch reports
            await fetchReports();

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query params based on filters
            const params = new URLSearchParams();
            
            if (selectedCampaigns.length > 0) {
                params.append('campaignId', selectedCampaigns[0].value);
            }
            
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);

            const response = await fetch(`https://supreme-419p.onrender.com/api/client/client/reports`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('client_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            const data = await response.json();
            setReportData(data.reports || []);

        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    const applyFilters = () => {
        fetchReports();
    };

    // Custom styling with red theme
    const reportStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#E4002B" : "#d1d5db",
            boxShadow: state.isFocused ? "0 0 0 1px #E4002B" : "none",
            "&:hover": { borderColor: "#E4002B" },
            borderRadius: "8px",
            minHeight: "42px",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#FEE2E2" : "white",
            color: "#333",
            "&:active": { backgroundColor: "#FECACA" },
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "#FEE2E2",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#E4002B",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#E4002B",
            ":hover": {
                backgroundColor: "#E4002B",
                color: "white",
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 20,
        }),
    };

    // Handle export
    const handleExport = () => {
        // Convert reportData to CSV
        const headers = [
            'S.No', 'Employee Name', 'Employee ID', 'Retailer Name', 
            'Campaign', 'Visit Date', 'Visit Type', 'Status', 'Created At', 'Remarks'
        ];
        
        const csvData = reportData.map((item, index) => [
            index + 1,
            item.employeeId?.name || '-',
            item.employeeId?.employeeId || '-',
            item.retailerId?.name || '-',
            item.campaignId?.name || '-',
            item.visitScheduleId?.visitDate ? new Date(item.visitScheduleId.visitDate).toLocaleDateString() : '-',
            item.visitScheduleId?.visitType || '-',
            item.visitScheduleId?.status || '-',
            new Date(item.createdAt).toLocaleString(),
            item.remarks || '-'
        ]);

        const csv = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employee_reports_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6">
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-4xl text-[#E4002B]" />
                    <span className="ml-3 text-lg text-gray-600">Loading reports...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-[#E4002B]">Detailed Report</h2>
                        <button
                            onClick={handleExport}
                            disabled={reportData.length === 0}
                            className="bg-[#E4002B] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#C3002B] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaFileDownload />
                            Export Report
                        </button>
                    </div>

                    {/* FILTERS */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-[#E4002B]" />
                            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Campaign Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                    Campaign
                                </label>
                                <Select
                                    options={campaignOptions}
                                    value={selectedCampaigns}
                                    onChange={setSelectedCampaigns}
                                    placeholder="Select Campaign"
                                    isSearchable
                                    isMulti
                                    styles={reportStyles}
                                />
                            </div>

                            {/* Region Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                    Region
                                </label>
                                <Select
                                    options={regionOptions}
                                    value={selectedRegions}
                                    onChange={handleRegionChange}
                                    placeholder="Select Region"
                                    isSearchable
                                    isMulti
                                    styles={reportStyles}
                                />
                            </div>

                            {/* State Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                    State
                                </label>
                                <Select
                                    options={stateOptions}
                                    value={selectedStates}
                                    onChange={setSelectedStates}
                                    placeholder="Select State"
                                    isSearchable
                                    isMulti
                                    styles={reportStyles}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Status Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                    Visit Status
                                </label>
                                <Select
                                    options={statusOptions}
                                    value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    placeholder="Select Status"
                                    isSearchable
                                    styles={reportStyles}
                                />
                            </div>

                            {/* Date Dropdown */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                    Date Range
                                </label>
                                <Select
                                    options={dateOptions}
                                    value={selectedDateRange}
                                    onChange={handleDateChange}
                                    placeholder="Select Date"
                                    isSearchable
                                    styles={reportStyles}
                                />
                            </div>
                        </div>

                        {/* Custom Date Range */}
                        {showCustomDate && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:ring-1 focus:ring-[#E4002B] focus:border-[#E4002B] focus:outline-none transition-colors"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        className="border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:ring-1 focus:ring-[#E4002B] focus:border-[#E4002B] focus:outline-none transition-colors"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Apply Filters Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={applyFilters}
                                className="bg-[#E4002B] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#C3002B] transition-colors flex items-center gap-2"
                            >
                                <FaFilter />
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* REPORT TABLE */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#E4002B] text-white">
                                        <th className="px-4 py-3 text-left font-semibold">S.No</th>
                                        <th className="px-4 py-3 text-left font-semibold">Employee Name</th>
                                        <th className="px-4 py-3 text-left font-semibold">Employee ID</th>
                                        <th className="px-4 py-3 text-left font-semibold">Retailer Name</th>
                                        <th className="px-4 py-3 text-left font-semibold">Contact</th>
                                        <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                                        <th className="px-4 py-3 text-left font-semibold">Visit Date</th>
                                        <th className="px-4 py-3 text-left font-semibold">Visit Type</th>
                                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold">Created At</th>
                                        <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.employeeId?.name || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                                    {item.employeeId?.employeeId || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{item.retailerId?.name || '-'}</td>
                                            <td className="px-4 py-3">{item.retailerId?.contactNo || '-'}</td>
                                            <td className="px-4 py-3">{item.campaignId?.name || '-'}</td>
                                            <td className="px-4 py-3">
                                                {item.visitScheduleId?.visitDate 
                                                    ? new Date(item.visitScheduleId.visitDate).toLocaleDateString('en-IN')
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {item.visitScheduleId?.visitType || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.visitScheduleId?.status === "completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.visitScheduleId?.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : item.visitScheduleId?.status === "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {item.visitScheduleId?.status || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {new Date(item.createdAt).toLocaleString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <div className="truncate" title={item.remarks}>
                                                    {item.remarks || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {reportData.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500">
                                No reports available. Try adjusting your filters.
                            </div>
                        )}
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                            <p className="text-2xl font-bold text-[#E4002B]">{reportData.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <p className="text-gray-600 text-sm mb-1">Completed Visits</p>
                            <p className="text-2xl font-bold text-green-600">
                                {reportData.filter((r) => r.visitScheduleId?.status === "completed").length}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <p className="text-gray-600 text-sm mb-1">Pending Visits</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {reportData.filter((r) => r.visitScheduleId?.status === "pending").length}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DetailedReport;