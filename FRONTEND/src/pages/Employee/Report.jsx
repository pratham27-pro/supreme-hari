import React, { useState, useEffect } from "react";

const Report = ({ campaign }) => {
  const [range, setRange] = useState("today");
  const [customDates, setCustomDates] = useState({
    start: "",
    end: "",
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://srv1168036.hstgr.cloud/api/employee/reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []); // Fetch on component mount

  // Filter reports based on date range
  const filterReportsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      
      switch(range) {
        case "today":
          return reportDate >= today;
        
        case "last7days":
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 7);
          return reportDate >= last7Days;
        
        case "last30days":
          const last30Days = new Date(today);
          last30Days.setDate(last30Days.getDate() - 30);
          return reportDate >= last30Days;
        
        case "custom":
          if (customDates.start && customDates.end) {
            const startDate = new Date(customDates.start);
            const endDate = new Date(customDates.end);
            endDate.setHours(23, 59, 59, 999); // Include full end date
            return reportDate >= startDate && reportDate <= endDate;
          }
          return true;
        
        default:
          return true;
      }
    });
  };

  const handleDateChange = (e) => {
    setCustomDates({
      ...customDates,
      [e.target.name]: e.target.value
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const filteredReports = filterReportsByDate();

  return (
    <div className="p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">View Report</h1>

      {/* Date Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Date Range</label>
        
        {/* Dropdown */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded-md p-2 w-60"
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="custom">Custom</option>
        </select>

        {/* Custom Date Picker */}
        {range === "custom" && (
          <div className="flex gap-4 mt-4">
            <div>
              <label className="block text-sm mb-1">From</label>
              <input
                type="date"
                name="start"
                value={customDates.start}
                onChange={handleDateChange}
                className="border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <input
                type="date"
                name="end"
                value={customDates.end}
                onChange={handleDateChange}
                className="border rounded-md p-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-center py-4">Loading reports...</p>}
      {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Date</th>
                <th className="border p-3 text-left">Retailer</th>
                <th className="border p-3 text-left">Campaign</th>
                <th className="border p-3 text-left">Sales</th>
                <th className="border p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td className="border p-3">{formatDate(report.createdAt)}</td>
                    <td className="border p-3">{report.retailerId?.name || 'N/A'}</td>
                    <td className="border p-3">{report.campaignId?.name || 'N/A'}</td>
                    <td className="border p-3">{report.salesData?.quantity || 0}</td>
                    <td className="border p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border p-3 text-center text-gray-500">
                    No reports found for selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Report;
