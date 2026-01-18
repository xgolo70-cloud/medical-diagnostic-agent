import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { Button } from '../ui/Button';

export const MedASRPromo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden relative group cursor-pointer"
            onClick={() => navigate('/medai')}
        >
            <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                <Mic size={100} className="text-white transform rotate-12" />
            </div>
            
            <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Beta Access</span>
                    </div>
                    <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                    />
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-white tracking-tight">MedASR Audio</h3>
                <p className="text-sm text-blue-50/90 leading-relaxed mb-6 font-medium">
                    Capture clinical notes via voice with 99.9% medical term accuracy.
                </p>
                
                <Button 
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/medai');
                    }}
                    className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 border-none font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-xl group-hover:translate-y-[-2px]"
                >
                    Try Feature Now
                </Button>
            </div>
        </motion.div>
    );
};

export default MedASRPromo;
