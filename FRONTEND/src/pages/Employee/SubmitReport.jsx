import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { FiPlus, FiX } from "react-icons/fi";

const reportTypes = [
  { value: "window", label: "Window Display" },
  { value: "stock", label: "Stock" },
  { value: "others", label: "Others" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const visitTypeOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "unscheduled", label: "Unscheduled" },
];

const attendedOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const notVisitedReasons = [
  { value: "closed", label: "Outlet Closed" },
  { value: "retailerUnavailable", label: "Retailer Not Available" },
  { value: "others", label: "Others" },
];

const futureUseOptions = [
  { value: "future1", label: "Future Option 1" },
  { value: "future2", label: "Future Option 2" },
  { value: "future3", label: "Future Option 3" },
];

const stockTypeOptions = [
  { value: "opening", label: "Opening Stock" },
  { value: "closing", label: "Closing Stock" },
  { value: "purchase", label: "Purchase Stock" },
  { value: "sold", label: "Sold Stock" },
];

const brandOptions = [
  { value: "brand1", label: "Brand A" },
  { value: "brand2", label: "Brand B" },
  { value: "brand3", label: "Brand C" },
];

const productOptions = [
  { value: "product1", label: "Product X" },
  { value: "product2", label: "Product Y" },
  { value: "product3", label: "Product Z" },
];

const skuOptions = [
  { value: "sku1", label: "SKU 1" },
  { value: "sku2", label: "SKU 2" },
  { value: "sku3", label: "SKU 3" },
];

const productTypeOptions = [
  { value: "focus", label: "Focus" },
  { value: "all", label: "All" },
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#E4002B" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #E4002B" : "none",
    "&:hover": { borderColor: "#E4002B" },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#FEE2E2" : "white",
    color: "#333",
    "&:active": { backgroundColor: "#FECACA" },
  }),
  menu: (provided) => ({ ...provided, zIndex: 10 }),
};

const SubmitReport = ({ campaignId, retailerId }) => {
  const [visitType, setVisitType] = useState(null);
  const [attended, setAttended] = useState(null);
  const [notVisitedReason, setNotVisitedReason] = useState(null);
  const [otherReasonText, setOtherReasonText] = useState("");

  const [reportType, setReportType] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [future, setFuture] = useState(null);

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [files, setFiles] = useState([]);
  const [billCopy, setBillCopy] = useState(null);

  const [stockType, setStockType] = useState(null);
  const [brand, setBrand] = useState(null);
  const [product, setProduct] = useState(null);
  const [sku, setSku] = useState(null);
  const [productTypeField, setProductTypeField] = useState(null);
  const [quantity, setQuantity] = useState("");

  const [visitScheduleOptions, setVisitScheduleOptions] = useState([]);
  const [visitScheduleId, setVisitScheduleId] = useState(null);

  const [assignedRetailers, setAssignedRetailers] = useState([]);
  const [selectedUnscheduledRetailer, setSelectedUnscheduledRetailer] =
    useState(null);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const token = localStorage.getItem("token");

  /* GEOLOCATION */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      (err) => console.log("Location error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  /* FETCH SCHEDULES */
  useEffect(() => {
    if (visitType?.value !== "scheduled") return;

    axios
      .get(`https://srv1168036.hstgr.cloud/api/employee/schedules/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const options = res.data.schedules.map((sch) => ({
          value: sch._id,
          label: new Date(sch.visitDate).toLocaleDateString(),
          full: sch, // ⭐ full schedule for retailerId + campaignId
        }));
        setVisitScheduleOptions(options);
      })
      .catch(console.error);
  }, [visitType]);

  /* FETCH ASSIGNED RETAILERS */
  useEffect(() => {
    if (visitType?.value !== "unscheduled") return;

    axios
      .get(
        `https://srv1168036.hstgr.cloud/api/employee/assigned-retailers?campaignId=${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const list =
          res.data?.retailers || res.data?.campaigns?.[0]?.retailers || [];

        const mapped = list.map((r) => ({
          value: r.retailerId || r._id,
          label: r.name,
        }));

        setAssignedRetailers(mapped);
      })
      .catch(console.error);
  }, [visitType]);

  /* FILE HANDLERS */
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleBillCopy = (e) => setBillCopy(e.target.files[0]);
  const removeBill = () => setBillCopy(null);

  const isImage = (file) =>
    file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type);

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    /* ⭐ FIX 1 — Correct campaign ID */
    formData.append(
      "campaignId",
      visitType?.value === "scheduled"
        ? visitScheduleId?.full?.campaignId?._id
        : campaignId
    );

    /* ⭐ FIX 2 — Correct retailer ID */
    formData.append(
      "retailerId",
      visitType?.value === "scheduled"
        ? visitScheduleId?.full?.retailerId?._id
        : selectedUnscheduledRetailer?.value || ""
    );

    formData.append("visitType", visitType?.value || "");
    formData.append("attended", attended?.value?.toUpperCase() || "");
    formData.append("notVisitedReason", notVisitedReason?.value || "");
    formData.append("otherReasonText", otherReasonText);
    formData.append("reportType", reportType?.value || "");
    formData.append("frequency", frequency?.value || "");
    formData.append("fromDate", fromDate);
    formData.append("toDate", toDate);
    formData.append("extraField", future?.value || "");

    formData.append("visitScheduleId", visitScheduleId?.value || "");
    formData.append("stockType", stockType?.value || "");
    formData.append("brand", brand?.value || "");
    formData.append("product", product?.value || "");
    formData.append("sku", sku?.value || "");
    formData.append("productType", productTypeField?.value || "");
    formData.append("quantity", quantity || "");

    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    files.forEach((file) => formData.append("images", file));
    if (billCopy) formData.append("billCopy", billCopy);

    try {
      await axios.post(
        `https://srv1168036.hstgr.cloud/api/employee/reports/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Report submitted successfully!");
      setFiles([]);
      setBillCopy(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Report submission failed!");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-[#E4002B]">
        Submit Report
      </h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* TYPE OF VISIT */}
        <div>
          <label className="block font-medium mb-1">Type of Visit</label>
          <Select
            options={visitTypeOptions}
            value={visitType}
            onChange={(v) => {
              setVisitType(v);
              setAttended(null);
              setNotVisitedReason(null);
            }}
            styles={customSelectStyles}
            placeholder="Select type of visit"
          />
        </div>

        {/* UNSCHEDULED */}
        {visitType?.value === "unscheduled" && (
          <div>
            <label className="block font-medium mb-1">Select Retailer</label>
            <Select
              options={assignedRetailers}
              value={selectedUnscheduledRetailer}
              onChange={setSelectedUnscheduledRetailer}
              styles={customSelectStyles}
              placeholder="Select retailer"
            />
          </div>
        )}

        {/* SCHEDULED */}
        {visitType?.value === "scheduled" && (
          <div>
            <label className="block font-medium mb-1">
              Select Visit Schedule
            </label>
            <Select
              options={visitScheduleOptions}
              value={visitScheduleId}
              onChange={setVisitScheduleId}
              styles={customSelectStyles}
              placeholder="Select schedule"
            />
          </div>
        )}

        {/* ATTENDED */}
        {visitType && (
          <div>
            <label className="block font-medium mb-1">Attended Visit?</label>
            <Select
              options={attendedOptions}
              value={attended}
              onChange={(v) => {
                setAttended(v);
                setNotVisitedReason(null);
              }}
              styles={customSelectStyles}
              placeholder="Select"
            />
          </div>
        )}

        {/* NOT VISITED */}
        {attended?.value === "no" && (
          <div>
            <label className="block font-medium mb-1">Select Reason</label>
            <Select
              options={notVisitedReasons}
              value={notVisitedReason}
              onChange={setNotVisitedReason}
              styles={customSelectStyles}
              placeholder="Select reason"
            />

            {notVisitedReason?.value === "others" && (
              <input
                type="text"
                className="border rounded p-2 w-full mt-3"
                placeholder="Enter reason"
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
              />
            )}

            <button
              type="submit"
              className="mt-3 px-4 py-2 bg-[#E4002B] text-white rounded"
            >
              Submit
            </button>
          </div>
        )}

        {/* IF ATTENDED YES */}
        {attended?.value === "yes" && (
          <>
            <div>
              <label className="block font-medium mb-1">Type of Report</label>
              <Select
                styles={customSelectStyles}
                options={reportTypes}
                value={reportType}
                onChange={setReportType}
                placeholder="Select Report Type"
                isSearchable
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Frequency</label>
              <Select
                styles={customSelectStyles}
                options={frequencyOptions}
                value={frequency}
                onChange={(item) => {
                  setFrequency(item);
                  setShowCustomDate(item?.value === "custom");
                }}
                placeholder="Select Frequency"
                isSearchable
              />
            </div>

            {showCustomDate && (
              <div className="flex gap-4">
                <div>
                  <label className="font-medium mb-1 block">From *</label>
                  <input
                    type="date"
                    className="border rounded p-2"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-medium mb-1 block">To *</label>
                  <input
                    type="date"
                    className="border rounded p-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* EXTRA */}
            <div>
              <label className="block font-medium mb-1">Extra (Future)</label>
              <Select
                styles={customSelectStyles}
                options={futureUseOptions}
                value={future}
                onChange={setFuture}
                placeholder="Select future use"
                isSearchable
              />
            </div>

            {/* STOCK */}
            {reportType?.value === "stock" && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
                <Select
                  styles={customSelectStyles}
                  options={stockTypeOptions}
                  placeholder="Type of Stock"
                  value={stockType}
                  onChange={setStockType}
                />

                <Select
                  styles={customSelectStyles}
                  options={brandOptions}
                  placeholder="Brand"
                  value={brand}
                  onChange={setBrand}
                />

                <Select
                  styles={customSelectStyles}
                  options={productOptions}
                  placeholder="Product"
                  value={product}
                  onChange={setProduct}
                />

                <Select
                  styles={customSelectStyles}
                  options={skuOptions}
                  placeholder="SKU"
                  value={sku}
                  onChange={setSku}
                />

                <Select
                  styles={customSelectStyles}
                  options={productTypeOptions}
                  placeholder="Product Type"
                  value={productTypeField}
                  onChange={setProductTypeField}
                />

                <div>
                  <label className="font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    className="border rounded p-2 w-full"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Bill Copy</label>

                  {!billCopy ? (
                    <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
                    text-gray-500 cursor-pointer hover:border-[#E4002B]">
                      <FiPlus className="text-3xl text-gray-400" />
                      <span>Click or drop file here</span>
                      <input
                        type="file"
                        accept="image/*, application/pdf"
                        className="hidden"
                        onChange={handleBillCopy}
                      />
                    </label>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {isImage(billCopy) ? (
                        <img
                          src={URL.createObjectURL(billCopy)}
                          className="w-28 h-28 mx-auto rounded"
                          alt="preview"
                        />
                      ) : (
                        <p>{billCopy.name}</p>
                      )}
                      <button
                        type="button"
                        className="flex items-center gap-1 text-[#E4002B] mt-2"
                        onClick={removeBill}
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WINDOW DISPLAY */}
            {reportType?.value === "window" && (
              <div>
                <label className="block font-medium mb-1">
                  Upload Shop Display{" "}
                  <span className="text-[#E4002B]">
                    (Multiple Images can be uploaded)
                  </span>
                </label>

                <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
                text-gray-500 cursor-pointer hover:border-[#E4002B]">
                  <FiPlus className="text-3xl text-gray-400" />
                  <span>Click or drop files here to add more images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 group"
                      >
                        {isImage(file) ? (
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-32 object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <p className="text-xs text-center px-2 break-words">
                              {file.name}
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-[#E4002B] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={16} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                          {file.name.length > 15
                            ? file.name.substring(0, 12) + "..."
                            : file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    {files.length} image{files.length !== 1 ? "s" : ""} uploaded
                  </p>
                )}
              </div>
            )}

            {/* OTHERS */}
            {reportType?.value === "others" && (
              <div>
                <label className="block font-medium mb-1">Upload File</label>

                {files.length === 0 ? (
                  <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
                  text-gray-500 cursor-pointer hover:border-[#E4002B]">
                    <FiPlus className="text-3xl text-gray-400" />
                    <span>Click or drop file here</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {isImage(files[0]) ? (
                      <img
                        src={URL.createObjectURL(files[0])}
                        className="w-28 h-28 mx-auto rounded"
                        alt=""
                      />
                    ) : (
                      <p>{files[0].name}</p>
                    )}

                    <button
                      type="button"
                      className="flex items-center gap-1 text-[#E4002B] mt-2"
                      onClick={() => setFiles([])}
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="mt-3 px-4 py-2 bg-[#E4002B] text-white rounded"
            >
              Submit
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default SubmitReport;
