import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './pages/signup'
import Signin from './pages/signin'
import { useContext } from 'react'
import { userDataContext } from './context/userContext'
import Home from './pages/home'
import Customize from './pages/customize'
import Customize2 from './pages/customize2'

function App() {
  const {userdata, setUserdata, loading} =  useContext(userDataContext)

   if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      <Route index element={(userdata?.assistentImage && userdata?.assistentName ? <Home /> : <Navigate to={"/customize"} />)} />
      <Route path='/signup' element={!userdata ?<Signup /> : <Navigate to={"/"} />}/>
      <Route path='/login' element={!userdata ? <Signin /> : <Navigate to={"/"} />}/>
      <Route path='/customize' element={userdata ? <Customize /> : <Navigate to={"/login"} />}/>
      <Route path='/customize2' element={userdata ? <Customize2 /> : <Navigate to={"/login"} />}/>

    </Routes>
  )
}

export default App