"use client";
import { useState, useRef, useEffect } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPhoneAlt,
  FaBuilding,
  FaCalendarAlt,
  FaPlus,
  FaFileAlt,
  FaTrash,
  FaSortNumericDownAlt,
  FaUniversity,
  FaIdCard,
  FaTimes,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const API_URL = "https://deployed-site-o2d3.onrender.com/api";

/* ========================================
   SEARCHABLE SELECT COMPONENT
======================================== */
const SearchableSelect = ({ label, placeholder, options, value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
      <div
        className={`w-full border border-gray-300 rounded-lg ${disabled ? "bg-gray-100" : "bg-white"
          }`}
        onClick={() => !disabled && setOpen(true)}
      >
        <div className="flex items-center px-3 py-2">
          <input
            className="flex-1 outline-none bg-transparent text-sm disabled:cursor-not-allowed"
            placeholder={value || placeholder}
            value={open ? search : value}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            disabled={disabled}
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearch("");
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>
      {open && !disabled && (
        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto mt-1">
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => {
                  onChange(opt);
                  setSearch("");
                  setOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 text-sm">No match found</li>
          )}
        </ul>
      )}
    </div>
  );
};

/* ========================================
   FILE INPUT COMPONENT (MATCHING SAMPLE UI)
======================================== */
const FileInput = ({ label, accept = "*", file, setFile, required = false, existingImageUrl = null }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(existingImageUrl || null);

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  useEffect(() => {
    if (existingImageUrl) {
      setPreview(existingImageUrl);
    }
  }, [existingImageUrl]);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreview(existingImageUrl);
      return;
    }
    const newPreview = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    setFile({ raw: f, preview: newPreview, name: f.name });
    setPreview(newPreview);
  }

  const hasFile = file || existingImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <div
        className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#E4002B] transition"
        onClick={() => fileRef.current?.click()}
      >
        {!hasFile ? (
          <>
            <FaPlus className="text-2xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click or drop file here</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-20 h-16 object-cover rounded-md border"
              />
            ) : (
              <p className="text-sm text-gray-700">{file?.name || "Existing file"}</p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="flex items-center gap-1 text-red-500 text-xs hover:underline"
            >
              <FaTimes /> Remove
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};


/* ========================================
   ICON INPUT COMPONENT
======================================== */
const IconInput = ({ icon: Icon, label, placeholder, type = "text", value, onChange, disabled = false, ...rest }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B] text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        {...rest}
      />
    </div>
  </div>
);

/* ========================================
   MAIN PROFILE COMPONENT
======================================== */
const Profile = () => {
  // Loading and submission
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error

  // ✅ NEW: Image fetching states
  const [documentStatus, setDocumentStatus] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);

  // Prefilled from backend (READ-ONLY)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [workerType, setWorkerType] = useState("Permanent");

  // Permanent form states
  const [pdob, setPDob] = useState("");
  const [phighestQualification, setPHighestQualification] = useState("");
  const [pgender, setPGender] = useState("");
  const [pmaritalStatus, setPMaritalStatus] = useState("");
  const [coaddress1, setCoAddress1] = useState("");
  const [coaddress2, setCoAddress2] = useState("");
  const [costate, setCoState] = useState("");
  const [cocity, setCoCity] = useState("");
  const [copincode, setCoPincode] = useState("");
  const [paddress1, setPAddress1] = useState("");
  const [paddress2, setPAddress2] = useState("");
  const [pstate, setPState] = useState("");
  const [pcity, setPCity] = useState("");
  const [ppincode, setPPincode] = useState("");
  const [palternatePhone, setPAlternatePhone] = useState("");
  const [paadhaar, setPAadhaar] = useState("");
  const [ppan, setPPan] = useState("");
  const [puan, setPUan] = useState("");
  const [pesi, setPEsi] = useState("");
  const [ppf, setPPf] = useState("");
  const [pesiDispensary, setPEsiDispensary] = useState("");
  const [pbankAccount, setPBankAccount] = useState("");
  const [pifsc, setPIfsc] = useState("");
  const [pbranchName, setPBranchName] = useState("");
  const [pbankName, setPBankName] = useState("");
  const [pfathersName, setPFathersName] = useState("");
  const [pfatherDob, setPFatherDob] = useState("");
  const [pmotherName, setPMotherName] = useState("");
  const [pmotherDob, setPMotherDob] = useState("");
  const [pspouseName, setPSpouseName] = useState("");
  const [pspouseDob, setPSpouseDob] = useState("");
  const [pchild1Name, setPChild1Name] = useState("");
  const [pchild1Dob, setPChild1Dob] = useState("");
  const [pchild2Name, setPChild2Name] = useState("");
  const [pchild2Dob, setPChild2Dob] = useState("");

  // Permanent files
  const [paadhaarFile1, setPAadhaarFile1] = useState(null);
  const [paadhaarFile2, setPAadhaarFile2] = useState(null);
  const [ppanFile, setPPanFile] = useState(null);
  const [ppersonPhoto, setPPersonPhoto] = useState(null);
  const [pbankProofFile, setPBankProofFile] = useState(null);
  const [pfamilyPhoto, setPFamilyPhoto] = useState(null);
  const [ppfForm, setPPfForm] = useState(null);
  const [pesiForm, setPEsiForm] = useState(null);
  const [pemploymentForm, setPEmploymentForm] = useState(null);
  const [pcv, setPCv] = useState(null);

  // Work experience array
  const [experiences, setExperiences] = useState([
    { organization: "", designation: "", from: "", to: "", currentlyWorking: false },
  ]);

  // Contractual form states
  const [cdob, setCDob] = useState("");
  const [caadhaar, setCAadhaar] = useState("");
  const [cpan, setCPan] = useState("");
  const [ccontractLength, setCContractLength] = useState("");
  const [cbankAccount, setCBankAccount] = useState("");
  const [cifsc, setCIfsc] = useState("");
  const [cbranchName, setCBranchName] = useState("");
  const [cbankName, setCBankName] = useState("");

  // Contractual files
  const [caadhaarFile1, setCAadhaarFile1] = useState(null);
  const [caadhaarFile2, setCAadhaarFile2] = useState(null);
  const [cpanFile, setCPanFile] = useState(null);
  const [cpersonPhoto, setCPersonPhoto] = useState(null);
  const [cbankProofFile, setCBankProofFile] = useState(null);

  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

  /* ========================================
     FETCH EMPLOYEE PROFILE ON MOUNT
  ======================================== */
  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  // ✅ NEW: Fetch documents after profile loads
  useEffect(() => {
    if (!loading) {
      fetchEmployeeDocuments();
    }
  }, [loading]);

  // ✅ NEW: Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setMessageType("error");
        setMessage("Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/employee/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      console.log("Profile API response:", responseData);

      if (response.ok && responseData) {
        const data = responseData.employee || responseData;

        // Set READ-ONLY fields
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || data.contactNo || "");
        setWorkerType(data.employeeType || "Permanent");

        // ✅ CONTRACTUAL EMPLOYEE MAPPING
        if (data.employeeType === "Contractual") {
          if (data.dob) setCDob(data.dob.split("T")[0]);
          if (data.aadhaarNumber) setCAadhaar(data.aadhaarNumber);
          if (data.panNumber) setCPan(data.panNumber);
          if (data.contractLength) setCContractLength(data.contractLength);

          // Backend has correspondenceAddress, NOT address
          if (data.correspondenceAddress) {
            setCoAddress1(data.correspondenceAddress.addressLine1 || "");
            setCoAddress2(data.correspondenceAddress.addressLine2 || "");
            setCoState(data.correspondenceAddress.state || "");
            setCoCity(data.correspondenceAddress.city || "");
            setCoPincode(data.correspondenceAddress.pincode || "");
          }

          // Bank details
          if (data.bankDetails) {
            setCBankName(data.bankDetails.bankName || "");
            setCBankAccount(data.bankDetails.accountNumber || "");
            setCIfsc(data.bankDetails.IFSC || data.bankDetails.ifsc || "");
            setCBranchName(data.bankDetails.branchName || "");
          }
        }

        // ✅ PERMANENT EMPLOYEE MAPPING
        if (data.employeeType === "Permanent") {
          if (data.dob) setPDob(data.dob.split("T")[0]);
          if (data.gender) setPGender(data.gender);
          if (data.alternatePhone) setPAlternatePhone(data.alternatePhone);
          if (data.highestQualification) setPHighestQualification(data.highestQualification);
          if (data.maritalStatus) setPMaritalStatus(data.maritalStatus);

          // Addresses
          if (data.correspondenceAddress) {
            setCoAddress1(data.correspondenceAddress.addressLine1 || "");
            setCoAddress2(data.correspondenceAddress.addressLine2 || "");
            setCoState(data.correspondenceAddress.state || "");
            setCoCity(data.correspondenceAddress.city || "");
            setCoPincode(data.correspondenceAddress.pincode || "");
          }

          if (data.permanentAddress) {
            setPAddress1(data.permanentAddress.addressLine1 || "");
            setPAddress2(data.permanentAddress.addressLine2 || "");
            setPState(data.permanentAddress.state || "");
            setPCity(data.permanentAddress.city || "");
            setPPincode(data.permanentAddress.pincode || "");
          }

          // Family
          if (data.fathersName) setPFathersName(data.fathersName);
          if (data.fatherDob) setPFatherDob(data.fatherDob.split("T")[0]);
          if (data.motherName) setPMotherName(data.motherName);
          if (data.motherDob) setPMotherDob(data.motherDob.split("T")[0]);
          if (data.spouseName) setPSpouseName(data.spouseName);
          if (data.spouseDob) setPSpouseDob(data.spouseDob.split("T")[0]);
          if (data.child1Name) setPChild1Name(data.child1Name);
          if (data.child1Dob) setPChild1Dob(data.child1Dob.split("T")[0]);
          if (data.child2Name) setPChild2Name(data.child2Name);
          if (data.child2Dob) setPChild2Dob(data.child2Dob.split("T")[0]);

          // Experiences
          if (Array.isArray(data.experiences) && data.experiences.length > 0) {
            setExperiences(
              data.experiences.map((exp) => ({
                organization: exp.organization || "",
                designation: exp.designation || "",
                from: exp.from ? exp.from.split("T")[0] : "",
                to: exp.to ? exp.to.split("T")[0] : "",
                currentlyWorking: exp.currentlyWorking ?? false,
              }))
            );
          }

          // IDs
          if (data.aadhaarNumber) setPAadhaar(data.aadhaarNumber);
          if (data.panNumber) setPPan(data.panNumber);
          if (data.uanNumber) setPUan(data.uanNumber);
          if (data.pfNumber) setPPf(data.pfNumber);
          if (data.esiNumber) setPEsi(data.esiNumber);
          if (data.esiDispensary) setPEsiDispensary(data.esiDispensary);

          // Bank
          if (data.bankDetails) {
            setPBankName(data.bankDetails.bankName || "");
            setPBankAccount(data.bankDetails.accountNumber || "");
            setPIfsc(data.bankDetails.IFSC || data.bankDetails.ifsc || "");
            setPBranchName(data.bankDetails.branchName || "");
          }
        }

        console.log("Employee profile loaded successfully");
      } else {
        throw new Error(responseData.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessageType("error");
      setMessage("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     ✅ NEW: FETCH EMPLOYEE DOCUMENTS
  ======================================== */
  const fetchEmployeeDocuments = async () => {
    try {
      setLoadingImages(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      // Step 1: Check which documents exist
      const statusResponse = await fetch(
        `${API_URL}/employee/employee/documents/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to fetch document status");
      }

      const status = await statusResponse.json();
      setDocumentStatus(status);

      // Step 2: Fetch images that exist
      const imageTypes = [
        "personPhoto",
        "aadhaarFront",
        "aadhaarBack",
        "panCard",
        "familyPhoto",
        "bankProof",
        "esiForm",
        "pfForm",
        "employmentForm",
        "cv",
      ];

      const urls = {};

      for (const type of imageTypes) {
        const hasKey = `has${type.charAt(0).toUpperCase() + type.slice(1)}`;

        if (status[hasKey]) {
          // Create blob URL for each existing image
          const imageResponse = await fetch(
            `${API_URL}/employee/employee/document/${type}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            urls[type] = URL.createObjectURL(blob);
          }
        }
      }

      setImageUrls(urls);
      console.log("✅ Documents fetched successfully", urls);
    } catch (error) {
      console.error("Error fetching employee documents:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  /* ========================================
     HANDLE CHECKBOX CHANGE
  ======================================== */
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsCorrespondence(checked);
    if (checked) {
      setPAddress1(coaddress1);
      setPAddress2(coaddress2);
      setPState(costate);
      setPCity(cocity);
      setPPincode(copincode);
    } else {
      setPAddress1("");
      setPAddress2("");
      setPState("");
      setPCity("");
      setPPincode("");
    }
  };

  /* ========================================
     EXPERIENCE HANDLERS
  ======================================== */
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { organization: "", designation: "", from: "", to: "", currentlyWorking: false },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences((s) => {
      if (s.length === 1) return s;
      const copy = [...s];
      copy.splice(index, 1);
      return copy;
    });
  };

  const updateExperience = (index, field, value) => {
    const copy = [...experiences];
    copy[index] = { ...copy[index], [field]: value };
    setExperiences(copy);
  };

  /* ========================================
     HANDLE SUBMIT
  ======================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (workerType === "Permanent") {
      if (!pgender || !pdob || !paadhaar) {
        alert("Please fill all required fields");
        return;
      }
      if (!pfathersName || !pmotherName) {
        alert("Please enter both parents' names");
        return;
      }
      if (!pfatherDob || !pmotherDob) {
        alert("Please enter both parents' date of birth");
        return;
      }
      if (paadhaar.length !== 12) {
        alert("Aadhaar must be 12 digits");
        return;
      }
      if (!ppan || ppan.length !== 10) {
        alert("PAN must be 10 characters");
        return;
      }
      if (!pifsc || pifsc.length !== 11) {
        alert("IFSC must be 11 characters");
        return;
      }

      // ✅ FIX: Check for both new files AND existing images
      if (
        (!paadhaarFile1 && !imageUrls.aadhaarFront) ||
        (!paadhaarFile2 && !imageUrls.aadhaarBack) ||
        (!ppanFile && !imageUrls.panCard) ||
        (!ppersonPhoto && !imageUrls.personPhoto) ||
        (!pbankProofFile && !imageUrls.bankProof)
      ) {
        alert("Please upload all required files");
        return;
      }
    } else {
      // Contractual validation
      if (!cdob || !caadhaar) {
        alert("Please fill all required fields");
        return;
      }
      if (!coaddress1 || !costate || !cocity || !copincode) {
        alert("Please fill all address fields");
        console.log("Missing address fields:", {
          coaddress1,
          costate,
          cocity,
          copincode,
        });
        return;
      }
      if (caadhaar.length !== 12) {
        alert("Aadhaar must be 12 digits");
        return;
      }
      if (!cifsc || cifsc.length !== 11) {
        alert("IFSC must be 11 characters");
        return;
      }

      // ✅ FIX: Check for both new files AND existing images
      if (
        (!caadhaarFile1 && !imageUrls.aadhaarFront) ||
        (!caadhaarFile2 && !imageUrls.aadhaarBack) ||
        (!cpersonPhoto && !imageUrls.personPhoto) ||
        (!cbankProofFile && !imageUrls.bankProof)
      ) {
        alert("Please upload all required files");
        return;
      }
    }

    setSubmitting(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      const formData = new FormData();

      // Basic fields
      if (workerType === "Permanent") {
        formData.append("gender", pgender);
        formData.append("dob", pdob);
        if (palternatePhone) formData.append("alternatePhone", palternatePhone);
        formData.append("aadhaarNumber", paadhaar);
        formData.append("highestQualification", phighestQualification);
        formData.append("maritalStatus", pmaritalStatus);
        formData.append("panNumber", ppan);

        // Address (using dot notation for backend to handle)
        formData.append("correspondenceAddress.addressLine1", coaddress1);
        if (coaddress2) formData.append("correspondenceAddress.addressLine2", coaddress2);
        formData.append("correspondenceAddress.state", costate);
        formData.append("correspondenceAddress.city", cocity);
        formData.append("correspondenceAddress.pincode", copincode);

        formData.append("permanentAddress.addressLine1", paddress1);
        if (paddress2) formData.append("permanentAddress.addressLine2", paddress2);
        formData.append("permanentAddress.state", pstate);
        formData.append("permanentAddress.city", pcity);
        formData.append("permanentAddress.pincode", ppincode);

        // Family
        formData.append("fathersName", pfathersName);
        formData.append("fatherDob", pfatherDob);
        formData.append("motherName", pmotherName);
        formData.append("motherDob", pmotherDob);
        if (pspouseName) formData.append("spouseName", pspouseName);
        if (pspouseDob) formData.append("spouseDob", pspouseDob);
        if (pchild1Name) formData.append("child1Name", pchild1Name);
        if (pchild1Dob) formData.append("child1Dob", pchild1Dob);
        if (pchild2Name) formData.append("child2Name", pchild2Name);
        if (pchild2Dob) formData.append("child2Dob", pchild2Dob);

        // IDs
        formData.append("uanNumber", puan);
        formData.append("pfNumber", ppf);
        formData.append("esiNumber", pesi);
        if (pesiDispensary) formData.append("esiDispensary", pesiDispensary);

        // Bank
        formData.append("bankDetails.bankName", pbankName);
        formData.append("bankDetails.accountNumber", pbankAccount);
        formData.append("bankDetails.ifsc", pifsc);
        formData.append("bankDetails.branchName", pbranchName);

        // Experience
        formData.append("experiences", JSON.stringify(experiences));

        // Files
        if (ppersonPhoto?.raw) formData.append("personPhoto", ppersonPhoto.raw);
        if (paadhaarFile1?.raw) formData.append("aadhaarFront", paadhaarFile1.raw);
        if (paadhaarFile2?.raw) formData.append("aadhaarBack", paadhaarFile2.raw);
        if (ppanFile?.raw) formData.append("panCard", ppanFile.raw);
        if (pbankProofFile?.raw) formData.append("bankProof", pbankProofFile.raw);
        if (pfamilyPhoto?.raw) formData.append("familyPhoto", pfamilyPhoto.raw);
        if (ppfForm?.raw) formData.append("pfForm", ppfForm.raw);
        if (pesiForm?.raw) formData.append("esiForm", pesiForm.raw);
        if (pemploymentForm?.raw) formData.append("employmentForm", pemploymentForm.raw);
        if (pcv?.raw) formData.append("cv", pcv.raw);
      } else {
        // Contractual
        formData.append("dob", cdob);
        formData.append("aadhaarNumber", caadhaar);
        if (cpan) formData.append("panNumber", cpan);
        formData.append("contractLength", ccontractLength);

        // ✅ FIX: Use correspondenceAddress (backend expects this)
        formData.append("correspondenceAddress.addressLine1", coaddress1);
        if (coaddress2) formData.append("correspondenceAddress.addressLine2", coaddress2);
        formData.append("correspondenceAddress.state", costate);
        formData.append("correspondenceAddress.city", cocity);
        formData.append("correspondenceAddress.pincode", copincode);

        // Bank
        formData.append("bankDetails.bankName", cbankName);
        formData.append("bankDetails.accountNumber", cbankAccount);
        formData.append("bankDetails.ifsc", cifsc);
        formData.append("bankDetails.branchName", cbranchName);

        // Files
        if (cpersonPhoto?.raw) formData.append("personPhoto", cpersonPhoto.raw);
        if (caadhaarFile1?.raw) formData.append("aadhaarFront", caadhaarFile1.raw);
        if (caadhaarFile2?.raw) formData.append("aadhaarBack", caadhaarFile2.raw);
        if (cpanFile?.raw) formData.append("panCard", cpanFile.raw);
        if (cbankProofFile?.raw) formData.append("bankProof", cbankProofFile.raw);
      }

      console.log("Submitting profile update...");

      const response = await fetch(`${API_URL}/employee/employee/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Profile completed successfully!");
        console.log("Profile updated successfully");

        // ✅ Refresh documents after successful update
        fetchEmployeeDocuments();
      } else {
        throw new Error(responseData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessageType("error");
      setMessage(error.message || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4002B] mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-8 pb-10">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2 text-center text-[#E4002B]">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-6">{workerType} Employee</p>

        {/* Read-only basic info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#E4002B]">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Information (from Admin)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Name: </span>
              <span className="font-semibold">{name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email: </span>
              <span className="font-semibold">{email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone: </span>
              <span className="font-semibold">{phone}</span>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Loading images indicator */}
        {loadingImages && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-700">Loading documents...</p>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {workerType === "Permanent" ? (
            <>
              {/* Personal Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect
                    label={
                      <>
                        Gender <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Select gender"
                    options={["Male", "Female", "Other"]}
                    value={pgender}
                    onChange={setPGender}
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Date of Birth <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={pdob}
                    onChange={(e) => setPDob(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Highest Qualification <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="e.g., MBA, B.Tech"
                    value={phighestQualification}
                    onChange={(e) => setPHighestQualification(e.target.value)}
                    required
                  />
                  <SearchableSelect
                    label={
                      <>
                        Marital Status <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Select"
                    options={["Unmarried", "Married"]}
                    value={pmaritalStatus}
                    onChange={setPMaritalStatus}
                  />
                  <IconInput
                    icon={FaPhoneAlt}
                    label="Alternate Phone Number"
                    placeholder="91 1234567890"
                    value={palternatePhone}
                    onChange={(e) => setPAlternatePhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
              </section>

              {/* Address Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Correspondence Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaFileAlt}
                    label={
                      <>
                        Address Line 1 <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="House no, street, area"
                    value={coaddress1}
                    onChange={(e) => setCoAddress1(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={coaddress2}
                    onChange={(e) => setCoAddress2(e.target.value)}
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        State <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Delhi"
                    value={costate}
                    onChange={(e) => setCoState(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        City <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="New Delhi"
                    value={cocity}
                    onChange={(e) => setCoCity(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Pincode <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="110001"
                    value={copincode}
                    onChange={(e) => setCoPincode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAsCorrespondence}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 accent-[#E4002B] cursor-pointer"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-700 cursor-pointer">
                    Same as Correspondence Address
                  </label>
                </div>

                <h3 className="text-lg font-medium text-[#E4002B] pt-4">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaFileAlt}
                    label={
                      <>
                        Address Line 1 <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="House no, street, area"
                    value={paddress1}
                    onChange={(e) => setPAddress1(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={paddress2}
                    onChange={(e) => setPAddress2(e.target.value)}
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        State <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Delhi"
                    value={pstate}
                    onChange={(e) => setPState(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        City <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="New Delhi"
                    value={pcity}
                    onChange={(e) => setPCity(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Pincode <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="110001"
                    value={ppincode}
                    onChange={(e) => setPPincode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    required
                  />
                </div>
              </section>

              {/* Family Background */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Family Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaUser}
                    label={
                      <>
                        Father's Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Enter father's name"
                    value={pfathersName}
                    onChange={(e) => setPFathersName(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Father's DOB <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={pfatherDob}
                    onChange={(e) => setPFatherDob(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaUser}
                    label={
                      <>
                        Mother's Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Enter mother's name"
                    value={pmotherName}
                    onChange={(e) => setPMotherName(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Mother's DOB <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={pmotherDob}
                    onChange={(e) => setPMotherDob(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaUser}
                    label="Spouse Name (if applicable)"
                    placeholder="Enter spouse's name"
                    value={pspouseName}
                    onChange={(e) => setPSpouseName(e.target.value)}
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Spouse DOB"
                    type="date"
                    value={pspouseDob}
                    onChange={(e) => setPSpouseDob(e.target.value)}
                  />
                  <IconInput
                    icon={FaUser}
                    label="Child 1 Name"
                    placeholder="Enter child 1's name"
                    value={pchild1Name}
                    onChange={(e) => setPChild1Name(e.target.value)}
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Child 1 DOB"
                    type="date"
                    value={pchild1Dob}
                    onChange={(e) => setPChild1Dob(e.target.value)}
                  />
                  <IconInput
                    icon={FaUser}
                    label="Child 2 Name"
                    placeholder="Enter child 2's name"
                    value={pchild2Name}
                    onChange={(e) => setPChild2Name(e.target.value)}
                  />
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Child 2 DOB"
                    type="date"
                    value={pchild2Dob}
                    onChange={(e) => setPChild2Dob(e.target.value)}
                  />
                </div>
              </section>

              {/* Identification */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Identification Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaIdCard}
                    label={
                      <>
                        Aadhaar Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="1234 5678 9012"
                    value={paadhaar}
                    onChange={(e) => setPAadhaar(e.target.value.replace(/\D/g, ""))}
                    maxLength={12}
                    required
                  />
                  <IconInput
                    icon={FaIdCard}
                    label={
                      <>
                        PAN Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="ABCDE1234F"
                    value={ppan}
                    onChange={(e) => setPPan(e.target.value.toUpperCase())}
                    maxLength={10}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        UAN Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="UAN"
                    value={puan}
                    onChange={(e) => setPUan(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        PF Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="PF"
                    value={ppf}
                    onChange={(e) => setPPf(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        ESI Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="ESI"
                    value={pesi}
                    onChange={(e) => setPEsi(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaBuilding}
                    label="ESI Dispensary Location"
                    placeholder="Enter location"
                    value={pesiDispensary}
                    onChange={(e) => setPEsiDispensary(e.target.value)}
                  />
                </div>
              </section>

              {/* Bank Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaUniversity}
                    label={
                      <>
                        Bank Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Bank name"
                    value={pbankName}
                    onChange={(e) => setPBankName(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaUniversity}
                    label={
                      <>
                        Branch Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Branch name"
                    value={pbranchName}
                    onChange={(e) => setPBranchName(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Account Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="123456789012"
                    value={pbankAccount}
                    onChange={(e) => setPBankAccount(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        IFSC Code <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="HDFC0001234"
                    value={pifsc}
                    onChange={(e) => setPIfsc(e.target.value.toUpperCase())}
                    maxLength={11}
                    required
                  />
                </div>
              </section>

              {/* Prior Work Experience */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Prior Work Experience</h3>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-sm text-red-500 hover:underline flex items-center gap-1"
                        title="Remove experience"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <IconInput
                        icon={FaBuilding}
                        label={
                          <>
                            Name of Organization <span className="text-red-500">*</span>
                          </>
                        }
                        placeholder="Organization"
                        value={exp.organization}
                        onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                        required
                      />
                      <IconInput
                        icon={FaUser}
                        label={
                          <>
                            Designation <span className="text-red-500">*</span>
                          </>
                        }
                        placeholder="Designation"
                        value={exp.designation}
                        onChange={(e) => updateExperience(idx, "designation", e.target.value)}
                        required
                      />
                      <IconInput
                        icon={FaCalendarAlt}
                        label={
                          <>
                            From <span className="text-red-500">*</span>
                          </>
                        }
                        type="date"
                        value={exp.from}
                        onChange={(e) => updateExperience(idx, "from", e.target.value)}
                        required
                      />
                      <IconInput
                        icon={FaCalendarAlt}
                        label={
                          <>
                            To <span className="text-red-500">*</span>
                          </>
                        }
                        type="date"
                        value={exp.to}
                        onChange={(e) => updateExperience(idx, "to", e.target.value)}
                        disabled={exp.currentlyWorking}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        id={`currentlyWorking-${idx}`}
                        checked={exp.currentlyWorking || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExperiences((prev) =>
                            prev.map((exp, i) =>
                              i === idx ? { ...exp, currentlyWorking: checked, to: checked ? "" : exp.to } : exp
                            )
                          );
                        }}
                        className="w-4 h-4 accent-[#E4002B] cursor-pointer"
                      />
                      <label htmlFor={`currentlyWorking-${idx}`} className="text-sm text-gray-700 cursor-pointer">
                        Currently Working Here
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-2 text-[#E4002B] hover:underline"
                >
                  <FaPlus /> Add Another Experience
                </button>
              </section>

              {/* ✅ File Uploads - WITH EXISTING IMAGE SUPPORT */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#E4002B]">File Uploads</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-red-500">*</span> Accepted formats: PNG, JPG, JPEG, PDF (less than 1 MB)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileInput
                    label="Your Photo"
                    accept="image/*"
                    file={ppersonPhoto}
                    setFile={setPPersonPhoto}
                    required
                    existingImageUrl={imageUrls.personPhoto}
                  />
                  <FileInput
                    label="Aadhaar (front)"
                    accept="image/*,.pdf"
                    file={paadhaarFile1}
                    setFile={setPAadhaarFile1}
                    required
                    existingImageUrl={imageUrls.aadhaarFront}
                  />
                  <FileInput
                    label="Aadhaar (back)"
                    accept="image/*,.pdf"
                    file={paadhaarFile2}
                    setFile={setPAadhaarFile2}
                    required
                    existingImageUrl={imageUrls.aadhaarBack}
                  />
                  <FileInput
                    label="PAN Card"
                    accept="image/*,.pdf"
                    file={ppanFile}
                    setFile={setPPanFile}
                    required
                    existingImageUrl={imageUrls.panCard}
                  />
                  <FileInput
                    label="Bank Proof"
                    accept="image/*,.pdf"
                    file={pbankProofFile}
                    setFile={setPBankProofFile}
                    required
                    existingImageUrl={imageUrls.bankProof}
                  />
                  <FileInput
                    label="Family Photo"
                    accept="image/*"
                    file={pfamilyPhoto}
                    setFile={setPFamilyPhoto}
                    existingImageUrl={imageUrls.familyPhoto}
                  />
                  <FileInput
                    label="PF Form"
                    accept="image/*,.pdf"
                    file={ppfForm}
                    setFile={setPPfForm}
                    required
                    existingImageUrl={imageUrls.pfForm}
                  />
                  <FileInput
                    label="ESI Form"
                    accept="image/*,.pdf"
                    file={pesiForm}
                    setFile={setPEsiForm}
                    required
                    existingImageUrl={imageUrls.esiForm}
                  />
                  <FileInput
                    label="Employment Form"
                    accept="image/*,.pdf"
                    file={pemploymentForm}
                    setFile={setPEmploymentForm}
                    existingImageUrl={imageUrls.employmentForm}
                  />
                  <FileInput
                    label="Copy of CV"
                    accept="image/*,.pdf"
                    file={pcv}
                    setFile={setPCv}
                    existingImageUrl={imageUrls.cv}
                  />
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Contractual Personal Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Date of Birth <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={cdob}
                    onChange={(e) => setCDob(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Contract Length <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="e.g., 6 months"
                    value={ccontractLength}
                    onChange={(e) => setCContractLength(e.target.value)}
                    required
                  />
                </div>
              </section>

              {/* Address */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaFileAlt}
                    label={
                      <>
                        Address Line 1 <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="House no, street, area"
                    value={coaddress1}
                    onChange={(e) => setCoAddress1(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={coaddress2}
                    onChange={(e) => setCoAddress2(e.target.value)}
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        State <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Delhi"
                    value={costate}
                    onChange={(e) => setCoState(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        City <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="New Delhi"
                    value={cocity}
                    onChange={(e) => setCoCity(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Pincode <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="110001"
                    value={copincode}
                    onChange={(e) => setCoPincode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    required
                  />
                </div>
              </section>

              {/* Identification */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Identification Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaIdCard}
                    label={
                      <>
                        Aadhaar Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="1234 5678 9012"
                    value={caadhaar}
                    onChange={(e) => setCAadhaar(e.target.value.replace(/\D/g, ""))}
                    maxLength={12}
                    required
                  />
                  <IconInput
                    icon={FaIdCard}
                    label="PAN Number"
                    placeholder="ABCDE1234F"
                    value={cpan}
                    onChange={(e) => setCPan(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
              </section>

              {/* Bank Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-[#E4002B]">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconInput
                    icon={FaUniversity}
                    label={
                      <>
                        Bank Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Bank name"
                    value={cbankName}
                    onChange={(e) => setCBankName(e.target.value)}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Account Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="123456789012"
                    value={cbankAccount}
                    onChange={(e) => setCBankAccount(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        IFSC Code <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="HDFC0001234"
                    value={cifsc}
                    onChange={(e) => setCIfsc(e.target.value.toUpperCase())}
                    maxLength={11}
                    required
                  />
                  <IconInput
                    icon={FaUniversity}
                    label={
                      <>
                        Branch Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Branch name"
                    value={cbranchName}
                    onChange={(e) => setCBranchName(e.target.value)}
                    required
                  />
                </div>
              </section>

              {/* ✅ File Uploads - WITH EXISTING IMAGE SUPPORT */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#E4002B]">File Uploads</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-red-500">*</span> Accepted formats: PNG, JPG, JPEG, PDF (less than 1 MB)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileInput
                    label="Your Photo"
                    accept="image/*"
                    file={cpersonPhoto}
                    setFile={setCPersonPhoto}
                    required
                    existingImageUrl={imageUrls.personPhoto}
                  />
                  <FileInput
                    label="Aadhaar (front)"
                    accept="image/*,.pdf"
                    file={caadhaarFile1}
                    setFile={setCAadhaarFile1}
                    required
                    existingImageUrl={imageUrls.aadhaarFront}
                  />
                  <FileInput
                    label="Aadhaar (back)"
                    accept="image/*,.pdf"
                    file={caadhaarFile2}
                    setFile={setCAadhaarFile2}
                    required
                    existingImageUrl={imageUrls.aadhaarBack}
                  />
                  <FileInput
                    label="PAN Card"
                    accept="image/*,.pdf"
                    file={cpanFile}
                    setFile={setCPanFile}
                    existingImageUrl={imageUrls.panCard}
                  />
                  <FileInput
                    label="Bank Proof"
                    accept="image/*,.pdf"
                    file={cbankProofFile}
                    setFile={setCBankProofFile}
                    required
                    existingImageUrl={imageUrls.bankProof}
                  />
                </div>
              </section>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E4002B] text-white py-3 rounded-lg font-medium hover:bg-[#C3002B] transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
