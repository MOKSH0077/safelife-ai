"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  UploadCloud, 
  Send, 
  AlertTriangle, 
  HeartPulse, 
  User, 
  Bot, 
  Plus, 
  HelpCircle,
  CheckCircle2,
  Loader2,
  Shield,
  FileCheck,
  RefreshCw,
  MessageSquare,
  Trash2,
  Globe,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, uploadPDF } from "@/lib/api";
import { SignInButton, SignUpButton, Show, UserButton, useAuth, useClerk } from '@clerk/nextjs';

const translations = {
  en: {
    logoBadge: "BUZURG SEVA",
    logoSubtitle: "Caring Assistant for Health Explanations & Fraud Prevention",
    fontSizeLarge: "Aa (Large)",
    fontSizeExtraLarge: "AA (Extra Large)",
    newChat: "New Chat",
    login: "Log In",
    register: "Register",
    uploadPdfHeading: "Upload PDF",
    reportType: "Report Type:",
    medical: "Medical",
    fraud: "Fraud",
    selectPdf: "Select PDF",
    onlyPdf: "Only PDF documents",
    upload: "Upload",
    uploading: "Uploading...",
    previousChats: "Previous Chats",
    noHistory: "No chat history.",
    deleteChatTooltip: "Delete chat",
    documentStatus: "Document Status",
    noDocuments: "No active documents. Upload reports/messages on the left.",
    uploadedPrefix: "Uploaded: ",
    fraudCheck: "Fraud Check",
    medicalReport: "Medical Report",
    placeholder: "Type your message here (e.g., 'Verify this message')",
    send: "Send",
    safetyGuidelines: "Safety Guidelines & Resources",
    simpleRules: "Simple Rules for Seniors",
    rule1: "**Bank details, PIN or Aadhaar** should never be shared with anyone over the phone.",
    rule2: "Do not click links in **lottery or prize money** messages. This is a common fraud.",
    rule3: "In case of a **Medical Report**, always consult a doctor. The AI only simplifies the written details.",
    officialWebsites: "Official Government Websites",
    footerText: "© 2026 SafeLife AI. Health and Security — Always with you.",
    developedBy: "Developed by Moksh",
    welcomeMessage: "Namaste! I am SafeLife AI. I can help you in two ways:\n\n1. 📂 Understand **Medical Reports** in simple English.\n2. 🚨 Check any SMS, call, or link for **Fraud**.\n\nYou can type your question below or upload a PDF report above!",
    connectionError: "Apologies! Connection issue occurred. Please check if the backend server is running.",
    uploadSuccess: (filename: string) => `${filename} uploaded successfully!`,
    uploadFailure: "File upload failed. Check if backend is running.",
  },
  hi: {
    logoBadge: "बुजुर्ग सेवा",
    logoSubtitle: "स्वास्थ्य स्पष्टीकरण और धोखाधड़ी से बचाव के लिए देखभाल करने वाला सहायक",
    fontSizeLarge: "Aa (बड़ा)",
    fontSizeExtraLarge: "AA (बहुत बड़ा)",
    newChat: "नया चैट",
    login: "लॉग इन",
    register: "रजिस्टर",
    uploadPdfHeading: "पीडीएफ अपलोड करें",
    reportType: "रिपोर्ट का प्रकार:",
    medical: "मेडिकल",
    fraud: "धोखाधड़ी",
    selectPdf: "पीडीएफ चुनें",
    onlyPdf: "केवल पीडीएफ दस्तावेज",
    upload: "अपलोड करें",
    uploading: "अपलोड हो रहा है...",
    previousChats: "पुराने चैट्स",
    noHistory: "कोई चैट इतिहास नहीं है।",
    deleteChatTooltip: "चैट हटाएं",
    documentStatus: "दस्तावेज़ की स्थिति",
    noDocuments: "कोई दस्तावेज़ सक्रिय नहीं है। बाईं ओर से रिपोर्ट/संदेश अपलोड करें।",
    uploadedPrefix: "अपलोड किया गया: ",
    fraudCheck: "धोखाधड़ी जांच",
    medicalReport: "मेडिकल रिपोर्ट",
    placeholder: "अपना सवाल यहाँ लिखें (जैसे, 'इस संदेश की जांच करें')",
    send: "भेजें",
    safetyGuidelines: "सुरक्षा दिशा-निर्देश और संसाधन",
    simpleRules: "बुजुर्गों के लिए सरल नियम",
    rule1: "**बैंक विवरण, पिन या आधार** फोन पर किसी के साथ साझा न करें।",
    rule2: "**लॉटरी या पुरस्कार राशि** के कॉल/संदेशों पर दिए गए किसी भी लिंक पर क्लिक न करें। यह एक आम धोखाधड़ी है।",
    rule3: "**मेडिकल रिपोर्ट** के मामले में, बिना घबराए डॉक्टर से सलाह लें। एआई केवल रिपोर्ट की बातों को सरल बनाता है।",
    officialWebsites: "आधिकारिक सरकारी वेबसाइटें",
    footerText: "© 2026 SafeLife AI. स्वास्थ्य और सुरक्षा — हमेशा आपके साथ।",
    developedBy: "मोक्ष द्वारा विकसित",
    welcomeMessage: "नमस्ते! मैं SafeLife AI हूँ। मैं आपकी दो तरीकों से मदद कर सकता हूँ:\n\n1. 📂 **मेडिकल रिपोर्ट (Medical Reports)** को सरल हिन्दी में समझना।\n2. 🚨 किसी भी एसएमएस, कॉल, या लिंक को **धोखाधड़ी (Fraud)** के लिए चेक करना।\n\nआप अपना सवाल नीचे टाइप कर सकते हैं या ऊपर से पीडीएफ (PDF) रिपोर्ट अपलोड कर सकते हैं!",
    connectionError: "क्षमा करें! कनेक्शन में समस्या आई है। कृपया जांचें कि आपका बैकएंड सर्वर चल रहा है।",
    uploadSuccess: (filename: string) => `${filename} सफलतापूर्वक अपलोड हो गया!`,
    uploadFailure: "फ़ाइल अपलोड विफल रही। जांचें कि बैकएंड सर्वर चल रहा है या नहीं।",
  }
};


interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  category?: string;
  timestamp: string;
}

interface UploadedFile {
  name: string;
  type: "medical" | "fraud";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  uploadedFiles: UploadedFile[];
}

export default function Home() {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // UI Sizing State
  const [fontSize, setFontSize] = useState<"lg" | "xl">("lg");

  // Language Switch State
  const [language, setLanguage] = useState<"en" | "hi">("hi");
  const t = translations[language];
  
  // Chat History / Session States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  
  // Chat Input State
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Upload Form States
  const [uploadType, setUploadType] = useState<"medical" | "fraud">("medical");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const welcomeMessageText = "Namaste! Main SafeLife AI hoon. Main aapki do tareeqon se madad kar sakta hoon:\n\n1. 📂 **Medical Reports (मेडिकल रिपोर्ट)** ko simple Hindi-English mix mein samajhna.\n2. 🚨 Kisi bhi SMS, call, ya link ko **Fraud (धोखा)** check karna.\n\nAap apna sawal neeche type kar sakte hain ya upar se PDF report upload kar sakte hain!";

  // 1. Initial Load: Retrieve sessions and language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("safelife_lang_v1");
    if (savedLang === "en" || savedLang === "hi") {
      setLanguage(savedLang as "en" | "hi");
    }

    const saved = localStorage.getItem("safelife_chats_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved sessions", e);
      }
    }

    // Default first session if none exists
    const initialSessionId = "thread_" + Math.random().toString(36).substring(2, 11);
    const defaultSession: ChatSession = {
      id: initialSessionId,
      title: "New Chat (नया चैट)",
      messages: [
        {
          id: "welcome",
          sender: "ai",
          text: welcomeMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      uploadedFiles: []
    };
    
    setSessions([defaultSession]);
    setActiveSessionId(initialSessionId);
    localStorage.setItem("safelife_chats_v1", JSON.stringify([defaultSession]));
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("safelife_lang_v1", language);
  }, [language]);

  // Save sessions to localStorage whenever they change
  const saveSessionsToDisk = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("safelife_chats_v1", JSON.stringify(updatedSessions));
  };

  // Find active session helper
  const getActiveSession = (): ChatSession | undefined => {
    return sessions.find(s => s.id === activeSessionId);
  };

  // Helper to translate default session titles dynamically
  const getSessionTitle = (title: string) => {
    if (title === "New Chat (नया चैट)") {
      return t.newChat;
    }
    // Match "Chat N (चैट N)"
    const match = title.match(/^Chat (\d+) \(चैट \1\)$/);
    if (match) {
      const num = match[1];
      return language === "en" ? `Chat ${num}` : `चैट ${num}`;
    }
    return title;
  };

  // Auto-scroll to bottom of chat without scrolling the main window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId]);

  // Create a new Chat Session
  const handleNewSession = () => {
    const newSessionId = "thread_" + Math.random().toString(36).substring(2, 11);
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Chat ${sessions.length + 1} (चैट ${sessions.length + 1})`,
      messages: [
        {
          id: "welcome_" + Date.now(),
          sender: "ai",
          text: welcomeMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      uploadedFiles: []
    };

    const updated = [newSession, ...sessions];
    saveSessionsToDisk(updated);
    setActiveSessionId(newSessionId);
    setUploadStatus(null);
    setSelectedFile(null);
  };

  // Delete a Chat Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the deleted session
    const filtered = sessions.filter(s => s.id !== sessionId);
    
    if (filtered.length === 0) {
      // If all deleted, generate a fresh one
      const newSessionId = "thread_" + Math.random().toString(36).substring(2, 11);
      const defaultSession: ChatSession = {
        id: newSessionId,
        title: "New Chat (नया चैट)",
        messages: [
          {
            id: "welcome_" + Date.now(),
            sender: "ai",
            text: welcomeMessageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ],
        uploadedFiles: []
      };
      saveSessionsToDisk([defaultSession]);
      setActiveSessionId(newSessionId);
    } else {
      saveSessionsToDisk(filtered);
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  // Sizing Config helper
  const getTextSize = (type: "title" | "heading" | "body" | "sub" | "btn") => {
    if (fontSize === "xl") {
      switch (type) {
        case "title": return "text-3xl md:text-4xl font-black";
        case "heading": return "text-2xl md:text-3xl font-bold";
        case "body": return "text-xl md:text-2xl leading-relaxed";
        case "sub": return "text-lg md:text-xl font-semibold";
        case "btn": return "text-xl font-bold py-4 px-6";
      }
    } else {
      switch (type) {
        case "title": return "text-2xl md:text-3xl font-extrabold";
        case "heading": return "text-xl md:text-2xl font-bold";
        case "body": return "text-lg md:text-xl leading-relaxed";
        case "sub": return "text-base md:text-lg font-semibold";
        case "btn": return "text-lg font-bold py-3 px-5";
      }
    }
  };

  // Handle Send Chat Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!inputValue.trim() || isSending || !activeSessionId) return;

    const userMessageText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    const activeSession = getActiveSession();
    if (!activeSession) return;

    // Build User message
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session messages
    const updatedMessages = [...activeSession.messages, userMsg];
    
    // Automatically update session title based on first user query
    let newTitle = activeSession.title;
    if (activeSession.title.startsWith("New Chat") || activeSession.title.startsWith("Chat ")) {
      newTitle = userMessageText.substring(0, 20) + (userMessageText.length > 20 ? "..." : "");
    }

    const updatedSession: ChatSession = {
      ...activeSession,
      title: newTitle,
      messages: updatedMessages
    };

    const updatedSessions = sessions.map(s => s.id === activeSessionId ? updatedSession : s);
    saveSessionsToDisk(updatedSessions);

    try {
      // Call backend
      const response = await sendChatMessage(userMessageText, activeSessionId);
      
      const aiMsg: Message = {
        id: "msg_" + Date.now() + "_ai",
        sender: "ai",
        text: response.response,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, aiMsg]
      };

      const finalSessions = sessions.map(s => s.id === activeSessionId ? finalSession : s);
      saveSessionsToDisk(finalSessions);
    } catch (error) {
      const errorMsg: Message = {
        id: "msg_" + Date.now() + "_error",
        sender: "system",
        text: t.connectionError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, errorMsg]
      };

      const finalSessions = sessions.map(s => s.id === activeSessionId ? finalSession : s);
      saveSessionsToDisk(finalSessions);
    } finally {
      setIsSending(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading || !activeSessionId) return;

    setIsUploading(true);
    setUploadStatus(null);

    const activeSession = getActiveSession();
    if (!activeSession) return;

    try {
      await uploadPDF(selectedFile, uploadType);
      
      // Update uploaded files inside active session state
      const newFileObj: UploadedFile = { name: selectedFile.name, type: uploadType };
      const updatedUploadedFiles = [...activeSession.uploadedFiles, newFileObj];

      const updatedSession: ChatSession = {
        ...activeSession,
        uploadedFiles: updatedUploadedFiles,
      };

      const updatedSessions = sessions.map(s => s.id === activeSessionId ? updatedSession : s);
      saveSessionsToDisk(updatedSessions);

      setUploadStatus({
        success: true,
        message: t.uploadSuccess(selectedFile.name),
      });
      setSelectedFile(null);
    } catch (error) {
      setUploadStatus({
        success: false,
        message: t.uploadFailure,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const activeSession = getActiveSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-3 md:p-6 transition-all duration-300">
      
      {/* HEADER SECTION (Same as mockup) */}
      <header className="w-full max-w-7xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 md:p-5 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl text-indigo-400">
            <Shield className="w-8 h-8 md:w-9 h-9" />
          </div>
          <div>
            <h1 className={`${getTextSize("title")} tracking-tight text-white flex items-center gap-2 flex-wrap`}>
              SafeLife AI 
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-bold tracking-wide">
                {t.logoBadge}
              </span>
            </h1>
            <p className={`${getTextSize("sub")} text-slate-400 mt-0.5`}>
              {t.logoSubtitle}
            </p>
          </div>
        </div>

        {/* Language, Font Toggle & New Session */}
        <div className="flex items-center gap-2 md:gap-3 self-end md:self-auto flex-wrap md:flex-nowrap justify-end w-full md:w-auto">
          {/* Language toggle */}
          <div className="bg-slate-950 border border-slate-800/80 p-1.5 rounded-xl flex items-center">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base cursor-pointer ${
                language === "en" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base cursor-pointer ${
                language === "hi" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Font Sizes toggle */}
          <div className="bg-slate-950 border border-slate-800/80 p-1.5 rounded-xl flex items-center">
            <button
              onClick={() => setFontSize("lg")}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base cursor-pointer ${
                fontSize === "lg" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.fontSizeLarge}
            </button>
            <button
              onClick={() => setFontSize("xl")}
              className={`px-4 py-2 rounded-lg font-bold transition-all text-sm md:text-base cursor-pointer ${
                fontSize === "xl" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.fontSizeExtraLarge}
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewSession}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 font-bold shadow-lg shadow-indigo-600/15 text-sm md:text-base cursor-pointer"
          >
            <Plus className="w-5.5 h-5.5" />
            <span>{t.newChat}</span>
          </button>

          {/* Clerk Authentication Controls */}
          <div className="flex items-center gap-2 md:border-l md:border-slate-800/80 md:pl-3 md:ml-1">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 font-bold text-sm md:text-base shadow-md cursor-pointer">
                  {t.login}
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl transition-all active:scale-95 font-bold text-sm md:text-base border border-slate-700/60 cursor-pointer">
                  {t.register}
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* MID SECTION - GRID LAYOUT */}
      <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mb-5">
        
        {/* LEFT COLUMN - UPLOAD & CHAT HISTORY (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* 1. PDF UPLOAD SECTION */}
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col shadow-lg">
            <h2 className={`${getTextSize("heading")} text-white mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-2.5`}>
              <UploadCloud className="w-5.5 h-5.5 text-indigo-400" />
              {t.uploadPdfHeading}
            </h2>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className={`block ${getTextSize("sub")} text-slate-300 mb-2 font-bold`}>
                  {t.reportType}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType("medical");
                      setUploadStatus(null);
                    }}
                    className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 font-bold text-sm transition-all ${
                      uploadType === "medical"
                        ? "bg-teal-500/15 border border-teal-500/30 text-teal-300"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" />
                    {t.medical}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType("fraud");
                      setUploadStatus(null);
                    }}
                    className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 font-bold text-sm transition-all ${
                      uploadType === "fraud"
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {t.fraud}
                  </button>
                </div>
              </div>

              {/* PDF Selector Drop Area */}
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setUploadStatus(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-slate-800 group-hover:border-indigo-500/40 rounded-xl p-5 text-center bg-slate-950/20 group-hover:bg-slate-950/40 transition-all flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="w-9 h-9 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <p className={`font-bold ${getTextSize("sub")} text-slate-300`}>
                    {selectedFile ? selectedFile.name : t.selectPdf}
                  </p>
                  <p className="text-xs text-slate-500">{t.onlyPdf}</p>
                </div>
              </div>

              {/* Upload Action Button */}
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`w-full flex items-center justify-center gap-2 rounded-xl transition-all font-bold ${getTextSize("btn")} ${
                  selectedFile && !isUploading
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95 cursor-pointer"
                    : "bg-slate-850 text-slate-600 cursor-not-allowed border border-slate-800/40"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" />
                    {t.upload}
                  </>
                )}
              </button>
            </form>
          </section>

          {/* 2. PREVIOUS CHATS SECTION */}
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 md:p-5 flex-1 flex flex-col shadow-lg min-h-[250px]">
            <h2 className={`${getTextSize("heading")} text-white mb-3 flex items-center gap-2 border-b border-slate-800/80 pb-2.5`}>
              <MessageSquare className="w-5.5 h-5.5 text-indigo-400" />
              {t.previousChats}
            </h2>

            {/* List of Sessions */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[250px] scrollbar-thin scrollbar-thumb-slate-900">
              {sessions.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-sm">{t.noHistory}</div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setUploadStatus(null);
                      }}
                      className={`group w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive 
                          ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                        <MessageSquare className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-600"}`} />
                        <span className={`${getTextSize("sub")} truncate font-medium text-left`}>
                          {getSessionTitle(session.title)}
                        </span>
                      </div>
                      
                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title={t.deleteChatTooltip}
                        className="text-slate-600 hover:text-rose-450 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ml-1 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN - CHAT WINDOW (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-5 items-stretch min-h-[500px]">
          
          {/* 3. PDF UPLOADED MESSAGE & CATEGORY BANNER */}
          <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                activeSession && activeSession.uploadedFiles.length > 0
                  ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                {activeSession && activeSession.uploadedFiles.length > 0 ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div className="overflow-hidden">
                <span className={`block text-slate-500 uppercase tracking-wider text-xs font-bold`}>
                  {t.documentStatus}
                </span>
                <p className={`${getTextSize("sub")} text-slate-200 truncate mt-0.5`}>
                  {activeSession && activeSession.uploadedFiles.length > 0 ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {t.uploadedPrefix}
                      {activeSession.uploadedFiles.map((f, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          f.type === "medical" 
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/20" 
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/20"
                        }`}>
                          {f.type === "medical" ? t.medical : t.fraud}: {f.name}
                        </span>
                      ))}
                    </span>
                  ) : (
                    t.noDocuments
                  )}
                </p>
              </div>
            </div>
            
          </section>

          {/* 4. MAIN CONVERSATION CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
            
            {/* Scrollable conversation bubbles */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[420px] min-h-[300px] scrollbar-thin scrollbar-thumb-slate-900">
              <AnimatePresence initial={false}>
                {activeSession && 
                  (activeSession.messages.length > 1
                    ? activeSession.messages.filter(m => !m.id.startsWith("welcome"))
                    : activeSession.messages
                  ).map((msg) => {
                  const isUser = msg.sender === "user";
                  const isSystem = msg.sender === "system";
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        
                        {/* Avatar */}
                        <div className={`p-2 rounded-xl border flex-shrink-0 ${
                          isUser 
                            ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-400" 
                            : isSystem 
                              ? "bg-slate-800/60 border-slate-700/60 text-slate-400"
                              : "bg-indigo-500/15 border-indigo-500/20 text-indigo-400"
                        }`}>
                          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Text bubble */}
                        <div className="flex flex-col gap-1">
                          <div className={`p-4 rounded-2xl border shadow-sm ${
                            isUser 
                              ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-none" 
                              : isSystem 
                                ? "bg-slate-950/60 border-slate-850 text-slate-400 rounded-tl-none font-medium italic"
                                : "bg-slate-950/60 border-slate-850 text-slate-100 rounded-tl-none"
                          }`}>
                            
                            {/* Verdict Tag for AI response */}
                            {!isUser && !isSystem && msg.category && msg.category !== "general" && (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 ${
                                msg.category === "fraud"
                                  ? "bg-rose-500/25 text-rose-300 border border-rose-500/30"
                                  : "bg-teal-500/25 text-teal-300 border border-teal-500/30"
                              }`}>
                                {msg.category === "fraud" ? (
                                  <>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {t.fraudCheck}
                                  </>
                                ) : (
                                  <>
                                    <HeartPulse className="w-3.5 h-3.5" />
                                    {t.medicalReport}
                                  </>
                                )}
                              </span>
                            )}

                            {/* Message content */}
                            <div className={`${getTextSize("body")} whitespace-pre-line leading-relaxed`}>
                              {msg.id.startsWith("welcome") || msg.text === welcomeMessageText
                                ? t.welcomeMessage 
                                : msg.text === "Kshama karein! Connection mein dikkat aa rahi hai. Kripya check karein ki aapka backend server chal raha hai."
                                  ? t.connectionError
                                  : msg.text}
                            </div>
                          </div>

                          {/* Timestamp */}
                          <span className={`text-xs text-slate-500 px-1 ${isUser ? "text-right" : "text-left"}`}>
                            {msg.timestamp}
                          </span>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {/* Using scrollTop scroll handler on container instead of element ref to avoid page shifting */}
            </div>

            {/* Message input bar */}
            <form 
              onSubmit={handleSendMessage} 
              className="p-4 bg-slate-950/40 border-t border-slate-850/80 flex items-stretch gap-3"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                disabled={isSending || !activeSessionId}
                className={`flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-indigo-500/60 transition-all font-medium ${getTextSize("body")}`}
              />
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending || !activeSessionId}
                className={`flex items-center justify-center gap-1.5 rounded-xl font-bold px-6 py-3 transition-all ${
                  inputValue.trim() && !isSending && activeSessionId
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15 active:scale-95 cursor-pointer"
                    : "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800/40"
                }`}
              >
                {isSending ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className={`${getTextSize("sub")} hidden sm:inline`}>{t.send}</span>
                  </>
                )}
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* 5. BOTTOM GRID - SAFETY GUIDELINES & GOVERNMENT PORTALS */}
      <section className="w-full max-w-7xl mx-auto bg-slate-900/40 border border-slate-800/85 rounded-2xl p-5 md:p-6 shadow-xl mb-4">
        <h2 className={`${getTextSize("heading")} text-white mb-5 flex items-center gap-2 border-b border-slate-800 pb-3`}>
          <HelpCircle className="w-6 h-6 text-indigo-400" />
          {t.safetyGuidelines}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Guidelines Bullet points - 7 columns */}
          <div className="md:col-span-7 space-y-4">
            <span className={`block text-slate-400 font-bold uppercase text-xs tracking-wider mb-2`}>
              {t.simpleRules}
            </span>
            <ul className={`space-y-3.5 text-slate-350 ${getTextSize("body")}`}>
              <li className="flex gap-2.5 items-start">
                <span className="text-indigo-400 font-black mt-0.5">•</span>
                <span>{t.rule1}</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-indigo-400 font-black mt-0.5">•</span>
                <span>{t.rule2}</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-indigo-400 font-black mt-0.5">•</span>
                <span>{t.rule3}</span>
              </li>
            </ul>
          </div>

          {/* Gov Portals List - 5 columns */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-800/80 pt-5 md:pt-0 md:pl-6 space-y-4">
            <span className={`block text-slate-400 font-bold uppercase text-xs tracking-wider mb-2`}>
              {t.officialWebsites}
            </span>
            
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://www.cybercrime.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950 hover:text-white border border-slate-850 rounded-xl text-slate-300 font-semibold transition-all text-sm group"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-400" />
                  National Cyber Crime Reporting Portal
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </a>

              <a 
                href="https://www.mohfw.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950 hover:text-white border border-slate-850 rounded-xl text-slate-300 font-semibold transition-all text-sm group"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-400" />
                  Ministry of Health and Family Welfare
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </a>

              <a 
                href="https://sancharsaathi.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-950 hover:text-white border border-slate-850 rounded-xl text-slate-300 font-semibold transition-all text-sm group"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-400" />
                  Sanchar Saathi (Telecom Safety Portal)
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto mt-3 text-center text-slate-600 text-xs md:text-sm font-medium flex flex-col gap-1.5">
        <div>{t.footerText}</div>
        <div className="text-slate-500 text-[10px] md:text-xs tracking-wider uppercase font-semibold">
          {t.developedBy}
        </div>
      </footer>

    </div>
  );
}
