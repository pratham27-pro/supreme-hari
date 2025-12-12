import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const EditPayment = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [filteredRetailers, setFilteredRetailers] = useState([]);
    const [payments, setPayments] = useState([]);
    
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [retailerDetails, setRetailerDetails] = useState(null);
    
    const [formData, setFormData] = useState({
        dateOfPayment: "",
        utrNumber: "",
        paymentAmount: "",
        remarks: ""
    });

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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
        setSelectedPayment(null); // Reset payment selection
        setRetailerDetails(null);
        setIsEditing(false);
        setPayments([]);
        setFormData({ dateOfPayment: "", utrNumber: "", paymentAmount: "", remarks: "" }); // Reset form

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
        setSelectedPayment(null);
        setIsEditing(false);
        setFormData({ dateOfPayment: "", utrNumber: "", paymentAmount: "", remarks: "" });

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
                
                // If there's payment data, auto-select the first one
                if (paymentList && paymentList.length > 0) {
                    loadPaymentData(paymentList[0]);
                } else {
                    toast.info("No payment records found for this retailer");
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
                toast.error("Failed to fetch payment records");
            }
        }
    };

    // Convert date from dd/mm/yyyy to yyyy-mm-dd for input[type="date"]
    const convertToInputDate = (dateString) => {
        if (!dateString) return "";
        
        console.log("Converting date:", dateString); // Debug log
        
        // If date is in dd/mm/yyyy format
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            
            const result = `${year}-${month}-${day}`;
            console.log("Converted to:", result); // Debug log
            return result;
        }
        
        // If already in yyyy-mm-dd format or ISO format
        if (dateString.includes('-')) {
            return dateString.split('T')[0]; // Handle ISO dates
        }
        
        return dateString;
    };

    // Convert date from yyyy-mm-dd to dd/mm/yyyy for API
    const convertToAPIDate = (dateString) => {
        if (!dateString) return "";
        
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Load payment data into form
    const loadPaymentData = (payment) => {
        console.log("Loading payment data:", payment); // Debug log
        
        setSelectedPayment(payment);
        
        const convertedDate = convertToInputDate(payment.paymentDate);
        console.log("Date being set to form:", convertedDate); // Debug log
        
        setFormData({
            dateOfPayment: convertedDate,
            utrNumber: payment.utrNumber || "",
            paymentAmount: payment.paymentAmount ? payment.paymentAmount.toString() : "",
            remarks: payment.remarks || ""
        });
        setIsEditing(true);
    };

    // Handle payment selection from dropdown
    const handlePaymentChange = (paymentId) => {
        if (!paymentId) {
            setSelectedPayment(null);
            setIsEditing(false);
            setFormData({ dateOfPayment: "", utrNumber: "", paymentAmount: "", remarks: "" });
            return;
        }
        
        const payment = payments.find(p => p._id === paymentId);
        if (payment) {
            loadPaymentData(payment);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!selectedCampaign) {
            toast.error("Please select a campaign");
            return;
        }
        if (!selectedRetailer) {
            toast.error("Please select a retailer");
            return;
        }
        if (!selectedPayment) {
            toast.error("No payment record selected");
            return;
        }
        if (!formData.dateOfPayment || !formData.utrNumber || !formData.paymentAmount) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const requestBody = {
                client: campaignDetails.client || 'N/A',
                retailer: retailerDetails?.name || 'N/A',
                campaign: campaignDetails.name || 'N/A',
                shopName: retailerDetails?.shopName || '',
                outletCode: retailerDetails?.outletCode || '',
                paymentAmount: parseFloat(formData.paymentAmount),
                utrNumber: formData.utrNumber.trim(),
                paymentDate: convertToAPIDate(formData.dateOfPayment),
                remarks: formData.remarks.trim() || ''
            };

            console.log("Updating payment:", requestBody);

            const response = await fetch(
                `https://deployed-site-o2d3.onrender.com/api/payments/${selectedPayment._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Payment updated successfully!");
                // Refresh payment data
                handleRetailerChange(selectedRetailer);
            } else {
                toast.error(data.message || "Failed to update payment");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            toast.error("An error occurred while updating payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-black p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-[#E4002B] mb-6">Edit Payment</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Campaign */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Select Campaign <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedCampaign}
                        onChange={(e) => handleCampaignChange(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                        required
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
                            required
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

                {/* Select Payment Record */}
                {selectedRetailer && payments.length > 0 && (
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Select Payment Record <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedPayment?._id || ""}
                            onChange={(e) => handlePaymentChange(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                            required
                        >
                            <option value="">-- Select Payment --</option>
                            {payments.map((payment, index) => (
                                <option key={payment._id} value={payment._id}>
                                    Payment #{index + 1} • {payment.paymentDate} • ₹{payment.paymentAmount} • UTR: {payment.utrNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Payment Form - Shows when payment data is loaded */}
                {isEditing && selectedPayment && (
                    <div className="space-y-4 border-t border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">
                                Edit Payment Details
                            </h3>
                            <span className="text-sm text-gray-400">
                                Payment ID: {selectedPayment._id}
                            </span>
                        </div>

                        {/* Date of Payment */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Date of Payment <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dateOfPayment"
                                value={formData.dateOfPayment}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                                required
                            />
                        </div>

                        {/* UTR Number */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                UTR Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="utrNumber"
                                value={formData.utrNumber}
                                onChange={handleInputChange}
                                placeholder="Enter UTR Number"
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                                required
                            />
                        </div>

                        {/* Payment Amount */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Payment Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="paymentAmount"
                                value={formData.paymentAmount}
                                onChange={handleInputChange}
                                placeholder="Enter Amount"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                                required
                            />
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Remarks (Optional)
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Enter any remarks"
                                rows="3"
                                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-[#E4002B]"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full px-6 py-3 bg-[#E4002B] text-white font-semibold rounded-lg hover:bg-red-600 transition ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? "Updating Payment..." : "Update Payment"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Show message when retailer is selected but no payments found */}
                {selectedRetailer && !isEditing && payments.length === 0 && (
                    <div className="text-center py-8 border-t border-gray-700">
                        <p className="text-gray-400">
                            No payment records found for the selected retailer.
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditPayment;
