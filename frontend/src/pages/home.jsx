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
    const [userText, setUserText] = useState("");
    const [aiText, setAiText] = useState("");

    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef(null);
    const isMountedRef = useRef(true); 
    const synth = window.speechSynthesis;

    const handleLogout = async () => {
        try {
            console.log("Logout process started...");
            await axios.get(`${apiUrl}/api/auth/logout`, { withCredentials: true });
            setUserdata(null);
            navigate("/login");
        } catch (error) {
            setUserdata(null);
            console.error("Logout error:", error);
        }
    };

    const loadVoices = useCallback(() => {
        const availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            console.log("✅ Voices loaded successfully");
            setVoices(availableVoices);
            setVoicesReady(true);
        }
    }, []);

    const initVoices = useCallback(() => {
        console.log("Initializing voices...");
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [loadVoices]);

    useEffect(() => {
        console.log("🏠 Home Component Mounted");
        isMountedRef.current = true;
        initVoices();

        return () => {
            console.log("🚮 Cleanup: Home Component Unmounting");
            isMountedRef.current = false;
            if (recognitionRef.current) {
                console.log("🛑 Stopping Recognition and removing listeners");
                recognitionRef.current.onend = null; 
                recognitionRef.current.stop();
            }
            synth.cancel(); 
        };
    }, [initVoices, synth]);

    const speak = useCallback((text) => {
        if (!voicesReady || !text) {
            console.warn("Cannot speak: Voices not ready or empty text");
            return;
        }

        if (recognitionRef.current) {
            console.log("Silent recognition for AI speech...");
            recognitionRef.current.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.voice =
            voices.find(v => v.lang === 'hi-IN') ||
            voices.find(v => v.name.toLowerCase().includes('female')) ||
            voices.find(v => v.name.includes('Google UK English Female')) ||
            voices.find(v => v.lang === 'en-US') ||
            voices[0];

        utterance.rate = 1;
        utterance.pitch = 1.1;
        utterance.volume = 1;

        isSpeakingRef.current = true;
        console.log(`🗣️ AI Speaking: "${text}"`);

        utterance.onend = () => {
            console.log("🏁 AI finished speaking");
            if (!isMountedRef.current) return;
            setAiText("");
            isSpeakingRef.current = false;
            
            setTimeout(() => {
                if (isMountedRef.current && !isSpeakingRef.current) {
                    try {
                        console.log("🔄 Restarting recognition after speech");
                        recognitionRef.current.start();
                    } catch (error) {
                        console.warn("Restart failed:", error.name);
                    }
                }
            }, 500);
        };
        
        synth.speak(utterance);
    }, [voices, voicesReady, synth]);

    const handleCommand = useCallback(async (transcript) => {
        try {
            console.log("🤖 Sending command to Gemini:", transcript);
            const data = await getGeminiResponse(transcript);
            console.log("📩 Gemini Response received:", data.response);
            
            speak(data.response);
            setAiText(data.response);

            const { type, userInput } = data;
            let url = '';

            switch (type) {
                case "google_search": url = `https://www.google.com/search?q=${encodeURIComponent(userInput)}`; break;
                case "calculator_open": url = `https://www.google.com/search?q=calculator`; break;
                case "instagram_open": url = `https://www.instagram.com`; break;
                case "facebook_open": url = `https://www.facebook.com`; break;
                case "weather_show": url = `https://www.google.com/search?q=weather`; break;
                case "youtube_search":
                case "youtube_play": url = `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`; break;
                default: console.log("No specific URL action for type:", type); break;
            }

            if (url) {
                console.log("🌐 Opening URL:", url);
                window.open(url, '_blank');
            }

        } catch (error) {
            console.error("❌ handleCommand Error:", error);
            speak("Sorry, I ran into an error.");
        }
    }, [getGeminiResponse, speak]);

    useEffect(() => {
        if (!('speechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error("Browser does not support Speech Recognition");
            return;
        }

        console.log("⚙️ Setting up Speech Recognition instance");
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false; 
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            console.log("🎙️ Recognition Started: Listening...");
            setListening(true);
        };

        recognition.onend = () => {
            setListening(false);
            console.log("💤 Recognition Ended");
            
            if (isMountedRef.current && !isSpeakingRef.current) {
                console.log("⏳ Scheduling automatic restart...");
                setTimeout(() => {
                    if (isMountedRef.current && !isSpeakingRef.current) {
                        try { 
                            recognition.start(); 
                        } catch (e) {
                            // Already started error is common and can be ignored
                        }
                    }
                }, 600);
            }
        };

        recognition.onerror = (event) => {
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                console.warn(`⚠️ Recognition Error Event: ${event.error}`);
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            console.log("👂 Heard:", transcript);
            setUserText(transcript);

            if (userdata?.assistentName && transcript.toLowerCase().includes(userdata.assistentName.toLowerCase())) {
                console.log(`🎯 Wake word "${userdata.assistentName}" detected!`);
                setAiText("");
                recognition.stop(); 
                handleCommand(transcript);
                setUserText("");
            }
        };

    }, [userdata?.assistentName, handleCommand]);

    useEffect(() => {
        if (voicesReady && userdata && recognitionRef.current) {
            try {
                console.log("🚀 Initial recognition start trigger");
                recognitionRef.current.start();
            } catch (error) {
                console.warn("Initial start attempt failed:", error.name);
            }
        }
    }, [voicesReady, userdata]);

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
            <h1 className='text-white text-[18px] font-bold text-wrap'>{userText ? userText : aiText ? aiText : null}</h1>
        </div>
    );
}

export default Home;