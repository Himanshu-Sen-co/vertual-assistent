import User from "../models/user.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import moment from "moment";


export const getCurrentUser = async (req, res)=>{
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(Error);
         return res.status(500).json({message:"get current user error"})
        
    }
}

export const updateAssistent = async (req, res)=>{
    try {
        const {assistentName, imageUrl} = req.body
        let assistentImage;
        console.log("-=-=-=-=ugufu--=-=-=", req.file);
        
        if(req.file){
             console.log("-=-=-=-=--=-=-=", req.file.path);
            assistentImage = await uploadOnCloudinary(req.file.path)
            console.log("-=-=-=-=--=-=-=");
        } else{
            assistentImage = imageUrl
        }
        
        const user = await User.findByIdAndUpdate(req.userId, {
            assistentName, assistentImage
        }, {new:true}).select("-password")

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:"Update Assistent error", error})
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const {command} = req.body
        const user = await User.findById(req.userId)
        user.history.push(command)
        user.save()
        const userName = user.name
        const assistentName = user.assistentName

        const result = await geminiResponse(command, assistentName, userName)

        const matchJson = result.match(/{[\s\S]*?}/);

        if(!matchJson){
            return res.status(400).json({response:"Sorry, i can't understand"})
        }

        const geminiResult = JSON.parse(matchJson[0])
        console.log(geminiResult);
        
        const type = geminiResult.type

        switch (type) {
            case "get_date":
                return res.json({
                    type,
                    userInput: geminiResult.userInput,
                    response: `current date is ${moment().format("YYYY-MM-DD")}`
                });

            case "get_time":
                return res.json({
                    type,
                    userInput: geminiResult.userInput,
                    response: `current tine is ${moment().format("hh:mm A")}`
                });

            case "get_day":
                return res.json({
                    type,
                    userInput: geminiResult.userInput,
                    response: `Today is ${moment().format("dddd")}`
                });

            case "get_month":
                return res.json({
                    type,
                    userInput: geminiResult.userInput,
                    response: `current date is ${moment().format("MMMM")}`
                });

            case "general":
            case "google_search":
            case "youtube_search":
            case "youtube_play":
            case "calculator_open":
            case "instagram_open":
            case "facebook_open":
            case "weather_show":
                return res.json({
                    type,
                    userInput: geminiResult?.userInput,
                    response: geminiResult?.response
                });
        
            default:
                return res.status(400).json({response: " I didn't understand your command"})
        }

    } catch (error) {
        return res.status(500).json({response: " Ask Assistant error !" + error })
    }
}

