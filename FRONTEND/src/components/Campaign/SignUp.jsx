import React, { useState } from "react";
import {
    FaEnvelope,
    FaLock,
    FaUser,
    FaPhoneAlt,
    FaBuilding,
} from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);

    // States for State dropdown
    const [stateSearch, setStateSearch] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [showStateList, setShowStateList] = useState(false);

    // States for Type of Campaign dropdown
    const [campaignSearch, setCampaignSearch] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [showCampaignList, setShowCampaignList] = useState(false);

    // States for Region dropdown
    const [regionSearch, setRegionSearch] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [showRegionList, setShowRegionList] = useState(false);

    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
        "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const campaignTypes = [
        "Retailer Enrolment",
        "Display Payment",
        "Incentive Payment",
        "Others"
    ];

    const regions = ["North", "East", "West", "South", "All"];

    const filteredStates = states.filter((state) =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const filteredCampaigns = campaignTypes.filter((campaign) =>
        campaign.toLowerCase().includes(campaignSearch.toLowerCase())
    );

    const filteredRegions = regions.filter((region) =>
        region.toLowerCase().includes(regionSearch.toLowerCase())
    );

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white shadow-md px-6 md:px-10">
                <div className="flex justify-between items-center py-4 max-w-screen-xl mx-auto">
                    <img src="cpLogo.png" alt="Logo" className="h-14 cursor-pointer" />
                    <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-bold text-[#E4002B]">
                        Campaign Registration Page
                    </h2>
                </div>
            </nav>

            {/* Form Container */}
            <div className="min-h-screen flex justify-center items-center bg-white px-4 pt-28 pb-10">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold">Create an Account</h1>
                        <p className="text-gray-600 mt-2">
                            Join us and start your journey today.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5">
                        {/* Campaign Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Campaign Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Type campaign name here"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Client */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Client</label>
                            <div className="relative">
                                <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Client Name"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Type of Campaign (Searchable) */}
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">Type of Campaign</label>
                            <input
                                type="text"
                                placeholder="Search or select type"
                                value={selectedCampaign || campaignSearch}
                                onChange={(e) => {
                                    setCampaignSearch(e.target.value);
                                    setSelectedCampaign("");
                                    setShowCampaignList(true);
                                }}
                                onFocus={() => setShowCampaignList(true)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                            />
                            {showCampaignList && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto mt-1">
                                    {filteredCampaigns.length > 0 ? (
                                        filteredCampaigns.map((campaign, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    setSelectedCampaign(campaign);
                                                    setShowCampaignList(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {campaign}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500">No match found</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Region (Searchable) */}
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">Region</label>
                            <input
                                type="text"
                                placeholder="Search or select region"
                                value={selectedRegion || regionSearch}
                                onChange={(e) => {
                                    setRegionSearch(e.target.value);
                                    setSelectedRegion("");
                                    setShowRegionList(true);
                                }}
                                onFocus={() => setShowRegionList(true)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                            />
                            {showRegionList && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto mt-1">
                                    {filteredRegions.length > 0 ? (
                                        filteredRegions.map((region, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    setSelectedRegion(region);
                                                    setShowRegionList(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {region}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500">No match found</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* State (Searchable) */}
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input
                                type="text"
                                placeholder="Search or select state"
                                value={selectedState || stateSearch}
                                onChange={(e) => {
                                    setStateSearch(e.target.value);
                                    setSelectedState("");
                                    setShowStateList(true);
                                }}
                                onFocus={() => setShowStateList(true)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                            />
                            {showStateList && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto mt-1">
                                    {filteredStates.length > 0 ? (
                                        filteredStates.map((state, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    setSelectedState(state);
                                                    setShowStateList(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {state}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500">No match found</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 8 characters"
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B]"
                                    required
                                />
                                <div
                                    className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#E4002B] text-white py-2 rounded-lg font-medium hover:bg-[#C3002B] transition"
                        >
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignUp;
