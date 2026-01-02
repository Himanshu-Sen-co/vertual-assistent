import React, { useContext, useRef, useState } from 'react'
import Card from '../components/card'
import image1 from '../assets/image1.jpg'
import image2 from '../assets/image2.jpg'
import image3 from '../assets/image3.jpg'
import image4 from '../assets/image4.jpg'
import image5 from '../assets/image5.jpg'
import image6 from '../assets/image6.jpg'
import image8 from '../assets/image8.jpg'
import image9 from '../assets/image9.jpg'
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import { IoArrowBackSharp  } from "react-icons/io5";
import { GrFormNextLink } from "react-icons/gr";


function Customize() {
    const {apiUrl, userdata, setUserdata, frontImage, setFrontImage, backendImage, setBackendImage, selectedImage, setSelectedImage} = useContext(userDataContext)
    const inputImage = useRef(null)
    const navigate = useNavigate()

    const handleImage = (e) =>{
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontImage(URL.createObjectURL(file))
    }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex flex-col justify-center items-center relative'>
        <IoArrowBackSharp className='absolute top-[30px] left-[30px] w-[25px] h-[25px] cursor-pointer text-white' onClick={()=> navigate("/")} />
             <GrFormNextLink  className='absolute top-[30px] right-[30px] w-[30px] h-[30px] cursor-pointer text-white' onClick={()=> navigate("/customize2")} />
        <h1 className='text-white text-[30px] text-center mb-[30px]'>Select your <span className='text-blue-200'>Assistent Image</span></h1>
       <div className='flex flex-wrap justify-center items-center w-full max-w-[900px] gap-[15px]'>
         <Card image={image1} />
         <Card image={image2} />
         <Card image={image3} />
         <Card image={image4} />
         <Card image={image5} />
         <Card image={image6} />
         <Card image={image8} />
         <Card image={image9} />
         <div className={`w-[70px] h-[140px] lg:w-[130px] lg:h-[230px] bg-[#0000ff66] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-2 hover:border-white flex justify-center items-center ${selectedImage == "input" ? "border-4 border-white shadow-2xl shadow-blue-950 " : null}`} onClick={()=>{
            inputImage.current.click()
            setSelectedImage("input")
            }}>
            {!frontImage && <RiImageAddLine className='text-white w-[30px] h-[30px]' /> }
            {frontImage && <img src={frontImage} alt="" className='h-full object-cover' /> }
    </div>
    <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
         </div>
         {selectedImage && <button  className='min-w-[150px] mt-[20px] h-[60px] text-black font-semibold bg-white rounded-full text-[20px]' onClick={()=> navigate("/customize2")}>Next</button>}
    </div>
  )
}

export default Customize