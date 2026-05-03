import React, { useState, useEffect } from 'react';
import { Activity, Zap, HardDrive, Clock } from 'lucide-react';
import { getPerformanceMetrics, getMemoryUsage } from '../../utils/performance';

/**
 * PerformanceMonitor Component - Development tool for monitoring performance
 * Only visible in development mode
 * 
 * Shows:
 * - FPS (Frames Per Second)
 * - Memory usage
 * - Performance metrics (FCP, TTI, etc.)
 * - Network status
 */
const PerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Calculate FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId;
    
    const calculateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(calculateFPS);
    };
    
    animationFrameId = requestAnimationFrame(calculateFPS);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  // Update memory and metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMemory(getMemoryUsage());
      setMetrics(getPerformanceMetrics());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
        title="Show Performance Monitor (Ctrl+Shift+P)"
      >
        <Activity size={20} />
      </button>
    );
  }
  
  const getFPSColor = (fps) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getMemoryColor = (percent) => {
    if (percent < 50) return 'text-green-600';
    if (percent < 80) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-slate-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          <span className="text-sm font-bold">Performance Monitor</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      
      {/* Metrics */}
      <div className="p-3 space-y-3 text-xs">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-slate-300">FPS</span>
          </div>
          <span className={`font-bold ${getFPSColor(fps)}`}>
            {fps}
          </span>
        </div>
        
        {/* Memory */}
        {memory && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-purple-400" />
                <span className="text-slate-300">Memory</span>
              </div>
              <span className={`font-bold ${getMemoryColor(memory.usagePercent)}`}>
                {memory.usagePercent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  memory.usagePercent < 50
                    ? 'bg-green-500'
                    : memory.usagePercent < 80
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${memory.usagePercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {(memory.usedJSHeapSize / 1048576).toFixed(1)} MB / {(memory.jsHeapSizeLimit / 1048576).toFixed(1)} MB
            </div>
          </div>
        )}
        
        {/* Performance Metrics */}
        {metrics && (
          <div className="space-y-1 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-green-400" />
              <span className="text-slate-300 font-semibold">Metrics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400">FCP:</span>
                <span className="ml-1 text-white font-semibold">
                  {metrics.fcp.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-slate-400">TTI:</span>
                <span className="ml-1 text-white font-semibold">
                  {metrics.tti.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-slate-400">DCL:</span>
                <span className="ml-1 text-white font-semibold">
                  {metrics.dcl.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-slate-400">Load:</span>
                <span className="ml-1 text-white font-semibold">
                  {metrics.load.toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Network Status */}
        {navigator.connection && (
          <div className="pt-2 border-t border-slate-700">
            <div className="text-[10px] text-slate-400">
              Network: <span className="text-white font-semibold">
                {navigator.connection.effectiveType || 'unknown'}
              </span>
              {navigator.connection.downlink && (
                <span className="ml-2">
                  ({navigator.connection.downlink} Mbps)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-2 bg-slate-800 border-t border-slate-700 text-[10px] text-slate-400 text-center">
        Press <kbd className="px-1 py-0.5 bg-slate-700 rounded">Ctrl+Shift+P</kbd> to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
