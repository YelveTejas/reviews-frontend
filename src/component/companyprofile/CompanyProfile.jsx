import React, { useEffect, useRef, useState } from "react";
import DrawerWrapper from "../SellerSidebar";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import UploadCertificate from "../../Auth/Signup/UploadCertificate";
import axios from "axios";
 import domtoimage from "dom-to-image";
import { useToast } from "../../../../assets/Components/useToast";
import ProfileUploadCertificate from "./ProfileUploadCertificate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Config from "../../../../config/Config";
import brandApi from "../../api/brandApi";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import EditIconSign from "../../icons/icon_edit.svg";
import { useToasts } from "../useToasts";
import Loader from "../../../../assets/Components/Loader/Loader";
const CompanyProfile = () => {
  const { auth } = useSelector((state) => state?.auth);
  const [loadingImage, setLoadingImage] = useState(false);
  const ShowToast = useToasts();
  const [isDrawing, setIsDrawing] = useState(false);
  const [editing, setisEditing] = useState(false);
  const [states, setStates] = useState([]);
  const [signatureType, setSignatureType] = useState("digital");
  const [digitalSignature, setDigitalSignature] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const canvasRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [penColor, setPenColor] = useState("black");
  const [cities, setCities] = useState([]);
  
  const apiKey = "S2x4aDdlaU1wTmdXTDRabm9qTTlaanI5M0M5S0ZXRjZ3WHdUQUdnSA==";

  const headers = {
    Authorization: `Bearer ${auth?.token}`,
    "Content-Type": "multipart/form-data",
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (key) => (file) => {
    // setData((prevData) => ({ ...prevData, [key]: file }));
  const validTypes = ['image/jpeg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    // alert('Please upload a .jpg, .jpeg, or .png file.');
    ShowToast({ status: "error", message: "Please upload a .jpg, .jpeg, or .png file." });
    return;
  }

  setData((prevData) => ({ ...prevData, [key]: file }));
  };
  const handleSignatureTypeChange = (e) => {
    setSignatureType(e.target.value);
    if (e.target.value === "digital") {
      setImageFile(null); // Clear uploaded file if switching to digital signature
      setDigitalSignature(null); // Clear digital signature if switching to file upload
    } else {
      setDigitalSignature(null); // Clear digital signature if switching to file upload
    }
  };
  
  const handleDigitalSignature = async () => {
    if (canvasRef.current) {
      const dataUrl = await domtoimage.toPng(canvasRef.current);
      const blob = await fetch(dataUrl).then(res => res.blob());
      
      
      const digitalSignatureFile =  new File([blob], "signature.png", { type: "image/png" });
      setDigitalSignature(digitalSignatureFile);
      setData((prevData) => ({ ...prevData, signature: digitalSignatureFile }));
      return new File([blob], "signature.png", { type: "image/png" });
    }
    return null
  }
  useEffect(() => {
    axios
      .get(`https://api.countrystatecity.in/v1/countries/IN/states`, {
        headers: { "X-CSCAPI-KEY": apiKey },
      })
      .then((response) => {
        setStates(response.data);
      })
      .catch((error) => {
        console.error("Error fetching states:", error);
      });
  }, []);

  useEffect(() => {
    if (data.state) {
      axios.get(`https://api.countrystatecity.in/v1/countries/IN/states/${data.state}/cities`,
          {
            headers: { "X-CSCAPI-KEY": apiKey },
          }
        )
        .then((response) => {
          setCities(response.data);
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
        });
    }
  }, [data.state]);

  const handleCityChange = (value) => {
    setData((prevData) => ({ ...prevData, city: value }));
  };

  useEffect(() => {
    const getdata = async () => {
      setLoading(true);
      try {
        const result = await axios.get(
          `${Config.url}${brandApi.Companyprofile}`,
          { headers }
        );
        setLoading(false);
        console.log(data,"compnay data")
        setData(result?.data?.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    getdata();
  }, []);
  

  const handleEdit = () => {
    setisEditing(!editing);
  };

  const validateFields = () => {
    let tempErrors = {};
    if (!data.address) tempErrors.address = "Address is required";
    if (!data.locality) tempErrors.locality = "Locality is required";
    if (!data.state) tempErrors.state = "State is required";
    if (!data.city) tempErrors.city = "City is required";
    if (!data.pincode) tempErrors.pincode = "Pincode is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  
  console.log(signatureType,"signatureType")
  /**
   * Handles the submission of the company profile form
   * Validates the fields, uploads the required files and sends a POST request to the server
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    if (!validateFields()) {
      ShowToast({ message: "Please fill all required fields", status: "info" });
      return;
    }
    const formdata = new FormData();

    if (signatureType === "digital") {
      const digitalSignatureFile = await handleDigitalSignature();
      if (digitalSignatureFile) {
        formdata.append("signature", digitalSignatureFile);
      } else {
        formdata.append("signature", data.signature);
      }
      formdata.append("signature_type", 1);
    } else if (signatureType === "upload" && imageFile) {
      formdata.append("signature", imageFile); // Append the file directly
      formdata.append("signature_type", 0);
    }
    formdata.append("cancelled_cheque", data.cancelled_cheque);
    formdata.append("address", data.address || "");
    formdata.append("license_docs", data.license_docs || "");
    formdata.append("locality", data.locality || "");
    formdata.append("state", data.state || "");
    formdata.append("city", data.city || "");
    formdata.append("pincode", data.pincode || "");
    formdata.append("logo", data.logo || "");
    setLoading(true);

    try {
      const result = await axios.post(
        `${Config.url}${brandApi.UpdateProfile}/${data?.company_uid}`,
        formdata,
        { headers }
      );

      ShowToast({ message: result?.data?.message, status: "success" });
      setData((prevData) => ({
        ...prevData,
        signature: result?.data?.data?.signature,
      }));
      setLoading(false);
      setisEditing(!editing);
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };
  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const context = canvasRef.current.getContext("2d");
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = penColor;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const clearCanvas = () => {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setImageFile(files[0]); // Store the file object
      setData((prevData) => ({ ...prevData, [name]: files[0] }));
    }
  };

  console.log(data,"compnay data")
  return (
    <DrawerWrapper>
      {loading && <Loader />}
      <div className="mb-2">
        <div className="bg-[#FFF2E6] md:px-3 px-2 py-2 md:py-3 flex flex-row justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="">
              <Avatar
                className="overflow-hidden"
                src={data.logo}
                alt="logo"
                sx={{ width: 48, height: 48 }}
              />
            </div>

            <div>
              <text className=" text-xl md:text-2xl font-bold">{data.company_name} </text>
            </div>
          </div>
          <div>
            {editing && (
              <button
                onClick={handleSubmit}
                className="px-2 py-1 mr-1 bg-black text-white rounded-full"
              >
                {loading ? "updating..." : "UPDATE"}
              </button>
            )}
            {!editing && (
              <ModeEditIcon
                sx={{
                  cursor: "pointer",
                }}
                onClick={handleEdit}
              />
            )}
          </div>
        </div>
        <div className="p-3 md:p-3 bg-[#F9F9F9]">
          <div className="d-flex w-full md:w-[40%]  flex-col gap-1 md:gap-2 mt-2 md:mt-0">
            <div>
              <h1 className="text-lg md:text-xl font-bold">Company Details</h1>
              <div>
                <div className="dashed-line"></div>
              </div>
            </div>
            <div>
            <div className="d-flex flex-col gap-1">
              <label className="text-lg md:font-medium">
                Government Registered Company Name
              </label>
              <input
                className={`border-1 w-full rounded-full p-1 md:p-2 md:mt-1`}
                id="holder-name"
                placeholder="Enter registered company name"
                value={data.company_name || ""}
                name="company_name"
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="d-flex flex-col gap-1">
              <label>Registration Number</label>
              <input
                className={`border-1 w-full rounded-full p-1 md:p-2 mt-1 `}
                placeholder="Enter registration number"
                name="registration_number"
                value={data.registration_number}
                onChange={handleChange}
                readOnly
              />
            </div>
            <ProfileUploadCertificate
              buttonText={`${editing ? "+ Update" : ""} Brand Logo`}
              uniqueKey={"logo"}
              setisEditing={setisEditing}
              onUpload={handleFileUpload("logo")}
              fileURL={data.logo}
              editing={editing}
              accept=".jpg,.jpeg,.png" 
            />
            <ProfileUploadCertificate
              buttonText={`${editing ? "+ Update" : ""} Cancelled Checque`}
              uniqueKey={"cancelled_cheque"}
              setisEditing={setisEditing}
              onUpload={handleFileUpload("cancelled_cheque")}
              fileURL={data.cancelled_cheque}
              editing={editing}
            />
            </div>

         

         <ProfileUploadCertificate
              buttonText={`${editing ? "+ Update" : ""} License Document`}
              uniqueKey={"license_docs"}
              setisEditing={setisEditing}
              onUpload={handleFileUpload("license_docs")}
              fileURL={data.license_docs}
              editing={editing}
            />
            {
              !editing ?  (
              <ProfileUploadCertificate
              buttonText={`${editing ? "+ Update" : ""} Signature`}
              uniqueKey={"signature"}
              fileURL={data.signature}
              onUpload={handleFileUpload("signature")}
              editing={editing}
            />
              ):(
                ""
              )
            }
              
          </div>
          {
            editing ? (
              <div className=" w-[400px] mt-10">
              <div className="d-flex flex-col gap-3">
              <div className="company-info">
                <div className="signature-type">
                  <label className="two-signature-button">
                    <input
                      type="radio"
                      value="digital"
                      checked={signatureType === "digital"}
                      onChange={handleSignatureTypeChange}
                      className="radioButtonColor"
                    />
                    Digital Sign
                  </label>
                  <label className="two-signature-button">
                    <input
                      type="radio"
                      value="upload"
                      checked={signatureType === "upload"}
                      onChange={handleSignatureTypeChange}
                      className="radioButtonColor"
                    />
                    Upload Signature
                  </label>
                </div>
                {signatureType === "digital" ? (
                  <div className="p-2 w-full md:max-w-[350px]">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseUp={endDrawing}
                      onMouseMove={draw}
                      width="320"
                      height="150"
                    ></canvas>
                    <div className="pen-colors">
                      <button
                        type="button"
                        className="color-btn btn-all-color clear"
                        onClick={clearCanvas}
                      >
                        <img src={EditIconSign} alt="" />
                      </button>
                      <button
                        type="button"
                        className="color-btn btn-all-color black"
                        onClick={() => setPenColor("black")}
                      ></button>
                      <button
                        type="button"
                        className="color-btn btn-all-color red"
                        onClick={() => setPenColor("red")}
                      ></button>
                      <button
                        type="button"
                        className="color-btn btn-all-color blue"
                        onClick={() => setPenColor("blue")}
                      ></button>
                    </div>
                  </div>
                ) : (
                  <div className="file-drag-drop">
                    <div className="file-dropzone file-droup-sec">
                      <div>
                        <input
                          type="file"
                          required
                          name="signature"
                          onChange={handleImageChange}
                        />
                      </div>
    
                      <div className="drag-dop-section file-drag-drop-second">
                        <div className="drag">
                          <p style={{ color: "orangered" }}>Drag Images</p>
                          <CloudUploadIcon style={{ color: "orangered" }} />
                        </div>
                        <div className="drag">
                          <p>or</p>
                        </div>
                        <div className="drag">
                          <p className="upload-signature">Upload Sign</p>
                        </div>
                      </div>
                      {loadingImage && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      )}
                      {!loadingImage && imageFile && (
                        <p className="file-name upload-signature">
                          Upload Sign {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
             
              </div>
              </div>
               </div>
            ):(
                ""
            )
          }
          
        </div>
        <div className="p-3 md:p-3  bg-[#F9F9F9] rounded-b-lg">
          <div className="d-flex w-full md:w-[40%]  flex-col gap-1 md:gap-2">
            <div>
              <h1 className="text-xl font-bold">Tax Information</h1>
              <div>
                <div className="dashed-line"></div>
              </div>
            </div>

            <div className="d-flex flex-col gap-1">
              <ProfileUploadCertificate
                buttonText={"+ Update GST certificate"}
                uniqueKey={"gst_certificate"}
                fileURL={data.gst_certificate}
                onUpload={handleFileUpload("gst_certificate")}
              />
              <label className="font-medium">Gst Number</label>

              <input
                className={`border-1 w-full rounded-full  p-1 md:p-2 mt-1`}
                id="holder-name"
                placeholder="Gst Number"
                value={data.gst_number || ""}
                name="gst_number"
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="d-flex flex-col gap-1">
              <label>Tan Number</label>
              <input
                className={`border-1 w-full rounded-full  p-1 md:p-2 mt-1 `}
                placeholder="Enter registration number"
                name="tan_number"
                value={data.tan_number || ""}
                readOnly
              />
            </div>
            <div className="d-flex flex-col gap-1">
              <label>Pan Number</label>
              <input
                className={`border-1 w-full rounded-full  p-1 md:p-2 mt-1 `}
                placeholder="Enter registration number"
                name="pan_number"
                value={data.pan_number}
                readOnly
              />
            </div>
            <div className="">
              <div>
                <text className="font-medium">Address</text>
              </div>
              <input
                className={`border-1 w-full rounded-full  p-1 md:p-2 mt-1 `}
                name="address"
                placeholder="Enter Company Registered Address"
                value={data.address || ""}
                onChange={handleChange}
                readOnly={!editing}
              />
               {errors.address && <span className="text-red-500">{errors.address}</span>}

              <input
                className={`border-1 w-full rounded-full  p-1 md:p-2 mt-2 `}
                name="locality"
                placeholder="Locality"
                value={data.locality || ""}
                onChange={handleChange}
                readOnly={!editing}
              />
              {errors.locality && <span className="text-red-500">{errors.locality}</span>}
              <div className="d-flex flex-col md:flex-row md:gap-3">
                <select
                  placeholder="State"
                  name="state"
                  value={data.state || ""}
                  onChange={handleChange}
                  className={`border-1 w-full rounded-full p-1 mt-2 `}
                  disabled={!editing}
                >
                  <option value="">State</option>
                  {
                    states.map((e) => (
                      <option key={e.iso2} value={e.iso2}>
                        {e.name}
                      </option>
                    ))}
                </select>
                {errors.state && <span className="text-red-500">{errors.state}</span>}
                <select
                  placeholder="City"
                  name="city"
                  value={data.city || ""}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className={`border-1 w-full rounded-full p-1 mt-2 `}
                >
                  <option value="">City</option>
                  {cities.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
                {errors.city && <span className="text-red-500">{errors.city}</span>}
                <input
                  className={`border border-gray-300 w-full rounded-full p-1 mt-2  `}
                  name="pincode"
                  type="number"
                  placeholder="Pincode"
                  maxLength={6}
                  value={data.pincode || ""}
                  onChange={handleChange}
                  readOnly={!editing}
                />
                 {errors.pincode && <span className="text-red-500">{errors.pincode}</span>}
              </div>
            </div>            
          </div>
        </div>
      </div>
    </DrawerWrapper>
  );
};

export default CompanyProfile;

