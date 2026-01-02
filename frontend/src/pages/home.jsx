import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ai1 from "../assets/ai1.gif"
import userInput1 from "../assets/userInput1.gif"

function Home() {
    const { userdata, apiUrl, setUserdata, getGeminiResponse } = useContext(userDataContext);
    const navigate = useNavigate();
    const [voices, setVoices] = useState([]);
    const [voicesReady, setVoicesReady] = useState(false);
    const [listening, setListening] = useState(false);
    const [userText, setUserText] = useState("")
    const [aiText, setAiText] = useState("")


    // useRef will hold our persistent values across re-renders
    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef(null); // This will hold the single recognition instance
    const synth = window.speechSynthesis;

    const handleLogout = async () => {
        try {
            await axios.get(`${apiUrl}/api/auth/logout`, { withCredentials: true });
            setUserdata(null);
            navigate("/login");
        } catch (error) {
            setUserdata(null);
            console.log(error);
        }
    };

    const loadVoices = useCallback(() => {
        const availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            console.log("✅ Voices loaded:", availableVoices);
            setVoices(availableVoices);
            setVoicesReady(true);
        }
    }, []);

    const initVoices = useCallback(() => {
        console.log("🗣 Initializing voices...");
        // Voices might load asynchronously, so we check and also set up a listener.
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [loadVoices]);


    useEffect(() => {
        // This effect is just for initializing the voices on component mount
        initVoices();
    }, [initVoices]);


    const speak = useCallback((text) => {
        if (!voicesReady || !text) {
            console.warn("Voices not ready or no text to speak.");
            return;
        }

        // Stop listening before speaking
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a suitable voice
        utterance.voice =
            voices.find(v => v.lang === 'hi-IN') ||
            voices.find(v => v.name.toLowerCase().includes('female')) ||
            voices.find(v => v.name.includes('Google UK English Female')) ||
            voices.find(v => v.name === 'Google US English') ||
            voices.find(v => v.lang === 'en-US') ||
            voices[0];

        if (!utterance.voice) {
            console.error("No suitable voice found to speak with.");
            return;
        }
        
        utterance.rate = 1;
        utterance.pitch = 1.1;
        utterance.volume = 1;

        console.log(`🎤 Speaking with voice: ${utterance.voice.name}`);
        isSpeakingRef.current = true;

        utterance.onend = () => {
            setAiText("")
            console.log("Speech finished.");
            isSpeakingRef.current = false;
            // Safely restart recognition after speaking
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    // It might already be stopped, which is fine. The onend handler will restart it.
                    console.warn("Could not start recognition after speech:", error.name);
                }
            }
        };
        
        synth.speak(utterance);
    }, [voices, voicesReady, synth]);


    const handleCommand = useCallback(async (transcript) => {
        try {
            const data = await getGeminiResponse(transcript);
            console.log("Gemini Response:", data);
            
            speak(data.response); // Speak the response first

            const { type, userInput } = data;
            let url = '';

            switch (type) {
                case "google_search":
                    url = `https://www.google.com/search?q=${encodeURIComponent(userInput)}`;
                    break;
                case "calculator_open":
                    url = `https://www.google.com/search?q=calculator`;
                    break;
                case "instagram_open":
                    url = `https://www.instagram.com`;
                    break;
                case "facebook_open":
                    url = `https://www.facebook.com`;
                    break;
                case "weather_show":
                    url = `https://www.google.com/search?q=weather`;
                    break;
                case "youtube_search":
                case "youtube_play":
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`;
                    break;
                default:
                    // No action needed for other types
                    break;
            }

            if (url) {
                window.open(url, '_blank');
            }

            setAiText(data.response)

        } catch (error) {
            console.error("Error handling command:", error);
            speak("Sorry, I ran into an error.");
        }
    }, [getGeminiResponse, speak]);


    // This useEffect sets up the speech recognition instance and its event listeners ONCE.
    useEffect(() => {
        if (!('speechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error("Speech Recognition API not supported by this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognitionRef.current = recognition; // Store the single instance in the ref

        recognition.onstart = () => {
            console.log("✅ Recognition listening...");
            setListening(true);
        };

        recognition.onend = () => {
            console.log("⏹️ Recognition ended.");
            setListening(false);
            // Automatically restart recognition only if we are not speaking
            if (!isSpeakingRef.current) {
                console.log("Restarting recognition...");
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (error) {
                        if (error.name !== "InvalidStateError") {
                            console.error("Recognition restart error:", error);
                        }
                    }
                }, 500); // A small delay to prevent rapid restarts
            }
        };

        recognition.onerror = (event) => {
            setListening(false);
            // The 'aborted' error happens when we programmatically call .stop(), so we can ignore it.
            // 'no-speech' is also a common, non-critical error.
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                console.warn(`⚠️ Recognition Error: ${event.error}`);
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            console.log("Heard: " + transcript);

            if (userdata?.assistentName && transcript.toLowerCase().includes(userdata.assistentName.toLowerCase())) {
                setAiText("")
                setUserText(transcript)
                recognition.stop(); // Stop listening while processing the command
                handleCommand(transcript);
                setUserText("")
            }
        };
        // Cleanup function: runs when the component unmounts
        return () => {
            console.log("Component unmounting. Stopping recognition for good.");
            recognition.stop();
           
        };

    }, [userdata, handleCommand]); // Dependencies for event handlers


    // This useEffect controls STARTING the recognition
    useEffect(() => {
        // Start recognition only when voices are ready and we have user data.
        if (voicesReady && userdata && recognitionRef.current) {
            try {
                console.log("Attempting to start initial recognition...");
                recognitionRef.current.start();
            } catch (error) {
                // This might fail if it's already started, which is okay.
                console.warn("Initial recognition start failed:", error.name);
            }
        }
    }, [voicesReady, userdata]);

    useEffect(() => {
        // We only want the fallback to run when everything is ready.
        if (!voicesReady || !userdata) return;

        const fallbackInterval = setInterval(() => {
            // Check if recognition should be running but isn't.
            if (!isSpeakingRef.current && !listening && recognitionRef.current) {
                console.log("Fallback triggered: Restarting recognition.");
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.warn("Fallback failed to restart recognition:", error.name);
                }
            }
        }, 10000); // Check every 10 seconds

        return () => {
            clearInterval(fallbackInterval);
        };
    }, [listening, voicesReady, userdata]);

    return (
        <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#1b1b72] flex flex-col justify-center items-center gap-[15px]' onClick={initVoices}>
            <div className='flex justify-center items-center absolute top-[20px] right-[30px] gap-[20px]'>
                <button className='min-w-[200px] mt-[20px] h-[40px] text-white font-semibold bg-[#1b1b72] rounded-full text-[20px] border-2 border-white hover:border-blue-600 hover:bg-white hover:text-[#1b1b72] cursor-pointer' onClick={() => navigate("/customize")}>Update Assistant</button>
                <button className='min-w-[100px] mt-[20px] h-[40px] text-white font-semibold bg-[#1b1b72] rounded-full text-[20px] border-2 border-white hover:border-blue-600 hover:bg-white hover:text-[#1b1b72] cursor-pointer' onClick={handleLogout}>Logout</button>
            </div>
            <div className='h-[350px] w-[250px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
                <img src={userdata?.assistentImage} alt="Assistant" className='h-full object-cover' />
            </div>
            <h1 className='text-white text-[18px] font-semibold'>
                {listening ? "Listening..." : `I am ${userdata?.assistentName || 'your assistant'}`}
            </h1>
            {aiText ? <img src={ai1} alt="" className='w-[200px]' /> : <img src={userInput1} alt="" className='w-[200px]'/>}
            <h1 className='text-white text-[18px] font-bold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
        </div>
    );
}

export default Home;