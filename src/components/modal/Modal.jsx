import ModalContainer from "./Modal";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../consts";
import qr from './qr.jpeg'
function Modal({ userDetails, setUserDetails }) {
  const [step, setStep] = useState(0);
  const [isLoadingUP, setIsLoadingUP] = useState(false);
  const [isLoadingVOTP, setIsLoadingVOTP] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step5Loading, setStep5Loading] = useState(false);
  const [step6Loading, setStep6Loading] = useState(false);
  const [userVerificationOTPEmailLoading,setUserVerificationOTPEmailLoading]=useState(false)
  const [userVerificationOTPTelegramLoading,setUserVerificationOTPTelegramLoading]=useState(false)

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [chatIdVerificationLoading,setChatIdVerificationLoading]=useState(false)
  const [chatIdOtpSent,setChatIdOtpSent]=useState(false)
  const [chatIdOtp,setChatIdOtp]=useState(0)
  const [chatIdLoading,setChatIdLoading]=useState(false)
  const [serviceLoading,setServiceLoading]=useState(false)
  const [verificationOtp,setVerificationOtp]=useState(0)
  const [verificationLoading,setVerificationLoading]=useState(false)
  const [otpStatus,setOtpStatus]=useState(false)
  const [isLoadingFR,setIsLoadingFR]=useState(false)
  const [showRes,setShowRes]=useState(false)
  const [resMsg,setResMsg]=useState('')
  const [file,setFile]=useState(null)
  const [trans,setTrans]=useState([])
  const [transLoading,setTransLoading]=useState(false)
  const [showTrans,setShowTrans]=useState(false)
  const updateProfile = () => {
    if (userDetails.isEmailVerified && userDetails.isTelegramVerified&&userDetails.isPhoneNumVerified) {
      notifySuccess("Your profile is updated. Proceed to next step");
      return;
    } else {
      setStep(1);
    }
  };

  let getDate=(x)=>{
    // return new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(x)
    const date = new Date(x * 1000);

    // Get date and time components
    const dateString = date.toLocaleDateString(); // Date in format MM/DD/YYYY
    const timeString = date.toLocaleTimeString();

    return dateString+' '+timeString
  }

  const notifySuccess = (x) =>
    toast.success(x, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  const notifyError = (x) =>
    toast.error(x, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const completeTrans=async()=>{
    setTransLoading(true)
    const res=await axios.post(`${global.baseUrl}transaction?accountno=${userDetails.accountno}`,null)
    if(res.data.status=='success'){
      const result=await axios.get(`${global.baseUrl}transaction?accountno=${userDetails.accountno}`)
      if(result.data.status=='success'){
        setTrans(result.data.payload)
        setShowTrans(true)
      }
      else{
        notifyError(result.data.message)
      }
    }
    else{
      notifyError(res.data.message)
    }
    setTransLoading(false)
    
  }
  const getTrans=async()=>{
    setTransLoading(true)
    const result=await axios.get(`${global.baseUrl}transaction?accountno=${userDetails.accountno}`)
      if(result.data.status=='success'){
        setTrans(result.data.payload)
        setShowTrans(true)
      }
      else{
        notifyError(result.data.message)
      }
    setTransLoading(false)

  }
  const sendEmailOtp = async () => {
    setStep2Loading(true);
    let result = await axios.post(
      global.baseUrl + "sendmail?email=" + userDetails.email
    );
    if (result.data.status == "success") {
      setOtpSent(true);
      notifySuccess(result.data.message);
    } else {
      notifyError(result.data.message);
    }
    setStep2Loading(false);
  };

  const verifyOtp = async () => {
    if (otp.trim().length === 0) {
      notifyError("Enter valid otp");
      return;
    }
    setOtpVerificationLoading(true);
    let data = {
      service: "email",
      identifier: userDetails.email,
      otp: otp.toString(),
      timestamp: 0,
    };
    let result = await axios.post(global.baseUrl + "verify-email-otp", data);
    if (result.data.status == "success") {
      setOtpSent(true);
      notifySuccess(result.data.message);
      let data = { ...userDetails };
      data.isEmailVerified = true;
      setUserDetails(data);
      if (userDetails.isTelegramVerified) {
        setStep(0);
      } else {
        setStep(1);
      }
    } else {
      notifyError(result.data.message);
    }
    setOtpVerificationLoading(false);
  };

  const updateTelegramId=async()=>{
      if(userDetails.telegramChatId.trim().length==0){
        notifyError("Enter valid Id")
        return
      }
      setChatIdVerificationLoading(true)
     let result= await axios.get(global.baseUrl+`update-telegram-id?accountno=${userDetails.accountno}&telegramId=${userDetails.telegramChatId}`)
     console.log(result.data)
     if(result.data.status=='success'){
      notifySuccess(result.data.message)
      setChatIdOtpSent(true)
     }
     else{
      notifyError(result.message)
     }
     setChatIdVerificationLoading(false)
  }

  const verifyTelegramOtpId=async()=>{
    setChatIdLoading(true)
    let body={"service":"telegram",
    "identifier":userDetails.telegramChatId.toString(),
    "otp":chatIdOtp,
    "timestamp":0}
    let result=await axios.post(global.baseUrl+"verify-chat-id",body)
    if(result.data.status=='success'){
      notifySuccess(result.data.message)
      let temp={...userDetails}
      temp.isTelegramVerified=true
      setUserDetails(temp)
      if(userDetails.isEmailVerified){
        setStep(0)
      }
      else{
        setStep(1)
      }
    }
    else{
      notifyError(result.data.message)
    }
    setChatIdLoading(false)
  }

  const sendUserVerificationOtp=async(service)=>{
      setServiceLoading(true)
      let res
      if(service=='email'){
        setUserVerificationOTPEmailLoading(true)
        res=await axios.post(global.baseUrl+`sendmail?email=${userDetails.email}`)
        if(res.data.status=='success'){
          notifySuccess(res.data.message)
          setStep(5)
        }
        else{
          notifyError(res.data.error)
        }
        setUserVerificationOTPEmailLoading(false)

      }
      else{
        setUserVerificationOTPTelegramLoading(true)

        res=await axios.post(global.baseUrl+`send-telegram-otp`,{
          "chatId": userDetails.telegramChatId.toString(),
          "otp": ""
        })
        if(res.data.status=='success'){
          notifySuccess(res.data.message)
          setStep(6)
        }
        else{
          notifyError(res.data.error)
        }
        setUserVerificationOTPTelegramLoading(false)

      }
      setServiceLoading(false)
  }

  const verifyUserOtp=async(service)=>{
    setVerificationLoading(true)
    let res
    if(service=='email'){
      setStep5Loading(true)
      res=await axios.post(global.baseUrl+`verify-email-otp`,{
        "service": "email",
        "identifier": userDetails.email,
        "otp": verificationOtp.toString(),
        "timestamp": 0
      })
      if(res.data.status=='success'){
        notifySuccess(res.data.message)
        setOtpStatus(true)
        console.log("Email verified")
        setStep(0)
      }
      else{
        notifyError(res.data.error)
      }
      setStep5Loading(false)

    }
    else{
      setStep6Loading(true)

      res=await axios.post(global.baseUrl+`verify-telegram-otp`,{
        "service": "telegram",
        "identifier": userDetails.telegramChatId.toString(),
        "otp": verificationOtp.toString(),
        "timestamp": 0
      })
      if(res.data.status=='success'){
        notifySuccess(res.data.message)
        setOtpStatus(true)
        console.log("telegram verified")
        setStep(0)
      }
      else{
        notifyError(res.data.error)
      }
      setStep6Loading(false)

    }
    setVerificationLoading(false)
  }

  const uploadImage=async()=>{
    if(file==null){
      notifyError("Upload file")
      return
    }
    console.log(file)
    const formData = new FormData();
    formData.append('file', file);
    let res=await axios.post(global.baseUrl+"upload?accountno="+userDetails.accountno,formData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    if(res.data.status=='success'){
      let temp={...userDetails}
      if(userDetails.isTelegramVerified&&userDetails.isEmailVerified){
        setStep(0)
      }
      temp.isPhoneNumVerified=true
      setUserDetails(temp)
      notifySuccess(res.data.message)
    }
    else{
      notifyError(res.data.message)
    }
  }

  const faceVerification=async()=>{
      setIsLoadingFR(true)
      let res= await axios.post(global.baseUrl+`face-verify?acc_id=${userDetails.accountno}`)
      if(res.data.status=='success'){
        setShowRes(true)
        if(res.data.message){
          setResMsg("You can proceed to Transaction")
        }
        else{
        setResMsg("Unauthorised Access")
        }
      }
      setIsLoadingFR(false)
  }

  return (
    <ModalContainer>
      <button
        class="btn btn-outline-primary"
        onClick={() => {
          setStep(0);
        }}
        data-bs-toggle="modal"
        data-bs-target="#steps"
      >
        Start
      </button>
      {/* Modal */}
      <div class="modal modal-lg  fade" id="steps" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">

            {!showRes&&
            <div>

            {/* step - 0 */}
            {step == 0 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                {/* Heading */}
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      Complete Below Steps
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>

                <div className="d-flex gap-2 justify-content-around">
                  {/* Update profile */}
                  <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                    <div>Step-1</div>
                    <img
                      width={200}
                      height={200}
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjJvFh9aVNg7nx-nGqNto13G3mZrVMNXBYA&usqp=CAU"
                      alt=""
                    />
                    {!isLoadingUP && (
                      <button
                        class="btn btn-outline-primary"
                        onClick={updateProfile}
                      >
                        Update Profile
                      </button>
                    )}
                    {isLoadingUP && (
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </div>

                  {/*  OTP */}
                  <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                    <div>Step-2</div>
                    <img
                      width={200}
                      height={200}
                      src="https://www.krishakjagat.org/wp-content/uploads/2020/08/OTP.jpg"
                      alt=""
                    />
                    {!isLoadingVOTP && (
                      <button
                        class="btn btn-outline-primary"
                        onClick={()=>{setStep(4)}}
                        disabled={(!userDetails.isEmailVerified&&!userDetails.isTelegramVerified&&!userDetails.isPhoneNumVerified)||otpStatus}
                      >
                        Verify OTP
                       
                      </button>
                    )}
                    {isLoadingVOTP && (
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </div>

                  {/*   face recognition */}
                  <div className="d-flex flex-column justify-content-center align-items-center gap-3">
                      <div >Step-3</div>
                      <img width={200} src="https://www.inventicons.com/uploads/iconset/1629/wm/512/facial-recognition-13.png" alt="" />
                    {!isLoadingFR &&
                          <button class="btn btn-outline-primary" onClick={faceVerification}
                          disabled={!otpStatus}
                          >Face Verification</button>
                      }
                      {isLoadingFR &&
                          <div class="spinner-border" role="status">
                              <span class="visually-hidden">Loading...</span>
                          </div>

                      }

                                    </div>

                  
                </div>
              </div>
            )}
            {step == 1 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex flex-column h-100 w-100 justify-content-center align-items-center gap-3">
                  <button
                    class="btn btn-outline-primary w-25"
                    onClick={() => {
                      setStep(2);
                    }}
                    disabled={userDetails.isEmailVerified}
                  >
                    Verify Email
                  </button>

                  <button
                    class="btn btn-outline-primary w-25"
                    onClick={() => {
                      setStep(3);
                    }}
                    disabled={userDetails.isTelegramVerified}
                  >
                    Verify Telegram
                  </button>
                  <div className="w-25">
                    <input type="file" onChange={(e)=>{
                      console.log(e.target.files[0])
                      setFile(e.target.files[0])}} className="form-control" />
                    <button className="btn btn-outline-primary w-100 mt-2"
                    onClick={uploadImage}
                        disabled={userDetails.isPhoneNumVerified}
                    >Upload Image</button>
                  </div>
                </div>
              </div>
            )}

            {/* step 2 */}

            {step == 2 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      Link your Email Id
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="d-flex flex-column h-100 w-100 justify-content-center align-items-center gap-3">
                  <input
                    type="text"
                    className="form-control w-50"
                    value={userDetails.email}
                  />
                  {!step2Loading && (
                    <button
                      class="btn btn-outline-primary w-25"
                      onClick={() => {
                        sendEmailOtp();
                      }}
                    >
                      SendOtp
                    </button>
                  )}
                  {step2Loading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                  {otpSent && (
                    <input
                      type="number"
                      className="form-control w-50"
                      onChange={(e) => {
                        setOtp(e.target.value);
                      }}
                    />
                  )}
                  {otpSent && !otpVerificationLoading && (
                    <button
                      class="btn btn-outline-primary w-25"
                      onClick={() => {
                        verifyOtp();
                      }}
                    >
                      Verify Otp
                    </button>
                  )}
                  {otpVerificationLoading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {step == 3 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      Link your Telegram account
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="d-flex  h-100 w-100 justify-content-around align-items-center gap-3">
                  <div>
                    <img src={qr} height={200} width={200} alt="" />
                  </div> 
                  <div>
                        <ol>
                          <li>scan the QR code and use the following command </li>
                          <pre className="fw-bold fs-5">/signin</pre>
                          <div>
                          <label  className="form-label ">Enter your Telegram Id</label>
                            <input type="number" onChange={(e)=>{
                              let temp={...userDetails}
                              temp.telegramChatId=e.target.value
                              setUserDetails(temp)
                            }} className="form-control"/>
                            {!chatIdVerificationLoading&&<button className="btn btn-primary mt-2" onClick={updateTelegramId}>Submit</button>}
                            {chatIdVerificationLoading&& <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>}
                            {chatIdOtpSent&&<div>
                              <div>

                                <label  className="form-label ">Enter your OTP</label>
                                <input type="number" onChange={(e)=>{
                                  setChatIdOtp(e.target.value)
                                }} className="form-control"/>
                              </div>
                               {!chatIdLoading &&<div className="mt-2">
                                  <button className="btn btn-primary" onClick={verifyTelegramOtpId}>Verify </button>
                                </div>
                                }
                                {chatIdLoading&&<div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>}
                            </div>
                            }

                          </div>
                        </ol>
                  </div>
                </div>
              </div>
            )}

            {/* step 4 */}
            {step == 4 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      VERIFY OTP
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="d-flex justify-content-center gap-3 align-items-center h-100 w-100">
                 
                 {!userVerificationOTPEmailLoading&& <button className="btn btn-outline-primary" onClick={()=>{sendUserVerificationOtp('email')}}>
                    Email
                    </button>
                  }  
                  {userVerificationOTPEmailLoading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                    {!userVerificationOTPTelegramLoading&&<button className="btn btn-outline-primary" onClick={()=>{sendUserVerificationOtp('telegram')}}>

                    Telegram
                    </button>
                    }
                    {userVerificationOTPTelegramLoading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* step 5 */}
              {step == 5 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      VERIFY OTP
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="d-flex justify-content-center gap-3 align-items-center h-100 w-100">
                <input
                    type="text"
                    className="form-control w-50"
                    onChange={(e)=>{setVerificationOtp(e.target.value)}}
                  />
                  {!step5Loading && (
                    <button
                      class="btn btn-outline-primary w-25"
                      onClick={() => {
                        verifyUserOtp('email');
                      }}
                    >
                      Verify Otp
                    </button>
                  )}
                  {step5Loading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* step 6 */}

              {step == 6 && (
              <div class="modal-body pb-3" style={{ height: "400px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      VERIFY OTP
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="d-flex justify-content-center gap-3 align-items-center h-100 w-100">
                <input
                    type="text"
                    className="form-control w-50"
                    onChange={(e)=>{setVerificationOtp(e.target.value)}}
                  />
                  {!step6Loading && (
                    <button
                      class="btn btn-outline-primary w-25"
                      onClick={() => {
                        verifyUserOtp('telegram');
                      }}
                    >
                      Verify Otp
                    </button>
                  )}
                  {step6Loading && (
                    <div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>}

          
          {showRes&&!showTrans&&
              <div>
                 <div class="modal-body pb-3" style={{ height: "400px" }}>

                 <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      Status
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                  <div className="d-flex justify-content-center flex-column align-items-center gap-5">

                  <div className="display-6 text-primary text-center">
                    {resMsg}
                  </div>
                  {resMsg=='You can proceed to Transaction'&&
                      <div className="d-flex flex-column gap-3 w-50">
                        {!transLoading&&<button className="btn btn-outline-primary " onClick={completeTrans}>Complete Transaction</button>}
                        {!transLoading&&<button className="btn btn-outline-primary " onClick={getTrans}>History</button>}
                        {transLoading&&<div className="d-flex justify-content-center w-25">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>}
                      </div>
                  }
                  </div>
                 </div>
              </div>
          }
           {showRes&&showTrans&&
              <div>
                 <div class="modal-body pb-3 pt-0" style={{ height: "400px",'overflow':"scroll" }}>

                 <div className="d-flex justify-content-between mb-3">
                  <div className="text-center w-100">
                    <h1
                      class="modal-title text-primary fs-5"
                      id="exampleModalLabel"
                    >
                      Transaction details
                    </h1>
                  </div>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                  <div className="d-flex justify-content-center flex-column align-items-center gap-3">

                  <table class="table table-striped" >
                  <thead>
                    <tr style={{'position':'sticky','top':'0'}} >
                      <th scope="col">S.NO</th>
                      <th scope="col">Transaction Id</th>
                      <th scope="col">Time stamp</th>
                      
                    </tr>
                  </thead>
                  <tbody>

                    {
                      trans.map((ele,idx)=><tr key={idx}>
                      <th scope="row">{idx+1}</th>
                      <td>{ele._id}</td>
                      <td>{getDate(ele.timestamp)}</td>
                      {/* <td>@mdo</td> */}
                    </tr>)
                    }

                  </tbody>
                  </table>

                  </div>
                 </div>
              </div>
          }
              
          </div>
        </div>
      </div>
      <ToastContainer />
    </ModalContainer>
  );
}

export default Modal;
