import React, { useContext, useState } from 'react'
import vrbg from "../assets/vrbg.png"
import vrbg3 from "../assets/vrbg3.jpg"
import { IoEye, IoEyeOff } from "react-icons/io5";
import {useNavigate} from "react-router-dom"
import axios from "axios"
import { userDataContext } from '../context/userContext';

function Signin() {

  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const {apiUrl,  userdata, setUserdata} = useContext(userDataContext)
  // const [name, setName] = useState("")
  const [ email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState("")
  const [loading, setloading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrors("")
    setloading(true)
    console.log("api url is ", apiUrl);
    
    try {
      console.log(`${apiUrl}/api/auth/login`);
      
      const result = await axios.post(`${apiUrl}/api/auth/login`, {email, password},{withCredentials:true})
      setUserdata(result.data)
      setloading(false)
      navigate("/")
      
    } catch (error) {
      setUserdata(null)
      setloading(false)
      setErrors(error.response.data.message);
      
    }
    
  }


  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center ' style={{backgroundImage:`url(${vrbg3})`}}>

    <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-black-950 flex flex-col gap-[20px] justify-center items-center px-[20px]' onSubmit={handleLogin}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Login to <span className='text-blue-400'>Vertual Assistent</span></h1>

        {/* <input type="text" name='name' placeholder='Enter your name' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=> setName(e.target.value)} /> */}

        <input type="email" name='email' placeholder='Enter your email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=> setEmail(e.target.value)}/>

        <div className='w-full h-[60px] rounded-full bg-transparent text-white text-[18px] relative'>
          <input type={showPassword ? "text" : "password"} name='password' placeholder='Enter your password' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=> setPassword(e.target.value)}/>
          {!showPassword && <IoEye className='absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer' onClick={()=> setShowPassword(true)} /> }

          {showPassword && <IoEyeOff  className='absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer' onClick={()=> setShowPassword(false)} /> }

        </div>
        {errors.length>0 && <p className='text-red-500 text-[17px]'>{errors}</p>}
          <button className='min-w-[150px] mt-[20px] h-[60px] text-black font-semibold bg-white rounded-full text-[22px]' disabled={loading}>{loading ? "loading" : "Login"}</button>

          <p className='text-white text-[18px] cursor-pointer' onClick={()=> navigate("/signup")}> Don't have account ? <span className='text-blue-400'>Sign UP</span> here</p>
    </form>
    
    </div>
  )
}

export default Signin