import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const DeletePayment = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [filteredRetailers, setFilteredRetailers] = useState([]);
    const [payments, setPayments] = useState([]);
    
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [retailerDetails, setRetailerDetails] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

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

    // Fetch retailers when campaign is selected
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
                const response = await fetch(
                    `https://srv1168036.hstgr.cloud/api/admin/campaign/${campaignId}/employee-retailer-mapping`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const data = await response.json();

                const retailerSet = new Set();
                const retailerData = [];

                data.employees.forEach(emp => {
                    if (emp.retailers && emp.retailers.length > 0) {
                        emp.retailers.forEach(retailer => {
                            if (!retailerSet.has(retailer._id)) {
                                retailerSet.add(retailer._id);
                                retailerData.push(retailer);
                            }
                        });
                    }
                });

                const formattedRetailers = retailerData.map(r => ({
                    _id: r._id,
                    displayName: `${r.shopDetails?.shopName || 'N/A'} • ${r.uniqueId || 'N/A'} • ${r.name || 'N/A'}`,
                    shopName: r.shopDetails?.shopName || '',
                    outletCode: r.uniqueId || '',
                    name: r.name || '',
                    fullData: r
                }));

                setFilteredRetailers(formattedRetailers);

            } catch (error) {
                console.error("Error fetching retailers:", error);
                toast.error("Failed to fetch retailers");
            }
        } else {
            setFilteredRetailers([]);
        }
    };

    // Fetch payments when retailer is selected
    const handleRetailerChange = async (retailerId) => {
        setSelectedRetailer(retailerId);
        setPayments([]);

        const retailer = filteredRetailers.find(r => r._id === retailerId);
        if (retailer) {
            setRetailerDetails(retailer);
        }

        if (retailerId && selectedCampaign && campaignDetails) {
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
                
                const paymentList = data.payments || data || [];
                setPayments(paymentList);
                
                if (!paymentList || paymentList.length === 0) {
                    toast.info("No payment records found for this retailer");
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
                toast.error("Failed to fetch payment records");
            }
        }
    };

    // Open confirmation modal
    const handleDeleteClick = (payment) => {
        setPaymentToDelete(payment);
        setShowConfirmModal(true);
    };

    // Cancel delete
    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setPaymentToDelete(null);
    };

    // Confirm and delete payment
    const handleConfirmDelete = async () => {
        if (!paymentToDelete) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `https://deployed-site-o2d3.onrender.com/api/payments/${paymentToDelete._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Payment deleted successfully!");
                setShowConfirmModal(false);
                setPaymentToDelete(null);
                // Refresh payment list
                handleRetailerChange(selectedRetailer);
            } else {
                toast.error(data.message || "Failed to delete payment");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("An error occurred while deleting payment");
        } finally {
            setLoading(false);
        }
    };

    // Format date for display (from dd/mm/yyyy)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        
        // If date is in dd/mm/yyyy format
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
        
        // If already in ISO format
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
            <h2 className="text-3xl font-bold text-[#E4002B] mb-6">Delete Payment</h2>

            <div className="space-y-6">
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

                {/* Select Retailer */}
                {selectedCampaign && (
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Select Retailer <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedRetailer}
                            onChange={(e) => handleRetailerChange(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                        >
                            <option value="">-- Select Retailer --</option>
                            {filteredRetailers.map((retailer) => (
                                <option key={retailer._id} value={retailer._id}>
                                    {retailer.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Payment Records */}
                {selectedRetailer && payments.length > 0 && (
                    <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Payment Records
                            {retailerDetails && (
                                <span className="text-gray-400 text-base font-normal ml-2">
                                    - {retailerDetails.name}
                                </span>
                            )}
                        </h3>

                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-[#E4002B] transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Date of Payment */}
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">
                                                    Date of Payment
                                                </p>
                                                <p className="text-white font-medium">
                                                    {formatDate(payment.paymentDate)}
                                                </p>
                                            </div>

                                            {/* UTR Number */}
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">
                                                    UTR Number
                                                </p>
                                                <p className="text-white font-medium">
                                                    {payment.utrNumber}
                                                </p>
                                            </div>

                                            {/* Payment Amount */}
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">
                                                    Payment Amount
                                                </p>
                                                <p className="text-white font-medium text-lg">
                                                    {formatAmount(payment.paymentAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteClick(payment)}
                                            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                        >
                                            <FaTrash />
                                            Delete
                                        </button>
                                    </div>

                                    {/* Additional Payment Details */}
                                    <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-400 text-sm">Shop Name: </span>
                                            <span className="text-white text-sm">{payment.shopName || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-sm">Outlet Code: </span>
                                            <span className="text-white text-sm">{payment.outletCode || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Remarks if available */}
                                    {payment.remarks && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <p className="text-gray-400 text-sm mb-1">Remarks:</p>
                                            <p className="text-white text-sm">{payment.remarks}</p>
                                        </div>
                                    )}

                                    {/* Payment ID */}
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                        <p className="text-gray-500 text-xs">
                                            Payment ID: {payment._id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No payments found message */}
                {selectedRetailer && payments.length === 0 && (
                    <div className="text-center py-12 border-t border-gray-700">
                        <p className="text-gray-400 text-lg">
                            No payment records found for the selected retailer.
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!selectedCampaign && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            Please select a campaign and retailer to view payment records.
                        </p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && paymentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-red-500 rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-[#E4002B] mb-4">
                            Confirm Delete
                        </h3>
                        
                        <p className="text-white mb-6">
                            Are you sure you want to delete this payment record?
                        </p>

                        <div className="bg-gray-800 rounded-lg p-4 mb-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Date:</span>
                                <span className="text-white font-medium">
                                    {formatDate(paymentToDelete.paymentDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">UTR:</span>
                                <span className="text-white font-medium">
                                    {paymentToDelete.utrNumber}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Amount:</span>
                                <span className="text-white font-medium">
                                    {formatAmount(paymentToDelete.paymentAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Retailer:</span>
                                <span className="text-white font-medium">
                                    {paymentToDelete.retailer || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <p className="text-red-400 text-sm mb-6">
                            ⚠️ This action cannot be undone.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={loading}
                                className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeletePayment;
