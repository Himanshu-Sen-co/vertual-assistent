import React, { useContext } from 'react'
import { userDataContext } from '../context/userContext'

function Card({image}) {

    const {apiUrl, userdata, setUserdata, frontImage, setFrontImage, backendImage, setBackendImage, selectedImage, setSelectedImage} = useContext(userDataContext)
  return (
    <div className={`w-[70px] h-[140px] lg:w-[130px] lg:h-[230px] bg-[#0000ff66] border-2 border-[blue] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white ${selectedImage == image ? "border-4 border-white shadow-2xl shadow-blue-950 " : null}`} onClick={()=> {
        setSelectedImage(image)
        setBackendImage(null)
        setFrontImage(null)
    }}>
        <img src={image} alt="" className='h-full object-cover' />
    </div>
  )
}

export default Card