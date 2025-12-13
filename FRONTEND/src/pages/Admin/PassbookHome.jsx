import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PassbookHome = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [filteredRetailers, setFilteredRetailers] = useState([]);
    const [payments, setPayments] = useState([]);
    
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [retailerDetails, setRetailerDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch campaigns on component mount
    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Fetch active campaigns from API
    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "https://srv1168036.hstgr.cloud/api/admin/campaigns",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            const activeCampaigns = (data.campaigns || []).filter(
                (campaign) => campaign.isActive === true
            );

            setCampaigns(activeCampaigns);

        } catch (error) {
            console.error("Error fetching campaigns:", error);
            toast.error("Failed to fetch campaigns");
        }
    };

    // Fetch retailers and payments when campaign is selected
    const handleCampaignChange = async (campaignId) => {
        setSelectedCampaign(campaignId);
        setSelectedRetailer(""); // Reset retailer selection
        setRetailerDetails(null);
        setPayments([]); // Reset payments

        const campaign = campaigns.find(c => c._id === campaignId);
        if (campaign) {
            setCampaignDetails(campaign);
        } else {
            setCampaignDetails(null);
        }

        if (campaignId) {
            try {
                const token = localStorage.getItem("token");
                
                // Fetch retailers
                const retailerResponse = await fetch(
                    `https://srv1168036.hstgr.cloud/api/admin/campaign/${campaignId}/employee-retailer-mapping`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const retailerData = await retailerResponse.json();

                const retailerSet = new Set();
                const retailerArray = [];

                retailerData.employees.forEach(emp => {
                    if (emp.retailers && emp.retailers.length > 0) {
                        emp.retailers.forEach(retailer => {
                            if (!retailerSet.has(retailer._id)) {
                                retailerSet.add(retailer._id);
                                retailerArray.push(retailer);
                            }
                        });
                    }
                });

                const formattedRetailers = retailerArray.map(r => ({
                    _id: r._id,
                    displayName: `${r.shopDetails?.shopName || 'N/A'} • ${r.uniqueId || 'N/A'} • ${r.name || 'N/A'}`,
                    shopName: r.shopDetails?.shopName || '',
                    outletCode: r.uniqueId || '',
                    name: r.name || '',
                    fullData: r
                }));

                setFilteredRetailers(formattedRetailers);

                // Fetch all payments for this campaign
                await fetchPaymentsForCampaign(campaign.name, token);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch data");
            }
        } else {
            setFilteredRetailers([]);
        }
    };

    // Fetch payments for campaign (all retailers or specific retailer)
    const fetchPaymentsForCampaign = async (campaignName, token = null) => {
        setLoading(true);
        try {
            const authToken = token || localStorage.getItem("token");
            
            // Fetch all payments for the campaign
            const response = await fetch(
                `https://deployed-site-o2d3.onrender.com/api/payments/?campaign=${encodeURIComponent(campaignName)}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                setPayments(data.payments || data || []);
                
                if (!data || (Array.isArray(data) && data.length === 0) || (data.payments && data.payments.length === 0)) {
                    toast.info("No payment records found for this campaign");
                }
            } else {
                toast.error(data.message || "Failed to fetch payment records");
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to fetch payment records");
        } finally {
            setLoading(false);
        }
    };

    // Filter payments when retailer is selected
    const handleRetailerChange = async (retailerId) => {
        setSelectedRetailer(retailerId);

        if (!retailerId) {
            // If "All Retailers" is selected, fetch all payments for campaign
            if (selectedCampaign && campaignDetails) {
                await fetchPaymentsForCampaign(campaignDetails.name);
            }
            setRetailerDetails(null);
            return;
        }

        const retailer = filteredRetailers.find(r => r._id === retailerId);
        if (retailer) {
            setRetailerDetails(retailer);
        }

        // Filter payments by selected retailer
        if (retailerId && selectedCampaign && campaignDetails) {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                
                const response = await fetch(
                    `https://deployed-site-o2d3.onrender.com/api/payments/?retailer=${encodeURIComponent(retailer.name)}&campaign=${encodeURIComponent(campaignDetails.name)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                const data = await response.json();
                
                if (response.ok) {
                    setPayments(data.payments || data || []);
                    
                    if (!data || (Array.isArray(data) && data.length === 0) || (data.payments && data.payments.length === 0)) {
                        toast.info("No payment records found for this retailer");
                    }
                } else {
                    toast.error(data.message || "Failed to fetch payment records");
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
                toast.error("Failed to fetch payment records");
            } finally {
                setLoading(false);
            }
        }
    };

    // Format date for display (from dd/mm/yyyy to readable format)
    const formatDate = (dateString) => {
        if (dateString && dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format amount for display
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="max-w-4xl mx-auto bg-black p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-[#E4002B] mb-6">Passbook</h2>

            <div className="space-y-6">
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Select Campaign */}
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Select Campaign <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCampaign}
                            onChange={(e) => handleCampaignChange(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                        >
                            <option value="">-- Select Campaign --</option>
                            {campaigns.map((campaign) => (
                                <option key={campaign._id} value={campaign._id}>
                                    {campaign.name} • {campaign.client || 'N/A'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Retailer (Optional) */}
                    {selectedCampaign && (
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Filter by Retailer (Optional)
                            </label>
                            <select
                                value={selectedRetailer}
                                onChange={(e) => handleRetailerChange(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                            >
                                <option value="">All Retailers</option>
                                {filteredRetailers.map((retailer) => (
                                    <option key={retailer._id} value={retailer._id}>
                                        {retailer.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Loading payment records...</p>
                    </div>
                )}

                {/* Payment Table - Shows when campaign is selected */}
                {!loading && selectedCampaign && payments.length > 0 && (
                    <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Payment Records
                            {selectedRetailer && retailerDetails && (
                                <span className="text-gray-400 text-base font-normal ml-2">
                                    - {retailerDetails.name}
                                </span>
                            )}
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 border-b border-gray-700">
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            S.No
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            Retailer Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            Shop Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            Outlet Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            Date of Payment
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-semibold">
                                            UTR Number
                                        </th>
                                        <th className="px-4 py-3 text-right text-white font-semibold">
                                            Amount Paid
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <tr
                                            key={payment._id || index}
                                            className="border-b border-gray-700 hover:bg-gray-800 transition"
                                        >
                                            <td className="px-4 py-3 text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-white">
                                                {payment.retailer || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {payment.shopName || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {payment.outletCode || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {formatDate(payment.paymentDate || payment.dateOfPayment)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {payment.utrNumber}
                                            </td>
                                            <td className="px-4 py-3 text-right text-white font-medium">
                                                {formatAmount(payment.paymentAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-800 border-t-2 border-[#E4002B]">
                                        <td colSpan="6" className="px-4 py-3 text-right text-white font-bold">
                                            Total Amount:
                                        </td>
                                        <td className="px-4 py-3 text-right text-[#E4002B] font-bold text-lg">
                                            {formatAmount(
                                                payments.reduce((sum, payment) => 
                                                    sum + parseFloat(payment.paymentAmount), 0
                                                )
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Summary Card */}
                        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">
                                    Total Payments: <span className="text-white font-semibold">{payments.length}</span>
                                </span>
                                <span className="text-gray-400">
                                    Total Amount: <span className="text-[#E4002B] font-bold text-xl">
                                        {formatAmount(
                                            payments.reduce((sum, payment) => 
                                                sum + parseFloat(payment.paymentAmount), 0
                                            )
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* No payments found message */}
                {!loading && selectedCampaign && payments.length === 0 && (
                    <div className="text-center py-12 border-t border-gray-700">
                        <p className="text-gray-400 text-lg">
                            No payment records found for the selected campaign.
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!selectedCampaign && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            Please select a campaign to view payment records.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PassbookHome;
