import { useState, useEffect } from "react"
import { FaCheck, FaTimes } from "react-icons/fa"
import axios from "axios" // or use fetch

const RetailerCampaigns = ({ onView }) => {
  const [campaigns, setCampaigns] = useState([])
  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch campaigns and statuses from backend
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("retailer_token")
      const response = await axios.get("https://deployed-site-o2d3.onrender.com/api/retailer/campaigns", {
        headers: { Authorization: `Bearer ${token}` }
      })

      const { campaigns: fetchedCampaigns } = response.data
      
      // Transform data and extract statuses
      const transformedCampaigns = fetchedCampaigns.map(campaign => ({
        id: campaign._id,
        name: campaign.name || campaign.campaignName,
        startDate: formatDate(campaign.campaignStartDate || campaign.startDate),
        endDate: formatDate(campaign.campaignEndDate || campaign.endDate),
        description: campaign.description,
        // Find retailer's status for this campaign
        retailerStatus: findRetailerStatus(campaign, response.data.retailer?.uniqueId)
      }))

      setCampaigns(transformedCampaigns)
      
      // Set local status state from backend
      const initialStatus = {}
      fetchedCampaigns.forEach(campaign => {
        const retailerStatus = findRetailerStatus(campaign, response.data.retailer?.uniqueId)
        if (retailerStatus) {
          initialStatus[campaign._id] = retailerStatus
        }
      })
      setStatus(initialStatus)
      
    } catch (err) {
      console.error("Fetch campaigns error:", err)
      setError(err.response?.data?.message || "Failed to fetch campaigns")
    } finally {
      setLoading(false)
    }
  }

  // Update campaign status via API
  const updateCampaignStatus = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem("retailer_token")
      
      await axios.put(
        `https://deployed-site-o2d3.onrender.com/api/retailer/campaigns/${campaignId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local state optimistically
      setStatus(prev => ({ ...prev, [campaignId]: newStatus }))
      
    } catch (err) {
      console.error("Update status error:", err)
      alert(`Failed to ${newStatus} campaign: ${err.response?.data?.message}`)
      // Revert optimistic update on error
      fetchCampaigns()
    }
  }

  // Find retailer's status in campaign.assignedRetailers array
  const findRetailerStatus = (campaign, retailerUniqueId) => {
    if (!campaign.assignedRetailers?.length) return null
    
    const entry = campaign.assignedRetailers.find(
      r => r.retailerId?.uniqueId === retailerUniqueId || 
           r.retailerUniqueId === retailerUniqueId
    )
    return entry?.status
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-GB') // DD/MM/YYYY
    } catch {
      return "Invalid date"
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#E4002B]">My Campaigns</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={fetchCampaigns}
            className="ml-4 text-red-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {campaign.name}
              </h3>

              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Start:</span> {campaign.startDate}
              </p>

              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">End:</span> {campaign.endDate}
              </p>

              {/* STATUS MESSAGES */}
              {status[campaign.id] === "accepted" && (
                <div className="mb-3">
                  <p className="text-green-600 font-semibold flex items-center gap-2 text-sm mb-2">
                    <FaCheck className="text-sm" /> Campaign Accepted
                  </p>
                  
                  {/* EMPLOYEE LIST */}
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-700 mb-2 text-xs">Assigned Employees:</p>
                    <div className="text-xs text-gray-700 space-y-1 max-h-20 overflow-y-auto">
                      <p><span className="font-semibold">Rohit Sharma</span> — 9876543210</p>
                      <p><span className="font-semibold">Anjali Verma</span> — 9123456780</p>
                    </div>
                  </div>
                </div>
              )}

              {status[campaign.id] === "rejected" && (
                <p className="text-red-600 font-semibold flex items-center gap-2 text-sm mb-3">
                  <FaTimes className="text-sm" /> Campaign Rejected
                </p>
              )}

              {/* VIEW DETAILS - ONLY FOR ACCEPTED */}
              {status[campaign.id] === "accepted" && (
                <button
                  className="w-full bg-[#E4002B] text-white py-2 rounded-md hover:bg-[#C00026] transition font-medium text-sm mb-3"
                  onClick={() => onView?.(campaign)}
                >
                  View Details
                </button>
              )}

              {/* ACCEPT/REJECT BUTTONS - ONLY IF NO STATUS */}
              {!status[campaign.id] && (
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-1.5 rounded-md text-xs hover:bg-green-700 transition"
                    onClick={() => updateCampaignStatus(campaign.id, "accepted")}
                  >
                    <FaCheck /> Accept
                  </button>

                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-1.5 rounded-md text-xs hover:bg-red-700 transition"
                    onClick={() => updateCampaignStatus(campaign.id, "rejected")}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RetailerCampaigns
