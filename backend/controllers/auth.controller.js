import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
try {
    const {name, email, password} = req.body;
    console.log(name, email, password);
    
    const existingEmail = await User.findOne({email});
    console.log("Incoming:", name, email, password);
    if(existingEmail){
        return res.status(400).json({message: "email already exist, Kindly login"})
    }
    console.log("Incoming:", name, email, password);
    if(password.length<6){
        return res.status(400).json({message: "passsword must be atleast 6 charcter."})
    }
    console.log("Incoming:", name, email, password);
    const hashPassword = await bcrypt.hash(password,10)
    console.log(hashPassword);

    const user = await User.create({
        name, password: hashPassword, email
    })

    const token = await genToken(user._id)

    res.cookie("token",token, {
        httpOnly: true,
        maxAge: 7*24*60*60*1000,
        sameSite:"strict",
        secure:false
    })

    return res.status(201).json(user)
    
} catch (error) {
     return res.status(500).json({message: `Sign up failed ! ${error}`})
    
}
}

export const logIn = async (req, res) => {
try {
    const {email, password} = req.body;
    const existingEmail = await User.findOne({email});
    console.log("After query", existingEmail);
    if(!existingEmail){
        return res.status(400).json({message: "email does not exists, Kindly signup !"})
    }

    const isMatch = await bcrypt.compare(password, existingEmail.password)
    if(!isMatch){
        return res.status(400).json({message: "Incorrect Password"})
    }

    const token = await genToken(existingEmail._id)
   
    res.cookie("token",token, {
        httpOnly: true,
        maxAge: 7*24*60*60*1000,
        secure: process.env.NODE_ENV === "production",
        sameSite:"Lax",
    })
  console.log("====================",token);
   


    return res.status(200).json(existingEmail)
    
} catch (error) {
     return res.status(201).json({message: `login failed ! ${error}`})
    
}
}

export const logout = async (req, res)=> {
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Logout Successfully."}) 
    } catch (error) {
        return res.status(201).json({message: `Logout failed ! ${error}`})
    }
}