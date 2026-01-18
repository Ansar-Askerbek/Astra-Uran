import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Shield, AlertTriangle, ChevronLeft, 
  Settings, Brain, Zap, Droplet, Cog, CheckCircle2
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

// --- КОНФИГУРАЦИЯ ---
const CONFIG = {
  // Используем приведение к any, чтобы TS не ругался на отсутствие env в Meta
  // API_KEY: (import.meta as any).env.VITE_OPENAI_API_KEY || "", Отключение для публикации
  API_KEY: "YOUR_OPENAI_API_KEY_HERE",
  NORMAL_PRESSURE: 4.0,
  NORMAL_FLOW: 0.5,
  CRITICAL_FLOW: 2.0,
};

interface LogEntry {
  time: string;
  msg: string;
  type: string;
}

export default function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [pressure, setPressure] = useState(4.0);
  const [flow, setFlow] = useState(0.5);
  const [valvePosition, setValvePosition] = useState(100);
  const [isLeaking, setIsLeaking] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>(Array(20).fill({ p: 4, f: 0.5 }));
  const [aiReport, setAiReport] = useState<any>(null);
  const [uptime, setUptime] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const totalLeakVolume = useRef(0);

  // --- ФУНКЦИЯ СБРОСА БЕЗ ПЕРЕЗАГРУЗКИ ---
  const handleReset = () => {
    setAiReport(null);
    setIsEmergency(false);
    setIsLeaking(false);
    setValvePosition(100);
    setPressure(4.0);
    setFlow(0.5);
    setLogs([]); // Очищаем логи
    totalLeakVolume.current = 0; // Сбрасываем счетчик утечки
    addLog("♻️ SYSTEM REBOOTED. PARAMETERS NORMALIZED.", "success");
  };

  const addLog = (msg: string, type = "info") => {
    const time = new Date().toLocaleTimeString().split(" ")[0];
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  // --- ЦИКЛ ФИЗИКИ ---
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      const noise = (Math.random() - 0.5) * 0.1;
      let newFlow = 0.5 + noise;
      let newPressure = 4.0 + noise;

      if (isLeaking) {
        const valveFactor = valvePosition / 100;
        if (valveFactor > 0) {
          newFlow = (3.8 + noise) * valveFactor;
          newPressure = 1.5 + noise;
          totalLeakVolume.current += newFlow;
        } else {
          newFlow = 0;
          newPressure = 4.0 + noise;
        }
      }

      setFlow(Number(newFlow.toFixed(2)));
      setPressure(Number(newPressure.toFixed(2)));
      setChartData(prev => [...prev.slice(1), { p: newPressure, f: newFlow }]);

      if (newFlow > CONFIG.CRITICAL_FLOW && valvePosition === 100 && !isEmergency) {
        setIsEmergency(true);
        startEmergencyShutdown();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLeaking, valvePosition, isEmergency]);

  const startEmergencyShutdown = () => {
    addLog("⚠️ ABNORMAL FLOW DETECTED!", "error");
    addLog("🚫 EMERGENCY SHUTDOWN INITIATED", "error");
    
    let pos = 100;
    const vInterval = setInterval(() => {
      pos -= 5;
      setValvePosition(pos);
      if (pos <= 0) {
        clearInterval(vInterval);
        addLog("✅ VALVE CLOSED. LEAK CONTAINED.", "success");
        fetchAIReport();
      }
    }, 100);
  };

  const fetchAIReport = async () => {
    setIsAiLoading(true);
    addLog("🔄 AI Sentinel analyzing telemetry...", "ai");
    const savedMoney = Math.floor(5400000 - (totalLeakVolume.current * 450));
    const roi = Math.floor((savedMoney / 20000) * 100);

    const prompt = `Uranium ISR leak. Volume: ${totalLeakVolume.current.toFixed(2)}L, Saved: ${savedMoney} Tenge. Task: JSON with "summary" and "finance" in Russian about reaction time and prevention.`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${CONFIG.API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{role: "user", content: prompt}], response_format: { type: "json_object" } })
      });
      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      setAiReport({ summary: content.summary, finance: content.finance, roi: `${roi}%` });
      addLog("📄 AI Analysis complete.", "success");
    } catch (e) {
      addLog("⚠️ AI Offline. Using local heuristic.", "error");
      setAiReport({ summary: "Автоматика перекрыла поток. Гидроудар предотвращен.", finance: `Экономия: ${savedMoney.toLocaleString()} ₸`, roi: `${roi}%` });
    } finally { setIsAiLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff41] font-mono p-4 flex flex-col gap-4 overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center border border-[#333] p-4 bg-gray-900/50 rounded-lg shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('/')} className="hover:bg-white/10 p-2 rounded transition-colors text-gray-400"><ChevronLeft /></button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="text-blue-500 w-5 h-5" /> ASTRA SCADA</h1>
        </div>
        <div className="text-right">
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isEmergency ? 'bg-red-900/50 text-red-400 border-red-500 animate-pulse' : 'bg-green-900/50 text-green-400 border-green-500'}`}>
            {isEmergency ? 'CRITICAL FAILURE' : 'NORMAL OPERATION'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest uppercase">UPTIME: {new Date(uptime * 1000).toISOString().substr(11, 8)}</div>
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
        {/* LEFT PANEL */}
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-gray-900/30 border border-[#333] p-4 rounded-lg flex flex-col">
            <h3 className="text-white text-[10px] uppercase mb-4 opacity-50">Physical Twin</h3>
            <div className="flex justify-between text-[10px] mb-4"><span>VALVE: <span className="text-blue-400">{valvePosition}% OPEN</span></span></div>
            <div className="flex justify-center py-6">
              <motion.div animate={{ rotate: 360 - (valvePosition * 3.6) }} transition={{ type: "spring", stiffness: 50 }}>
                <Cog className={`w-16 h-16 ${valvePosition === 0 ? 'text-red-500' : 'text-gray-600'}`} />
              </motion.div>
            </div>
            <div className="h-8 w-full bg-gray-800 rounded relative overflow-hidden border border-gray-700">
               <motion.div className={`absolute inset-0 ${isLeaking && valvePosition > 0 ? 'bg-red-600' : 'bg-blue-600'} opacity-50`} style={{ width: `${valvePosition}%` }} />
               <motion.div className="absolute inset-0" animate={{ x: [-40, 0] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, transparent 25%)', backgroundSize: '40px 100%' }} />
            </div>
            <button disabled={isLeaking || isEmergency} onClick={() => setIsLeaking(true)} className="mt-6 py-2 border border-red-900/50 text-red-500 text-[10px] hover:bg-red-900/20 disabled:opacity-30 uppercase tracking-widest transition-all">Simulate Failure</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 border border-gray-800 p-3 rounded text-center">
              <div className="text-[9px] text-gray-500 uppercase">Pressure</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{pressure} <span className="text-[10px] font-normal text-gray-600">Bar</span></div>
            </div>
            <div className="bg-black/50 border border-gray-800 p-3 rounded text-center">
              <div className="text-[9px] text-gray-500 uppercase">Flow</div>
              <div className="text-xl font-bold text-purple-400 font-mono">{flow} <span className="text-[10px] font-normal text-gray-600">L/s</span></div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-5 bg-gray-900/30 border border-[#333] p-4 rounded-lg flex flex-col min-h-0">
          <h3 className="text-white text-[10px] uppercase mb-4 opacity-50">Real-time Telemetry</h3>
          <div className="flex-grow min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis hide />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Line type="monotone" dataKey="p" stroke="#06b6d4" dot={false} isAnimationActive={false} strokeWidth={2} />
                <Line type="monotone" dataKey="f" stroke="#a855f7" dot={false} isAnimationActive={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT PANEL: AI SENTINEL */}
        <div className="col-span-3 bg-black border border-gray-800 p-4 rounded-lg flex flex-col min-h-0 relative">
          <h3 className="text-white text-[10px] border-b border-gray-800 pb-2 mb-4 flex justify-between items-center uppercase tracking-widest">
            <span>AI Sentinel Core</span>
            <Brain className={`w-3 h-3 ${isAiLoading ? 'text-yellow-400 animate-pulse' : 'text-blue-500'}`} />
          </h3>
          
          <div className="flex-grow overflow-y-auto text-[10px] space-y-2 font-mono scrollbar-hide">
            {!aiReport ? (
              <>
                {/* --- НОВАЯ НАДПИСЬ: ПОКА ВСЁ ОК --- */}
                {!isEmergency && !isLeaking && (
                   <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="p-3 border border-green-900/30 bg-green-900/5 rounded-md mb-4 flex items-center gap-2"
                   >
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-green-500 font-bold uppercase tracking-tighter">Systems Nominal // All OK</span>
                   </motion.div>
                )}

                {logs.map((l, i) => (
                  <div key={i} className={l.type === 'error' ? 'text-red-500' : l.type === 'ai' ? 'text-yellow-400' : l.type === 'success' ? 'text-green-400' : 'text-gray-600'}>
                    [{l.time}] {l.msg}
                  </div>
                ))}
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-2 bg-blue-900/10 border border-blue-900/30 rounded text-gray-300">
                  <div className="text-blue-400 font-bold mb-1 underline tracking-widest text-[8px]">ANALYSIS REPORT:</div>
                  {aiReport.summary}
                </div>
                <div className="p-2 bg-green-900/10 border border-green-900/30 rounded text-gray-300">
                  <div className="text-green-400 font-bold mb-1 underline tracking-widest text-[8px]">FINANCIAL PROTECTION:</div>
                  {aiReport.finance}
                </div>
                <div className="text-right text-[10px] font-bold text-green-500 uppercase tracking-widest">Calculated ROI: {aiReport.roi}</div>
                
                {/* --- ИСПРАВЛЕННЫЙ СБРОС --- */}
                <button 
                  onClick={handleReset} 
                  className="w-full py-2 bg-gray-900 border border-gray-800 text-white rounded text-[10px] hover:bg-gray-800 transition-all uppercase tracking-widest"
                >
                  Reset System
                </button>
              </motion.div>
            )}
            {isAiLoading && <div className="text-yellow-400 animate-pulse">[ANALYZING DATA STREAM...]</div>}
          </div>
        </div>
      </div>
    </div>
  );
}