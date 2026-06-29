import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Send, Heart, Volume2, VolumeX, Sparkles, AlertCircle, Settings, HelpCircle, ArrowRight, X } from "lucide-react";
import { ChatMessage, BibleVerse } from "../types";
import { getPastoralCounsel } from "../services/gemini";

interface CounselScreenProps {
  userAvatar: string;
}

export default function CounselScreen({ userAvatar }: CounselScreenProps) {
  const [situation, setSituation] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("HF_API_KEY") || "");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "pastor",
      text: "Peace be with you, My child. I am here with you. Tell Me what weighs on your spirit today, and let My Word restore your soul. Don't fear, I am with you.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for standard Web Speech APIs
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSituation((prev) => (prev ? prev + " " + transcript : transcript));
      };
      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsRecording(false);
      };
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    // Auto-scroll on new chats
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert("Voice input is not fully supported in this sandboxed environment browser, but you can type your concern below!");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      // Cancel any current text-to-speech to avoid overlaps
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.start();
    }
  };

  const handleSpeakText = (text: string) => {
    if (!audioEnabled) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Find a soft, smooth, gentle resonant voice
    const voices = window.speechSynthesis.getVoices();
    const desiredVoice = voices.find(v =>
      v.name.toLowerCase().includes("male") ||
      v.name.toLowerCase().includes("natural") ||
      v.name.includes("Google US English") ||
      v.lang.startsWith("en")
    );
    if (desiredVoice) utterance.voice = desiredVoice;

    // Configured for a soft, compassionate, and reassuring deliverability
    utterance.rate = 0.80; // Slower rate matching Jesus speaking with extreme kindness and stillness
    utterance.pitch = 0.90; // Slightly lower pitch for a calm, deeply reassuring resonance

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleShareConcern = async (concernOverride?: string) => {
    const textToSubmit = concernOverride || situation;
    if (!textToSubmit.trim()) return;

    // Add user message
    const userMsgId = `usr-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSubmit,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);
    setSituation("");

    // Stop speaking if any previous pastoral audio is playing
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const counselData = await getPastoralCounsel(textToSubmit, customApiKey);

      const pastorMsgId = `pastor-${Date.now()}`;
      const pastorResponse: ChatMessage = {
        id: pastorMsgId,
        sender: "pastor",
        text: counselData.comfort,
        verses: counselData.verses,
        prayer: counselData.prayer,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, pastorResponse]);

      // Auto Speech feedback for accessibility and immersion
      if (audioEnabled) {
        // Read pastoral comfort and the prayer
        const speakTranscript = `${counselData.comfort}. ${counselData.prayer ? "Listen as I pray: " + counselData.prayer : ""}`;
        handleSpeakText(speakTranscript);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "pastor",
          text: "I feel your heavy heart. Even in silence, My presence sustains you. Put your doubts aside for just this moment. Don't fear, I am with you.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const topicTemplates = [
    { title: "Facing Anxiety", text: "I feel incredibly anxious and overwhelmed by my thoughts recently." },
    { title: "Seeking Forgiveness", text: "I have been struggling to forgive someone who hurt me deeply." },
    { title: "Grief & Loss", text: "I am feeling a heavy sorrow from losing someone dear to my heart." },
    { title: "Need Strength", text: "I feel physically and spiritually drained and need divine strength." }
  ];

  return (
    <div id="counsel_screen_root" className="h-full flex flex-col bg-[#F6F5F0] text-[#1c1c1c] overflow-hidden">
      {/* Header */}
      <header id="counsel_header" className="flex items-center justify-between px-5 pt-4 pb-2 bg-[#F6F5F0]">
        <div id="pastor_profile_badge" className="flex items-center gap-2">
          <img
            id="pastor_profile_img"
            src="/src/assets/images/christ_devotional_portrait_1782136426209.jpg"
            alt="Jesus Christ"
            className="w-8 h-8 rounded-full border border-amber-300 object-cover"
          />
          <div>
            <h2 id="pastor_name" className="text-xs font-semibold text-stone-750">Jesus Christ - Divine Voice</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-stone-500 font-bold uppercase">Compassionate Voice Active</span>
            </div>
          </div>
        </div>
        <h1 id="counsel_screen_title" className="text-lg font-serif text-[#0e2a1b] font-semibold">Devotion</h1>
        <div className="flex items-center gap-1.5">
          <button
            id="audio_mute_toggle"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (isSpeaking) window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }}
            title={audioEnabled ? "Voice Enabled" : "Voice Muted"}
            className={`p-1.5 rounded-full border transition-colors ${audioEnabled ? 'border-amber-800/20 text-amber-905 bg-amber-50/55' : 'border-stone-200 text-stone-400'}`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            id="settings_gear_btn"
            onClick={() => setShowSettings(true)}
            className="p-1 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100"
            title="Spiritual Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Integrated AI Voice Assistance Status Banner */}
      <div id="ai_voice_assistance_badge" className="mx-5 my-2 p-3 bg-amber-50/70 border border-amber-900/10 rounded-xl flex items-start gap-2.5 shadow-xs">
        <Volume2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-bold text-amber-900 tracking-wide font-sans uppercase">
            Integrated AI Voice Assistance
          </h4>
          <p className="text-[9.5px] text-stone-600 leading-relaxed font-sans">
            Hear and read comforting guidance from Jesus Christ. The synthesized voice is formatted to be <span className="font-semibold text-amber-900">soft, smooth, and compassionate</span>. Wisdom is limited strictly to your question, quotes scripture, and always concludes with <span className="italic font-semibold text-stone-850">"Don't fear, I am with you."</span>
          </p>
        </div>
      </div>

      {/* Main Container: Chat Log or Input */}
      <div id="counsel_chat_vessel" className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
        {/* Splash Branding Header */}
        <div id="counsel_splash_intro" className="text-center py-1">
          <h2 id="counsel_brand_title" className="text-xs font-semibold tracking-widest text-[#725a32] uppercase font-mono">Christ is King</h2>
          <p id="counsel_brand_sub" className="text-[11px] text-stone-500 font-serif">"My sheep hear my voice, and I know them, and they follow me."</p>
        </div>

        {/* Templates suggestions when stream is empty */}
        {messages.length === 1 && (
          <motion.div
            id="counsel_templates_grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 py-2"
          >
            <span className="text-[10px] font-mono tracking-widest text-stone-400 font-bold uppercase block text-center">
              Choose a template or write directly to receive His care:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {topicTemplates.map((tp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleShareConcern(tp.text)}
                  className="p-3 bg-white hover:bg-amber-50/40 rounded-xl border border-stone-200/50 transition-all text-left group flex flex-col justify-between"
                >
                  <span className="text-[11px] font-semibold text-[#0e2a1b] font-sans group-hover:text-amber-800 transition-colors">
                    {tp.title}
                  </span>
                  <p className="text-[9px] text-stone-500 line-clamp-1 mt-1 font-sans">{tp.text}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message Log */}
        <div id="messages_stream" className="space-y-4 min-h-[150px]">
          {messages.map((msg, index) => (
            <motion.div
              id={`msg_bubble_${msg.id}`}
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              {msg.sender === "user" ? (
                // User message block
                <div id="user_chat_bubble" className="bg-[#121c13] text-stone-100 rounded-2xl px-4 py-3 max-w-[85%] shadow-sm text-xs space-y-1">
                  <p className="font-sans leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] text-stone-400 block text-right font-mono mt-1">Me</span>
                </div>
              ) : (
                // Pastor message block - modeled after first screenshot
                <div id="pastor_chat_bubble" className="bg-white border border-[#eae9e0] rounded-2xl p-5 max-w-[95%] shadow-md text-xs space-y-4 relative overflow-hidden">
                  {/* Heart decoration on left edge */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#725e2e]" />

                  {/* Mini category tag */}
                  <div id="pastoral_tag" className="flex items-center gap-1.5 text-stone-500 uppercase tracking-widest text-[9px] font-bold">
                    <Heart className="w-3.5 h-3.5 text-[#725e2e] fill-current" />
                    <span className="text-[#725e2e]">DIVINE COMFORT</span>

                    <button
                      id={`read_aud_${msg.id}`}
                      onClick={() => {
                        const transcript = `${msg.text}. ${msg.prayer ? "Listen as I pray to you: " + msg.prayer : ""}`;
                        handleSpeakText(transcript);
                      }}
                      className="ml-auto p-1 hover:bg-stone-100 rounded-full text-[#725e2e]"
                      title="Listen with Soft Calm Voice"
                    >
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    </button>
                  </div>

                  {/* Comfort Words */}
                  <div id="pastor_comfort_text" className="text-stone-700 leading-relaxed font-sans text-xs">
                    {msg.text}
                  </div>

                  {/* Associated Bible Verses */}
                  {msg.verses && msg.verses.length > 0 && (
                    <div id="pastor_verses_box" className="p-3 bg-amber-50/50 rounded-xl border border-amber-900/10 space-y-2 mt-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                        Holy Scripture Promise:
                      </span>
                      {msg.verses.map((v, vIdx) => (
                        <div key={vIdx} className="space-y-0.5">
                          <p id="verse_text_in_bubble" className="italic font-serif text-stone-700 text-xs">
                            "{v.text}"
                          </p>
                          <span id="verse_ref_in_bubble" className="font-mono text-[9px] text-stone-500 block">
                            — {v.reference}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Personalized Prayer */}
                  {msg.prayer && (
                    <div id="pastor_prayer_box" className="pt-3 border-t border-stone-100 space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#3b5240] font-bold block">
                        Benediction of Grace:
                      </span>
                      <p id="prayer_paragraph" className="font-serif italic text-stone-600 text-xs leading-relaxed">
                        "{msg.prayer}"
                      </p>
                    </div>
                  )}

                  {/* Pastor metadata */}
                  <span id="pastor_msg_time" className="text-[9px] text-stone-400 block font-mono">
                    Interpreted by Guidance AI at {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading bubble */}
          {isLoading && (
            <div id="pastor_loading_indicator" className="flex flex-col items-start">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 w-[80%] shadow-xs flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce" />
                </div>
                <span className="text-xs text-stone-500 font-sans italic">Consulting scripture guides...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container - Exactly styled from the screenshot */}
      <footer id="counsel_input_dock" className="p-4 bg-white border-t border-stone-200/50">
        <div id="input_wrapper_box" className="p-3 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
          <textarea
            id="concern_textbox"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Describe your situation or concern..."
            className="w-full text-xs font-sans text-stone-850 bg-transparent resize-none border-0 focus:ring-0 focus:outline-none min-h-[70px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleShareConcern();
              }
            }}
          />

          <div id="input_controls" className="flex items-center justify-between pt-2">
            {/* Mic trigger */}
            <div className="flex items-center gap-1.5">
              <button
                id="voice_record_btn"
                onClick={toggleRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                  isRecording
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "bg-white border-stone-200 text-amber-900 hover:bg-stone-50"
                }`}
                title={speechSupported ? "Speak your prayer" : "Speech not supported in this frame"}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {isRecording && (
                <span className="text-[10px] text-red-500 font-semibold animate-pulse font-mono">
                  Listening to voice...
                </span>
              )}
            </div>

            {/* Submit Action Pill - Matching perfect visuals */}
            <button
              id="submit_concern_btn"
              onClick={() => handleShareConcern()}
              disabled={isLoading || !situation.trim()}
              className={`px-5 py-2.5 rounded-full font-sans text-stone-100 font-medium text-xs flex items-center gap-1.5 transition-all focus:outline-none ${
                situation.trim()
                  ? "bg-[#0b0c0c] hover:bg-stone-800"
                  : "bg-stone-300 pointer-events-none text-stone-100"
              }`}
            >
              <span>Share Concern</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic warning if client needs keys */}
        <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-60">
          <Sparkles className="w-3 h-3 text-[#725e2e]" />
          <span className="text-[8px] font-mono text-stone-400 font-bold uppercase">Compassionate Christian Counsel</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div id="settings_modal_backdrop" className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
            <motion.div
              id="settings_modal_body"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full bg-[#FAF9F6] text-stone-800 rounded-t-[30px] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-amber-800" />
                  <span className="font-serif font-bold text-stone-900 text-sm">Spiritual Settings</span>
                </div>
                <button
                  id="close_settings_btn"
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-stone-500 hover:text-stone-950 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-widest text-[#725e22] uppercase font-bold block">
                  Hugging Face API Key
                </label>
                <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                  Provide your own Hugging Face API key. Calls will be made directly to the Hugging Face Inference API securely from your browser/app.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="hf_..."
                    className="flex-1 text-xs font-semibold p-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#725e22] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem("HF_API_KEY", customApiKey);
                      setShowSettings(false);
                    }}
                    className="px-4 py-2 bg-[#0b0c0c] hover:bg-stone-800 text-stone-100 font-medium text-[11px] rounded-xl transition-all"
                  >
                    Save API Key
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}