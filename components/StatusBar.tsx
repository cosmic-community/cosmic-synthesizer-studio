'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Clock, 
  Zap,
  Volume2,
  Mic,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface StatusBarProps {
  isConnected: boolean;
  cpuUsage: number;
  memoryUsage: number;
  audioLatency: number;
  sampleRate: number;
  bufferSize: number;
  activeVoices: number;
  masterLevel: number;
  inputLevel: number;
  projectName?: string;
  isDirty?: boolean;
  messages?: StatusMessage[];
  className?: string;
}

interface StatusMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  dismissible?: boolean;
}

interface StatusIndicatorProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'error';
  onClick?: () => void;
  unit?: string;
  className?: string;
}

function StatusIndicator({ 
  label, 
  value, 
  icon, 
  status = 'good', 
  onClick, 
  unit = '',
  className 
}: StatusIndicatorProps) {
  const statusColors = {
    good: 'text-synth-accent',
    warning: 'text-yellow-400',
    error: 'text-synth-warning'
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1 rounded-lg glass-control cursor-pointer',
        'hover:bg-synth-control/60 transition-colors duration-200',
        'min-w-0', // Prevent text overflow
        className
      )}
      onClick={onClick}
      title={`${label}: ${value}${unit}`}
    >
      <span className={clsx('w-4 h-4 flex-shrink-0', statusColors[status])}>
        {icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-gray-400 truncate">{label}</span>
        <span className={clsx('text-sm font-mono font-bold truncate', statusColors[status])}>
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit}
        </span>
      </div>
    </div>
  );
}

function MessageToast({ 
  message, 
  onDismiss 
}: { 
  message: StatusMessage; 
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message.dismissible !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(message.id), 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message.id, message.dismissible, onDismiss]);

  const iconMap = {
    info: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />
  };

  const colorMap = {
    info: 'border-synth-info text-synth-info',
    warning: 'border-yellow-400 text-yellow-400',
    error: 'border-synth-warning text-synth-warning',
    success: 'border-synth-accent text-synth-accent'
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-2 glass-tooltip rounded-lg border',
        'transition-all duration-300 transform',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        colorMap[message.type]
      )}
    >
      {iconMap[message.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{message.message}</p>
        <p className="text-xs opacity-75">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
      {message.dismissible !== false && (
        <button
          onClick={() => onDismiss(message.id)}
          className="text-current hover:opacity-80 transition-opacity"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function StatusBar({
  isConnected,
  cpuUsage,
  memoryUsage,
  audioLatency,
  sampleRate,
  bufferSize,
  activeVoices,
  masterLevel,
  inputLevel,
  projectName = 'Untitled Project',
  isDirty = false,
  messages = [],
  className
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleMessages, setVisibleMessages] = useState<StatusMessage[]>(messages);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Update visible messages when messages prop changes
  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  const dismissMessage = (id: string) => {
    setVisibleMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const getCpuStatus = (): 'good' | 'warning' | 'error' => {
    if (cpuUsage > 80) return 'error';
    if (cpuUsage > 60) return 'warning';
    return 'good';
  };

  const getMemoryStatus = (): 'good' | 'warning' | 'error' => {
    if (memoryUsage > 80) return 'error';
    if (memoryUsage > 60) return 'warning';
    return 'good';
  };

  const getLatencyStatus = (): 'good' | 'warning' | 'error' => {
    if (audioLatency > 50) return 'error';
    if (audioLatency > 20) return 'warning';
    return 'good';
  };

  const getLevelColor = (level: number): string => {
    if (level > 0.9) return 'text-synth-warning';
    if (level > 0.7) return 'text-yellow-400';
    return 'text-synth-accent';
  };

  return (
    <>
      <div className={clsx(
        'glass-toolbar border-t border-white/10',
        'px-4 py-2 flex items-center justify-between gap-4',
        'text-sm text-white overflow-x-auto',
        className
      )}>
        {/* Left section - Project info */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Project:</span>
            <span className="font-medium">
              {projectName}
              {isDirty && <span className="text-synth-accent ml-1">*</span>}
            </span>
          </div>
          
          <StatusIndicator
            label="Connection"
            value={isConnected ? 'Online' : 'Offline'}
            icon={isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            status={isConnected ? 'good' : 'error'}
          />
        </div>

        {/* Center section - Performance metrics */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusIndicator
            label="CPU"
            value={cpuUsage}
            icon={<Cpu className="w-4 h-4" />}
            status={getCpuStatus()}
            unit="%"
          />
          
          <StatusIndicator
            label="Memory"
            value={memoryUsage}
            icon={<HardDrive className="w-4 h-4" />}
            status={getMemoryStatus()}
            unit="%"
          />
          
          <StatusIndicator
            label="Latency"
            value={audioLatency}
            icon={<Activity className="w-4 h-4" />}
            status={getLatencyStatus()}
            unit="ms"
          />
          
          <StatusIndicator
            label="Voices"
            value={activeVoices}
            icon={<Zap className="w-4 h-4" />}
            status={activeVoices > 32 ? 'warning' : 'good'}
          />
        </div>

        {/* Right section - Audio levels and time */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Audio levels */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-12 h-2 bg-synth-control rounded-full overflow-hidden">
                  <div 
                    className={clsx('h-full transition-all duration-100', getLevelColor(masterLevel))}
                    style={{ 
                      width: `${Math.min(100, masterLevel * 100)}%`,
                      backgroundColor: 'currentColor'
                    }}
                  />
                </div>
                <span className={clsx('text-xs font-mono ml-1 w-8', getLevelColor(masterLevel))}>
                  {Math.round(masterLevel * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Mic className="w-4 h-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-12 h-2 bg-synth-control rounded-full overflow-hidden">
                  <div 
                    className={clsx('h-full transition-all duration-100', getLevelColor(inputLevel))}
                    style={{ 
                      width: `${Math.min(100, inputLevel * 100)}%`,
                      backgroundColor: 'currentColor'
                    }}
                  />
                </div>
                <span className={clsx('text-xs font-mono ml-1 w-8', getLevelColor(inputLevel))}>
                  {Math.round(inputLevel * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Audio settings */}
          <StatusIndicator
            label="Sample Rate"
            value={`${sampleRate / 1000}k`}
            icon={<Settings className="w-4 h-4" />}
            status="good"
          />
          
          <StatusIndicator
            label="Buffer"
            value={bufferSize}
            icon={<Activity className="w-4 h-4" />}
            status="good"
          />
          
          {/* Current time */}
          <StatusIndicator
            label="Time"
            value={currentTime.toLocaleTimeString()}
            icon={<Clock className="w-4 h-4" />}
            status="good"
          />
        </div>
      </div>

      {/* Message toasts */}
      {visibleMessages.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
          {visibleMessages.map(message => (
            <MessageToast
              key={message.id}
              message={message}
              onDismiss={dismissMessage}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Hook for managing status messages
export function useStatusMessages() {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const addMessage = (
    type: StatusMessage['type'],
    message: string,
    dismissible = true
  ) => {
    const newMessage: StatusMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      dismissible
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    return newMessage.id;
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages
  };
}