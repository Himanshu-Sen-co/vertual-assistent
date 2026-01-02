import React, { createContext, useEffect, useState } from 'react'
import axios from "axios"

export const userDataContext = createContext()
function UserContext({children}) {
  const [userdata, setUserdata] = useState(null)
  const [frontImage, setFrontImage] = useState(null)
      const [backendImage, setBackendImage] = useState(null)
      const [selectedImage, setSelectedImage] = useState(null)
       const [loading, setLoading] = useState(true);
    const apiUrl = "http://localhost:8000"
    const handlleCurrentUser = async () =>{
      try {
        const result = await axios.get(`${apiUrl}/api/user/current`, {withCredentials: true})
        setUserdata(result.data)
        console.log(result.data);
      } catch (error) {
        console.log(error);
        
      } finally {
      setLoading(false);
    }
    }

    const getGeminiResponse = async (command) => {
      try {
        const result = await axios.post(`${apiUrl}/api/user/asktoassistent`, {command}, {withCredentials:true})
        return result.data
      } catch (error) {
        console.log(error);
        
      }
    }

    useEffect(()=>{
      handlleCurrentUser()
    },[])
     const value = {
        apiUrl, userdata, setUserdata, frontImage, setFrontImage, backendImage, setBackendImage, selectedImage, setSelectedImage, loading, getGeminiResponse
    }
  return (
   
    <div>
        <userDataContext.Provider value={value}>
        {children}
        </userDataContext.Provider>
        </div>

  )
}

export default UserContext