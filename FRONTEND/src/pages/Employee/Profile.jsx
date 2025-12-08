"use client"

import { useState, useRef, useEffect } from "react"
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
} from "react-icons/fa"
import { IoClose } from "react-icons/io5"

const API_URL = "https://supreme-419p.onrender.com/api"

const SearchableSelect = ({ label, placeholder, options, value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const filtered = options.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
      <div
        className={`w-full border border-gray-300 rounded-lg ${disabled ? 'bg-gray-100' : 'bg-white'}`}
        onClick={() => !disabled && setOpen(true)}
      >
        <div className="flex items-center px-3 py-2">
          <input
            className={`flex-1 outline-none bg-transparent text-sm ${disabled ? 'cursor-not-allowed' : ''}`}
            placeholder={value || placeholder}
            value={open ? search : value || ""}
            onChange={(e) => {
              setSearch(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => !disabled && setOpen(true)}
            disabled={disabled}
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
                setSearch("")
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
                  onChange(opt)
                  setSearch("")
                  setOpen(false)
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
  )
}

const FileInput = ({ label, accept = "*", file, setFile, required = false }) => {
  const fileRef = useRef()

  useEffect(() => {
    return () => {
      if (file && file.preview) URL.revokeObjectURL(file.preview)
    }
  }, [file])

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) {
      setFile(null)
      return
    }
    const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    setFile({ raw: f, preview, name: f.name })
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#E4002B] transition bg-white`}
        onClick={() => fileRef.current?.click()}
      >
        {!file ? (
          <>
            <FaPlus className="text-2xl text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Click or drop file here</p>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              required={required}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-2">
            {file.preview ? (
              <img
                src={file.preview || "/placeholder.svg"}
                alt="preview"
                className="w-24 h-16 object-cover rounded-md border"
              />
            ) : (
              <div className="flex items-center gap-2">
                <FaFileAlt className="text-gray-600" />
                <p className="text-sm text-gray-700">{file.name}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileRef.current) fileRef.current.value = ""
                }}
                className="flex items-center gap-1 text-red-500 text-xs hover:underline"
              >
                <FaTrash /> Remove
              </button>
            </div>
            <input ref={fileRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  )
}

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
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E4002B] text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        {...rest}
      />
    </div>
  </div>
)

const Profile = () => {

  // Loading and submission
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // "success" or "error"

  // Prefilled from backend (READ-ONLY)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [workerType, setWorkerType] = useState("") // Permanent or Contractual

  // Permanent form states
  const [p_dob, setPDob] = useState("")
  const [p_highestQualification, setPHighestQualification] = useState("")
  const [p_gender, setPGender] = useState("")
  const [p_maritalStatus, setPMaritalStatus] = useState("")
  const [co_address1, setCoAddress1] = useState("")
  const [co_address2, setCoAddress2] = useState("")
  const [co_state, setCoState] = useState("")
  const [co_city, setCoCity] = useState("")
  const [co_pincode, setCoPincode] = useState("")
  const [p_address1, setPAddress1] = useState("")
  const [p_address2, setPAddress2] = useState("")
  const [p_state, setPState] = useState("")
  const [p_city, setPCity] = useState("")
  const [p_pincode, setPPincode] = useState("")
  const [p_alternatePhone, setPAlternatePhone] = useState("")
  const [p_aadhaar, setPAadhaar] = useState("")
  const [p_pan, setPPan] = useState("")
  const [p_uan, setPUan] = useState("")
  const [p_esi, setPEsi] = useState("")
  const [p_pf, setPPf] = useState("")
  const [p_esiDispensary, setPEsiDispensary] = useState("")
  const [p_bankAccount, setPBankAccount] = useState("")
  const [p_confirmBankAccount, setPConfirmBankAccount] = useState("")
  const [p_ifsc, setPIfsc] = useState("")
  const [p_branchName, setPBranchName] = useState("")
  const [p_bankName, setPBankName] = useState("")
  const [p_fathersName, setPFathersName] = useState("")
  const [p_fatherDob, setPFatherDob] = useState("")
  const [p_motherName, setPMotherName] = useState("")
  const [p_motherDob, setPMotherDob] = useState("")
  const [p_spouseName, setPSpouseName] = useState("")
  const [p_spouseDob, setPSpouseDob] = useState("")
  const [p_child1Name, setPChild1Name] = useState("")
  const [p_child1Dob, setPChild1Dob] = useState("")
  const [p_child2Name, setPChild2Name] = useState("")
  const [p_child2Dob, setPChild2Dob] = useState("")

  // Permanent files
  const [p_aadhaarFile1, setPAadhaarFile1] = useState(null)
  const [p_aadhaarFile2, setPAadhaarFile2] = useState(null)
  const [p_panFile, setPPanFile] = useState(null)
  const [p_personPhoto, setPPersonPhoto] = useState(null)
  const [p_bankProofFile, setPBankProofFile] = useState(null)
  const [p_familyPhoto, setPFamilyPhoto] = useState(null)
  const [p_pfForm, setPPfForm] = useState(null)
  const [p_esiForm, setPEsiForm] = useState(null)
  const [p_employmentForm, setPEmploymentForm] = useState(null)
  const [p_cv, setPCv] = useState(null)

  // Work experience array
  const [experiences, setExperiences] = useState([
    { organization: "", designation: "", from: "", to: "", currentlyWorking: false },
  ])

  // Contractual form states
  const [c_dob, setCDob] = useState("")
  const [c_address1, setCAddress1] = useState("")
  const [c_address2, setCAddress2] = useState("")
  const [c_state, setCState] = useState("")
  const [c_city, setCCity] = useState("")
  const [c_pincode, setCPincode] = useState("")
  const [c_aadhaar, setCAadhaar] = useState("")
  const [c_pan, setCPan] = useState("")
  const [c_contractLength, setCContractLength] = useState("")
  const [c_bankAccount, setCBankAccount] = useState("")
  const [c_confirmBankAccount, setCConfirmBankAccount] = useState("")
  const [c_ifsc, setCIfsc] = useState("")
  const [c_branchName, setCBranchName] = useState("")
  const [c_bankName, setCBankName] = useState("")

  // Contractual files
  const [c_aadhaarFile1, setCAadhaarFile1] = useState(null)
  const [c_aadhaarFile2, setCAadhaarFile2] = useState(null)
  const [c_panFile, setCPanFile] = useState(null)
  const [c_personPhoto, setCPersonPhoto] = useState(null)
  const [c_bankProofFile, setCBankProofFile] = useState(null)

  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false)

  // Fetch employee profile on mount
  useEffect(() => {
    fetchEmployeeProfile()
  }, [])

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      console.log("🔍 Retrieved token:", token)
      if (!token) {
        setMessageType("error")
        setMessage("Please login again.")
        setLoading(false)
        return
      }

      console.log("🔍 Fetching profile from API...")
      const response = await fetch(`${API_URL}/employee/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const responseData = await response.json()
      console.log("🔍 Profile API response:", responseData)

      if (response.ok && responseData) {
        const data = responseData.employee || responseData

        // Set READ-ONLY fields from admin
        setName(data.name || "")
        setEmail(data.email || "")
        setPhone(data.phone || data.contactNo || "")
        setWorkerType(data.employeeType || "")

        // Prefill other existing data
        if (data.dob) setPDob(data.dob)
        if (data.gender) setPGender(data.gender)
        if (data.alternatePhone) setPAlternatePhone(data.alternatePhone)
        if (data.highestQualification) setPHighestQualification(data.highestQualification)
        if (data.maritalStatus) setPMaritalStatus(data.maritalStatus)

        // Addresses
        if (data.correspondenceAddress) {
          setCoAddress1(data.correspondenceAddress.addressLine1 || "")
          setCoAddress2(data.correspondenceAddress.addressLine2 || "")
          setCoState(data.correspondenceAddress.state || "")
          setCoCity(data.correspondenceAddress.city || "")
          setCoPincode(data.correspondenceAddress.pincode || "")
        }

        if (data.permanentAddress) {
          setPAddress1(data.permanentAddress.addressLine1 || "")
          setPAddress2(data.permanentAddress.addressLine2 || "")
          setPState(data.permanentAddress.state || "")
          setPCity(data.permanentAddress.city || "")
          setPPincode(data.permanentAddress.pincode || "")
        }

        // Family (Permanent only)
        if (data.employeeType === "Permanent") {
          if (data.fathersName) setPFathersName(data.fathersName)
          if (data.fatherDob) setPFatherDob(data.fatherDob)
          if (data.motherName) setPMotherName(data.motherName)
          if (data.motherDob) setPMotherDob(data.motherDob)
          if (data.spouseName) setPSpouseName(data.spouseName)
          if (data.spouseDob) setPSpouseDob(data.spouseDob)
          if (data.child1Name) setPChild1Name(data.child1Name)
          if (data.child1Dob) setPChild1Dob(data.child1Dob)
          if (data.child2Name) setPChild2Name(data.child2Name)
          if (data.child2Dob) setPChild2Dob(data.child2Dob)

          if (data.experiences && Array.isArray(data.experiences)) {
            setExperiences(data.experiences)
          }
        }

        // IDs
        if (data.aadhaarNumber) setPAadhaar(data.aadhaarNumber)
        if (data.panNumber) setPPan(data.panNumber)
        if (data.uanNumber) setPUan(data.uanNumber)
        if (data.pfNumber) setPPf(data.pfNumber)
        if (data.esiNumber) setPEsi(data.esiNumber)
        if (data.esiDispensary) setPEsiDispensary(data.esiDispensary)
        if (data.contractLength) setCContractLength(data.contractLength)

        // Bank
        if (data.bankDetails) {
          setPBankName(data.bankDetails.bankName || "")
          setPBankAccount(data.bankDetails.accountNumber || "")
          setPConfirmBankAccount(data.bankDetails.accountNumber || "")
          setPIfsc(data.bankDetails.IFSC || data.bankDetails.ifsc || "")
          setPBranchName(data.bankDetails.branchName || "")
        }

        console.log("✅ Employee profile loaded")
      } else {
        throw new Error(responseData.message || "Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessageType("error")
      setMessage("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked
    setSameAsCorrespondence(checked)

    if (checked) {
      setPAddress1(co_address1)
      setPAddress2(co_address2)
      setPState(co_state)
      setPCity(co_city)
      setPPincode(co_pincode)
    } else {
      setPAddress1("")
      setPAddress2("")
      setPState("")
      setPCity("")
      setPPincode("")
    }
  }

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        organization: "",
        designation: "",
        from: "",
        to: "",
        currentlyWorking: false,
      },
    ])
  }

  const removeExperience = (index) => {
    setExperiences((s) => {
      if (s.length === 1) return s
      const copy = [...s]
      copy.splice(index, 1)
      return copy
    })
  }

  const updateExperience = (index, field, value) => {
    const copy = [...experiences]
    copy[index] = { ...copy[index], [field]: value }
    setExperiences(copy)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (workerType === "Permanent") {
      if (!p_gender || !p_dob || !p_aadhaar) {
        alert("Please fill all required fields")
        return
      }
      if (!p_fathersName || !p_motherName) {
        alert("Please enter both parents' names")
        return
      }

      if (!p_fatherDob || !p_motherDob) {
        alert("Please enter both parents' date of birth")
        return
      }
      if (p_aadhaar.length !== 12) {
        alert("Aadhaar must be 12 digits")
        return
      }
      if (!p_pan || p_pan.length !== 10) {
        alert("PAN must be 10 characters")
        return
      }
      if (!p_bankAccount || p_bankAccount !== p_confirmBankAccount) {
        alert("Bank account numbers don't match")
        return
      }
      if (!p_ifsc || p_ifsc.length !== 11) {
        alert("IFSC must be 11 characters")
        return
      }
      if (!p_aadhaarFile1 || !p_aadhaarFile2 || !p_panFile || !p_personPhoto || !p_bankProofFile) {
        alert("Please upload all required files")
        return
      }
    } else {
      // Contractual validation
      if (!c_dob || !c_aadhaar) {
        alert("Please fill all required fields")
        return
      }
      if (c_aadhaar.length !== 12) {
        alert("Aadhaar must be 12 digits")
        return
      }
      if (!c_bankAccount || c_bankAccount !== c_confirmBankAccount) {
        alert("Bank account numbers don't match")
        return
      }
      if (!c_ifsc || c_ifsc.length !== 11) {
        alert("IFSC must be 11 characters")
        return
      }
      if (!c_aadhaarFile1 || !c_aadhaarFile2 || !c_personPhoto || !c_bankProofFile) {
        alert("Please upload all required files")
        return
      }
    }

    setSubmitting(true)
    setMessage("")

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        alert("Please login again")
        return
      }

      const formData = new FormData()

      // Basic fields
      if (workerType === "Permanent") {
        formData.append("gender", p_gender)
        formData.append("dob", p_dob)
        if (p_alternatePhone) formData.append("alternatePhone", p_alternatePhone)
        formData.append("aadhaarNumber", p_aadhaar)
        formData.append("highestQualification", p_highestQualification)
        formData.append("maritalStatus", p_maritalStatus)
        formData.append("panNumber", p_pan)

        // Address
        formData.append("correspondenceAddress.addressLine1", co_address1)
        if (co_address2) formData.append("correspondenceAddress.addressLine2", co_address2)
        formData.append("correspondenceAddress.state", co_state)
        formData.append("correspondenceAddress.city", co_city)
        formData.append("correspondenceAddress.pincode", co_pincode)

        formData.append("permanentAddress.addressLine1", p_address1)
        if (p_address2) formData.append("permanentAddress.addressLine2", p_address2)
        formData.append("permanentAddress.state", p_state)
        formData.append("permanentAddress.city", p_city)
        formData.append("permanentAddress.pincode", p_pincode)

        // Family - Update to always append required fields
        formData.append("fathersName", p_fathersName)
        formData.append("fatherDob", p_fatherDob)
        formData.append("motherName", p_motherName)
        formData.append("motherDob", p_motherDob)

        // Optional fields - only if filled
        if (p_spouseName) formData.append("spouseName", p_spouseName)
        if (p_spouseDob) formData.append("spouseDob", p_spouseDob)
        if (p_child1Name) formData.append("child1Name", p_child1Name)
        if (p_child1Dob) formData.append("child1Dob", p_child1Dob)
        if (p_child2Name) formData.append("child2Name", p_child2Name)
        if (p_child2Dob) formData.append("child2Dob", p_child2Dob)

        // IDs
        formData.append("uanNumber", p_uan)
        formData.append("pfNumber", p_pf)
        formData.append("esiNumber", p_esi)
        if (p_esiDispensary) formData.append("esiDispensary", p_esiDispensary)

        // Bank
        formData.append("bankDetails.bankName", p_bankName)
        formData.append("bankDetails.accountNumber", p_bankAccount)
        formData.append("bankDetails.ifsc", p_ifsc)
        formData.append("bankDetails.branchName", p_branchName)

        // Experience
        formData.append("experiences", JSON.stringify(experiences))

        // Files
        if (p_personPhoto?.raw) formData.append("personPhoto", p_personPhoto.raw)
        if (p_aadhaarFile1?.raw) formData.append("aadhaarFront", p_aadhaarFile1.raw)
        if (p_aadhaarFile2?.raw) formData.append("aadhaarBack", p_aadhaarFile2.raw)
        if (p_panFile?.raw) formData.append("panCard", p_panFile.raw)
        if (p_bankProofFile?.raw) formData.append("bankProof", p_bankProofFile.raw)
        if (p_familyPhoto?.raw) formData.append("familyPhoto", p_familyPhoto.raw)
        if (p_pfForm?.raw) formData.append("pfForm", p_pfForm.raw)
        if (p_esiForm?.raw) formData.append("esiForm", p_esiForm.raw)
        if (p_employmentForm?.raw) formData.append("employmentForm", p_employmentForm.raw)
        if (p_cv?.raw) formData.append("cv", p_cv.raw)
      } else {
        // Contractual
        formData.append("dob", c_dob)
        formData.append("aadhaarNumber", c_aadhaar)
        if (c_pan) formData.append("panNumber", c_pan)
        formData.append("contractLength", c_contractLength)

        // Address
        formData.append("address.addressLine1", c_address1)
        if (c_address2) formData.append("address.addressLine2", c_address2)
        formData.append("address.state", c_state)
        formData.append("address.city", c_city)
        formData.append("address.pincode", c_pincode)

        // Bank
        formData.append("bankDetails.bankName", c_bankName)
        formData.append("bankDetails.accountNumber", c_bankAccount)
        formData.append("bankDetails.ifsc", c_ifsc)
        formData.append("bankDetails.branchName", c_branchName)

        // Files
        if (c_personPhoto?.raw) formData.append("personPhoto", c_personPhoto.raw)
        if (c_aadhaarFile1?.raw) formData.append("aadhaarFront", c_aadhaarFile1.raw)
        if (c_aadhaarFile2?.raw) formData.append("aadhaarBack", c_aadhaarFile2.raw)
        if (c_panFile?.raw) formData.append("panCard", c_panFile.raw)
        if (c_bankProofFile?.raw) formData.append("bankProof", c_bankProofFile.raw)
      }

      console.log("📤 Submitting profile update...")

      const response = await fetch(`${API_URL}/employee/employee/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const responseData = await response.json()

      if (response.ok) {
        setMessageType("success")
        setMessage("Profile completed successfully!")
        console.log("✅ Profile updated successfully")
      } else {
        throw new Error(responseData.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("❌ Error:", error)
      setMessageType("error")
      setMessage(error.message || "Failed to update profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4002B] mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-8 pb-10">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2 text-center text-[#E4002B]">
          Complete Your Profile
        </h2>
        <p className="text-center text-gray-600 mb-6">{workerType} Employee</p>

        {/* Read-only basic info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#E4002B]">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Information (from Admin)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>{" "}
              <span className="font-semibold">{name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>{" "}
              <span className="font-semibold">{email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>{" "}
              <span className="font-semibold">{phone}</span>
            </div>
          </div>
        </div>

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
          {workerType === "Permanent" && (
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
                    value={p_gender}
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
                    value={p_dob}
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
                    value={p_highestQualification}
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
                    value={p_maritalStatus}
                    onChange={setPMaritalStatus}
                  />

                  <IconInput
                    icon={FaPhoneAlt}
                    label="Alternate Phone Number"
                    placeholder="+91 1234567890"
                    value={p_alternatePhone}
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
                    value={co_address1}
                    onChange={(e) => setCoAddress1(e.target.value)}
                    required
                  />

                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={co_address2}
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
                    value={co_state}
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
                    value={co_city}
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
                    value={co_pincode}
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
                    value={p_address1}
                    onChange={(e) => setPAddress1(e.target.value)}
                    required
                  />

                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={p_address2}
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
                    value={p_state}
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
                    value={p_city}
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
                    value={p_pincode}
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
                  {/* Father's Name - Required */}
                  <IconInput
                    icon={FaUser}
                    label={
                      <>
                        Father's Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Enter father's name"
                    value={p_fathersName}
                    onChange={(e) => setPFathersName(e.target.value)}
                    required
                  />

                  {/* Father's DOB - Required */}
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Father's DOB <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={p_fatherDob}
                    onChange={(e) => setPFatherDob(e.target.value)}
                    required
                  />

                  {/* Mother's Name - Required */}
                  <IconInput
                    icon={FaUser}
                    label={
                      <>
                        Mother's Name <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Enter mother's name"
                    value={p_motherName}
                    onChange={(e) => setPMotherName(e.target.value)}
                    required
                  />

                  {/* Mother's DOB - Required */}
                  <IconInput
                    icon={FaCalendarAlt}
                    label={
                      <>
                        Mother's DOB <span className="text-red-500">*</span>
                      </>
                    }
                    type="date"
                    value={p_motherDob}
                    onChange={(e) => setPMotherDob(e.target.value)}
                    required
                  />

                  {/* Spouse Name - Optional (only if married) */}
                  <IconInput
                    icon={FaUser}
                    label="Spouse Name (if applicable)"
                    placeholder="Enter spouse's name"
                    value={p_spouseName}
                    onChange={(e) => setPSpouseName(e.target.value)}
                  />

                  {/* Spouse DOB - Optional */}
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Spouse DOB"
                    type="date"
                    value={p_spouseDob}
                    onChange={(e) => setPSpouseDob(e.target.value)}
                  />

                  {/* Child 1 Name - Optional */}
                  <IconInput
                    icon={FaUser}
                    label="Child 1 Name"
                    placeholder="Enter child 1's name"
                    value={p_child1Name}
                    onChange={(e) => setPChild1Name(e.target.value)}
                  />

                  {/* Child 1 DOB - Optional */}
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Child 1 DOB"
                    type="date"
                    value={p_child1Dob}
                    onChange={(e) => setPChild1Dob(e.target.value)}
                  />

                  {/* Child 2 Name - Optional */}
                  <IconInput
                    icon={FaUser}
                    label="Child 2 Name"
                    placeholder="Enter child 2's name"
                    value={p_child2Name}
                    onChange={(e) => setPChild2Name(e.target.value)}
                  />

                  {/* Child 2 DOB - Optional */}
                  <IconInput
                    icon={FaCalendarAlt}
                    label="Child 2 DOB"
                    type="date"
                    value={p_child2Dob}
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
                    value={p_aadhaar}
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
                    value={p_pan}
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
                    value={p_uan}
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
                    value={p_pf}
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
                    value={p_esi}
                    onChange={(e) => setPEsi(e.target.value)}
                    required
                  />

                  <IconInput
                    icon={FaBuilding}
                    label="ESI Dispensary Location"
                    placeholder="Enter location"
                    value={p_esiDispensary}
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
                    value={p_bankName}
                    onChange={(e) => setPBankName(e.target.value)}
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
                    value={p_bankAccount}
                    onChange={(e) => setPBankAccount(e.target.value.replace(/\D/g, ""))}
                    required
                  />

                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Confirm Account Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="123456789012"
                    value={p_confirmBankAccount}
                    onChange={(e) => setPConfirmBankAccount(e.target.value.replace(/\D/g, ""))}
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
                    value={p_ifsc}
                    onChange={(e) => setPIfsc(e.target.value.toUpperCase())}
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
                    value={p_branchName}
                    onChange={(e) => setPBranchName(e.target.value)}
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
                        placeholder=""
                        value={exp.from}
                        onChange={(e) => updateExperience(idx, "from", e.target.value)}
                        required
                      />

                      {!exp.currentlyWorking && (
                        <IconInput
                          icon={FaCalendarAlt}
                          label={
                            <>
                              To <span className="text-red-500">*</span>
                            </>
                          }
                          type="date"
                          placeholder=""
                          value={exp.to}
                          onChange={(e) => updateExperience(idx, "to", e.target.value)}
                          required
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        id={`currentlyWorking-${idx}`}
                        checked={!!exp.currentlyWorking}
                        onChange={(e) => {
                          const checked = e.target.checked
                          updateExperience(idx, "currentlyWorking", checked)
                          if (checked) {
                            updateExperience(idx, "to", "")
                          }
                        }}
                        className="w-4 h-4 accent-[#E4002B] cursor-pointer"
                      />
                      <label htmlFor={`currentlyWorking-${idx}`} className="text-sm text-gray-700 cursor-pointer">
                        Currently Working Here
                      </label>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-2 text-[#E4002B] hover:underline"
                  >
                    <FaPlus /> Add Another Experience
                  </button>
                </div>
              </section>

              {/* File Uploads */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#E4002B]">File Uploads</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-red-500">*</span> Accepted formats: PNG, JPG, JPEG, PDF — less than 1 MB
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileInput
                    label="Your Photo"
                    accept="image/*"
                    file={p_personPhoto}
                    setFile={setPPersonPhoto}
                    required
                  />
                  <FileInput
                    label="Aadhaar (front)"
                    accept="image/*,.pdf"
                    file={p_aadhaarFile1}
                    setFile={setPAadhaarFile1}
                    required
                  />
                  <FileInput
                    label="Aadhaar (back)"
                    accept="image/*,.pdf"
                    file={p_aadhaarFile2}
                    setFile={setPAadhaarFile2}
                    required
                  />
                  <FileInput
                    label="PAN Card"
                    accept="image/*,.pdf"
                    file={p_panFile}
                    setFile={setPPanFile}
                    required
                  />
                  <FileInput
                    label="Bank Proof"
                    accept="image/*,.pdf"
                    file={p_bankProofFile}
                    setFile={setPBankProofFile}
                    required
                  />
                  <FileInput
                    label="Family Photo"
                    accept="image/*"
                    file={p_familyPhoto}
                    setFile={setPFamilyPhoto}
                  />
                  <FileInput label="PF Form" accept="image/*,.pdf" file={p_pfForm} setFile={setPPfForm} required />
                  <FileInput label="ESI Form" accept="image/*,.pdf" file={p_esiForm} setFile={setPEsiForm} required />
                  <FileInput
                    label="Employment Form"
                    accept="image/*,.pdf"
                    file={p_employmentForm}
                    setFile={setPEmploymentForm}
                  />
                  <FileInput label="Copy of CV" accept="image/*,.pdf" file={p_cv} setFile={setPCv} />
                </div>
              </section>
            </>
          )}

          {workerType === "Contractual" && (
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
                    value={c_dob}
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
                    value={c_contractLength}
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
                    value={c_address1}
                    onChange={(e) => setCAddress1(e.target.value)}
                    required
                  />

                  <IconInput
                    icon={FaFileAlt}
                    label="Address Line 2"
                    placeholder="Landmark, locality"
                    value={c_address2}
                    onChange={(e) => setCAddress2(e.target.value)}
                  />

                  <IconInput
                    icon={FaBuilding}
                    label={
                      <>
                        State <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="Delhi"
                    value={c_state}
                    onChange={(e) => setCState(e.target.value)}
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
                    value={c_city}
                    onChange={(e) => setCCity(e.target.value)}
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
                    value={c_pincode}
                    onChange={(e) => setCPincode(e.target.value.replace(/\D/g, ""))}
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
                    value={c_aadhaar}
                    onChange={(e) => setCAadhaar(e.target.value.replace(/\D/g, ""))}
                    maxLength={12}
                    required
                  />

                  <IconInput
                    icon={FaIdCard}
                    label="PAN Number"
                    placeholder="ABCDE1234F"
                    value={c_pan}
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
                    value={c_bankName}
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
                    value={c_bankAccount}
                    onChange={(e) => setCBankAccount(e.target.value.replace(/\D/g, ""))}
                    required
                  />

                  <IconInput
                    icon={FaSortNumericDownAlt}
                    label={
                      <>
                        Confirm Account Number <span className="text-red-500">*</span>
                      </>
                    }
                    placeholder="123456789012"
                    value={c_confirmBankAccount}
                    onChange={(e) => setCConfirmBankAccount(e.target.value.replace(/\D/g, ""))}
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
                    value={c_ifsc}
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
                    value={c_branchName}
                    onChange={(e) => setCBranchName(e.target.value)}
                    required
                  />
                </div>
              </section>

              {/* File Uploads */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-[#E4002B]">File Uploads</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-red-500">*</span> Accepted formats: PNG, JPG, JPEG, PDF — less than 1 MB
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileInput
                    label="Your Photo"
                    accept="image/*"
                    file={c_personPhoto}
                    setFile={setCPersonPhoto}
                    required
                  />
                  <FileInput
                    label="Aadhaar (front)"
                    accept="image/*,.pdf"
                    file={c_aadhaarFile1}
                    setFile={setCAadhaarFile1}
                    required
                  />
                  <FileInput
                    label="Aadhaar (back)"
                    accept="image/*,.pdf"
                    file={c_aadhaarFile2}
                    setFile={setCAadhaarFile2}
                    required
                  />
                  <FileInput label="PAN Card" accept="image/*,.pdf" file={c_panFile} setFile={setCPanFile} />
                  <FileInput
                    label="Bank Proof"
                    accept="image/*,.pdf"
                    file={c_bankProofFile}
                    setFile={setCBankProofFile}
                    required
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
  )
}

export default Profile
