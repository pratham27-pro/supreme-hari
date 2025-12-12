import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AddPayment = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [filteredRetailers, setFilteredRetailers] = useState([]);
    const [campaignDetails, setCampaignDetails] = useState(null);

    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedRetailer, setSelectedRetailer] = useState("");
    const [retailerDetails, setRetailerDetails] = useState(null);

    const [formData, setFormData] = useState({
        dateOfPayment: "",
        utrNumber: "",
        paymentAmount: "",
        remarks: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

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

    const handleCampaignChange = async (campaignId) => {
        setSelectedCampaign(campaignId);
        setSelectedRetailer("");
        setRetailerDetails(null);
        setFormData({ dateOfPayment: "", utrNumber: "", paymentAmount: "", remarks: "" });

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

    const handleRetailerChange = (retailerId) => {
        setSelectedRetailer(retailerId);

        const retailer = filteredRetailers.find(r => r._id === retailerId);
        if (retailer) {
            setRetailerDetails(retailer);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ FIXED: Convert date to dd/mm/yyyy format
    const convertToddMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCampaign) {
            toast.error("Please select a campaign");
            return;
        }
        if (!selectedRetailer) {
            toast.error("Please select a retailer");
            return;
        }
        if (!formData.dateOfPayment || !formData.utrNumber || !formData.paymentAmount) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            // Find the selected campaign
            const selectedCampaignData = campaigns.find(c => c._id === selectedCampaign);

            if (!selectedCampaignData) {
                toast.error("Campaign information not found");
                setLoading(false);
                return;
            }

            // ✅ FIXED: Convert date from YYYY-MM-DD (input format) to dd/mm/yyyy
            const formattedDate = convertToddMMYYYY(formData.dateOfPayment);

            // ✅ FIXED: Send strings (names) not IDs, matching your schema
            const requestBody = {
                client: selectedCampaignData.client || 'N/A', // String - client name
                retailer: retailerDetails?.name || 'N/A', // String - retailer name
                campaign: selectedCampaignData.name || 'N/A', // String - campaign name
                shopName: retailerDetails?.shopName || '',
                outletCode: retailerDetails?.outletCode || '',
                paymentAmount: parseFloat(formData.paymentAmount),
                utrNumber: formData.utrNumber.trim(),
                paymentDate: formattedDate, // dd/mm/yyyy format
                remarks: formData.remarks.trim() || ''
            };

            console.log("Sending payment data:", requestBody); // For debugging

            const response = await fetch(
                "https://deployed-site-o2d3.onrender.com/api/payments/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Payment added successfully!");
                // Reset form
                setSelectedCampaign("");
                setSelectedRetailer("");
                setRetailerDetails(null);
                setCampaignDetails(null);
                setFilteredRetailers([]);
                setFormData({
                    dateOfPayment: "",
                    utrNumber: "",
                    paymentAmount: "",
                    remarks: ""
                });
            } else {
                toast.error(data.message || "Failed to add payment");
            }
        } catch (error) {
            console.error("Error adding payment:", error);
            toast.error("An error occurred while adding payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-black p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-[#E4002B] mb-6">Add Payment</h2>

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

                {/* Payment Form */}
                {selectedCampaign && selectedRetailer && (
                    <div className="space-y-4 border-t border-gray-700 pt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Payment Details
                        </h3>

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
                                {loading ? "Adding Payment..." : "Add Payment"}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddPayment;
