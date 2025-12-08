import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

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

const Passbook = () => {
  const token = localStorage.getItem("client_token");

  const [campaigns, setCampaigns] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  const [loading, setLoading] = useState(false);

  // ===========================
  // 1️⃣ FETCH CAMPAIGNS FOR CLIENT
  // ===========================
  const fetchCampaigns = async () => {
    try {
      const res = await fetch(
        "https://srv1168036.hstgr.cloud/api/client/client/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load campaigns");
        return;
      }

      const formatted = data.campaigns.map((c) => ({
        value: c._id,
        label: c.name,
      }));

      setCampaigns(formatted);
    } catch (err) {
      toast.error("Server error loading campaigns");
    }
  };

  // ===========================
  // 2️⃣ FETCH PAYMENTS FOR CLIENT
  // ===========================
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://srv1168036.hstgr.cloud/api/client/client/payments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setPayments(data.payments || []);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch payments");
    }
  };

  // ===========================
  // LOAD DATA ON PAGE OPEN
  // ===========================
  useEffect(() => {
    fetchCampaigns();
    fetchPayments();
  }, []);

  // ===========================
  // EXTRACT OUTLETS (SHOP NAMES)
  // ===========================
  const outletOptions = [
    ...new Set(
      payments.map((p) => p.retailerShopName || p.retailerName)
    ),
  ].map((name) => ({ label: name, value: name }));

  // ===========================
  // FILTER BASED ON OUTLET + CAMPAIGN
  // ===========================
  const filteredPayments = payments.filter((p) => {
    const shopName = p.retailerShopName || p.retailerName;

    if (selectedOutlet && shopName !== selectedOutlet.value) return false;

    if (
      selectedCampaigns.length > 0 &&
      !selectedCampaigns.some((x) => x.value === p.campaignId)
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-[#E4002B]">Passbook</h2>

      {/* FILTERS */}
      <div className="bg-[#EDEDED] p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Campaign
            </label>
            <Select
              styles={customSelectStyles}
              options={campaigns}
              value={selectedCampaigns}
              onChange={setSelectedCampaigns}
              placeholder="Select or search campaigns"
              isSearchable
              isMulti
            />
          </div>

          {/* Outlet Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Outlet
            </label>
            <Select
              styles={customSelectStyles}
              options={outletOptions}
              value={selectedOutlet}
              onChange={setSelectedOutlet}
              placeholder="Select or search outlet"
              isSearchable
              isClearable
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-black rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#E4002B] text-white">
              <th className="border border-black px-3 py-2">Outlet (Shop Name)</th>
              <th className="border border-black px-3 py-2">Campaign</th>
              <th className="border border-black px-3 py-2">Payment Status</th>
              <th className="border border-black px-3 py-2">Total Amount</th>
              <th className="border border-black px-3 py-2">Paid</th>
              <th className="border border-black px-3 py-2">Remaining</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((p, i) => (
                <tr key={i} className="odd:bg-gray-100 even:bg-white">
                  <td className="border border-black px-3 py-2">
                    {p.retailerShopName || p.retailerName}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {p.campaignName}
                  </td>
                  <td className="border border-black px-3 py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : p.paymentStatus === "Partially Paid"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="border border-black px-3 py-2">
                    ₹{p.totalAmount}
                  </td>
                  <td className="border border-black px-3 py-2 text-green-600">
                    ₹{p.amountPaid}
                  </td>
                  <td className="border border-black px-3 py-2 text-red-600">
                    ₹{p.remainingAmount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Passbook;