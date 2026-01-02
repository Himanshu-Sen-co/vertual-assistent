import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/userContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { IoArrowBackSharp } from "react-icons/io5";



function Customize2() {
    const {apiUrl, userdata, setUserdata, frontImage, setFrontImage, backendImage, setBackendImage, selectedImage, setSelectedImage} = useContext(userDataContext)
    const [assistentName, setAssistentName] = useState(userdata?.assistentName || "")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const handleUpdateAssistent = async () => {
        try {
            setLoading(true)
            console.log("=================",backendImage);
            
            const formData = new FormData()
            formData.append("assistentName", assistentName)
            if (backendImage) {
                formData.append("assistentImage", backendImage)
            }else{
                formData.append("imageUrl", selectedImage)
            }
            const result = await axios.post(`${apiUrl}/api/user/updateAssistent`,formData, {withCredentials:true, headers: {
      "Content-Type": "multipart/form-data", 
    },})
            console.log("================================================================");
            
            console.log(result.data);
            setUserdata(result.data)
            setLoading(false)
            navigate("/")
            
        } catch (error) {
            console.log(error);
             setLoading(false)
        }
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex flex-col justify-center items-center relative'>
        <IoArrowBackSharp className='absolute top-[30px] left-[30px] w-[25px] h-[25px] cursor-pointer text-white' onClick={()=> navigate("/customize")} />
        <h1 className='text-white text-[30px] text-center mb-[30px]'>Enter your <span className='text-blue-200'>Assistent name </span></h1>
         <input type="text" name='name' placeholder='eg: manu' className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=> setAssistentName(e.target.value)} value={assistentName}/>
         {assistentName && <button  className='min-w-[250px] mt-[20px] h-[60px] text-black font-semibold bg-white rounded-full text-[20px]' disabled={loading} onClick={handleUpdateAssistent}>{loading ? "loading" : "Create your Assistent"}</button>}
    </div>
  )
}

export default Customize2