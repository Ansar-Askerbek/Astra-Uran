import { motion } from "framer-motion";
import { GLSLHills}  from "@/shared/ui/glsl-hills"; // проверь путь импорта!
import { Shield, ChevronRight } from "lucide-react";

export default function HomePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      
      {/* Твой новый GLSL фон */}
      <div className="absolute inset-0 z-0">
        <GLSLHills speed={0.3} />
      </div>

      {/* Контент поверх фона */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 pointer-events-none"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
             <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded flex items-center justify-center">
                <Shield className="w-7 h-7 text-black" />
              </div>
              <h1 className="text-2xl font-bold tracking-[0.2em] text-white">ASTRA</h1>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            <span className="italic font-thin text-cyan-400">Autonomous Control <br/> </span>
            That Prevents Disasters
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Smart Wellhead. Zero-Delay Shutdown. <br/>
            Real-time telemetry for uranium ISR wells to contain spills before they spread.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pointer-events-auto"
        >
          <button
            onClick={() => onNavigate('/dashboard')}
            className="group relative px-8 py-4 bg-transparent border border-cyan-500/50 text-cyan-400 font-bold tracking-widest overflow-hidden transition-all hover:bg-cyan-500 hover:text-black rounded"
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER COMMAND CENTER <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* Нижняя панель со статусом */}
      <div className="absolute bottom-8 left-8 z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          SYSTEMS OPERATIONAL // GULF SECTOR A-1
        </div>
      </div>
    </div>
  );
}