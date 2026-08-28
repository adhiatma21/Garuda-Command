import React, { useState } from 'react';
import { Radio, Volume2, ChevronUp, ChevronDown, MessageSquareText, Send, Mic, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommsMessage } from '../../engine/aviationCommsEngine';

interface RadioCommsFeedProps {
  language: 'id' | 'en';
  messages: CommsMessage[];
  activeFrequency?: string;
  onReplayAudio?: (text: string, isATC: boolean) => void;
  onTransmitMessage?: (text: string) => void;
}

export const RadioCommsFeed: React.FC<RadioCommsFeedProps> = ({
  language,
  messages,
  activeFrequency = '128.20 MHz',
  onReplayAudio,
  onTransmitMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const handleSend = () => {
    if (!inputText.trim() || !onTransmitMessage) return;
    setIsTransmitting(true);
    onTransmitMessage(inputText.trim());
    setInputText('');
    setTimeout(() => setIsTransmitting(false), 800);
  };

  const handleQuickPreset = (presetText: string) => {
    if (!onTransmitMessage) return;
    setIsTransmitting(true);
    onTransmitMessage(presetText);
    setTimeout(() => setIsTransmitting(false), 800);
  };

  const quickPresets = language === 'id' ? [
    { label: '📡 Lapor Kontak Intel', text: 'Garuda Sektor & Pesawat Intai, lapor status deteksi kontak radar dan sensor optik di wilayah operasi.' },
    { label: '🎯 Konfirmasi Target & Laser', text: 'Pesawat Intai, konfirmasi titik koordinat sasaran dan status pancaran laser penanda target.' },
    { label: '🚀 Ijin Tembak & Pelepasan Rudal', text: 'Garuda Tower & Sektor, meminta izin pelepasan munisi presisi terhadap target teridentifikasi.' },
    { label: '✈️ Formasi Pengawalan Terkunci', text: 'Indonesia-01, formasi sayap pengawalan terkunci stabil di 0.3 NM. Kecepatan dan elevasi sinkron.' },
    { label: '🛡️ Radar 360° Sektor Aman', text: 'Garuda Sektor, radar sapuan 360 derajat bersih. Koridor kedaulatan udara aman tanpa ancaman.' },
    { label: '⛽ Cek BBM & Sistem Tempur', text: 'Garuda Control, lapor status bahan bakar internal dan kesiapan sistem mesin dalam kondisi optimal.' },
    { label: '🛬 Ijin Pendaratan Runway Pangkalan', text: 'Garuda Approach, meminta izin persiapan pendekatan pendaratan dan prioritas runway aktif.' },
    { label: '📻 Radio Check 5x5', text: 'Garuda Tower dan Pesawat Intai, radio check 5 per 5 kuat dan jelas di frekuensi taktis.' }
  ] : [
    { label: '📡 Report Recon Intel', text: 'Garuda Sector & Recon, report current radar sweep and electro-optical sensor contacts in operational box.' },
    { label: '🎯 Confirm Target & Laser Spot', text: 'Recon Intel, confirm target coordinates telemetry and laser designator spot lock.' },
    { label: '🚀 Weapons Release Clearance', text: 'Garuda Tower & Sector, requesting clearance for precision weapons release on designated hostile target.' },
    { label: '✈️ Formation Locked', text: 'Indonesia-01, escort wing station locked steady at 0.3 NM. Speed and altitude synced.' },
    { label: '🛡️ Sector Clear 360°', text: 'Garuda Sector, 360-degree radar sweep clean. Air corridor is secure.' },
    { label: '⛽ Fuel & Systems Check', text: 'Garuda Control, reporting fuel state and combat systems performance nominal.' },
    { label: '🛬 Landing Priority Clearance', text: 'Garuda Approach, requesting descent and priority landing clearance for active runway.' },
    { label: '📻 Radio Check 5x5', text: 'Garuda Tower and Recon Intel, radio check 5 by 5 loud and clear on tactical frequency.' }
  ];

  return (
    <div className="absolute top-6 left-6 z-[2000] pointer-events-auto max-w-[440px] w-full">
      <div className="bg-black/90 backdrop-blur-xl border border-blue-500/40 rounded-xl shadow-2xl overflow-hidden ring-1 ring-blue-500/20">
        {/* Header Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-indigo-950/95 border-b border-blue-500/30 flex items-center justify-between cursor-pointer hover:bg-blue-900/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTransmitting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
              {language === 'id' ? 'KOMUNIKASI RADIO TAKTIS (TOWER, PESAWAT INTAI & PILOT)' : 'TACTICAL RADIO COMMS (TOWER, RECON & PILOT)'}
              {isTransmitting && (
                <span className="text-[7.5px] px-1.5 py-0.2 bg-amber-500 text-black font-black rounded animate-pulse">
                  TX TRANSMITTING
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-cyan-300 bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {latestMessage?.frequency || activeFrequency}
            </span>
            <button className="text-white/40 hover:text-white transition-colors">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Latest Active Broadcast Banner */}
        <div className="p-3 space-y-2.5">
          {latestMessage ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={latestMessage.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-[8px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded font-black tracking-wider text-[7px] ${
                      latestMessage.sender === 'RECON'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : latestMessage.sender === 'TOWER' || latestMessage.sender === 'ATC' 
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' 
                        : latestMessage.sender === 'VVIP'
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                        : latestMessage.sender === 'AWACS'
                        ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                        : 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {latestMessage.sender === 'RECON'
                        ? '📡 INTAI / RECON'
                        : latestMessage.sender === 'TOWER'
                        ? '🗼 TOWER / CONTROL'
                        : latestMessage.sender === 'ATC'
                        ? '🗼 RADAR / ATC'
                        : latestMessage.sender === 'VVIP'
                        ? '★ VVIP VIP'
                        : latestMessage.sender === 'AWACS'
                        ? '🛰️ AWACS'
                        : '✈️ PILOT'} : {latestMessage.callsign}
                    </span>
                    <span className="text-white/40">{latestMessage.timestamp}</span>
                  </div>

                  {onReplayAudio && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = language === 'id' ? latestMessage.textId : latestMessage.textEn;
                        onReplayAudio(text, latestMessage.sender === 'ATC' || latestMessage.sender === 'TOWER' || latestMessage.sender === 'AWACS');
                      }}
                      className="p-1 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded transition-all"
                      title={language === 'id' ? 'Putar Ulang Audio Radio' : 'Replay Radio Audio'}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className={`text-[9.5px] font-mono font-semibold leading-relaxed tracking-tight pl-1.5 border-l-2 ${
                  latestMessage.sender === 'RECON'
                    ? 'text-emerald-200 border-emerald-500/70 bg-emerald-950/20 py-0.5 rounded-r'
                    : latestMessage.sender === 'VVIP' 
                    ? 'text-rose-200 border-rose-500/70 bg-rose-950/20 py-0.5 rounded-r' 
                    : latestMessage.sender === 'ATC' || latestMessage.sender === 'TOWER'
                    ? 'text-amber-200 border-amber-500/70'
                    : latestMessage.sender === 'PILOT'
                    ? 'text-cyan-200 border-cyan-500/70'
                    : 'text-emerald-300 border-emerald-500/70'
                }`}>
                  "{language === 'id' ? latestMessage.textId : latestMessage.textEn}"
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-[8.5px] font-mono text-white/40 italic">
              {language === 'id' ? 'Siaga radio aktif pada frekuensi 128.20 MHz...' : 'Radio standby on 128.20 MHz...'}
            </div>
          )}

          {/* Interactive Player Radio Transmission Console */}
          {onTransmitMessage && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      language === 'id' 
                        ? 'Ketik transmisi radio (contoh: "Pesawat Intai, lapor status sasaran")...' 
                        : 'Type radio message (e.g. "Recon Intel, report target status")...'
                    }
                    className="w-full bg-slate-900/90 border border-blue-500/30 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all pr-7"
                  />
                  <Mic className="w-3 h-3 text-white/30 absolute right-2 top-2 pointer-events-none" />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTransmitting}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-lg font-mono font-bold text-[8.5px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>{language === 'id' ? 'TX' : 'TX'}</span>
                </button>
              </div>

              {/* Quick Tactical Preset Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {quickPresets.map((preset, pIdx) => (
                  <button
                    key={`quick-preset-${pIdx}`}
                    onClick={() => handleQuickPreset(preset.text)}
                    className="shrink-0 px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[7.5px] font-mono text-cyan-200/90 hover:text-white transition-all whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Comms Transcript History */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-2 border-t border-white/10 space-y-2 max-h-[220px] overflow-y-auto pr-1"
              >
                <div className="text-[7px] uppercase tracking-widest text-white/40 font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MessageSquareText className="w-2.5 h-2.5 text-blue-400" />
                    <span>{language === 'id' ? 'TRANSKRIP RADIO 3-ARAH TERAKHIR' : 'RECENT 3-WAY RADIO TRANSCRIPT'}</span>
                  </div>
                  <span className="text-[6.5px] text-white/30">{messages.length} log</span>
                </div>

                {messages.slice(-10).reverse().map((msg, idx) => (
                  <div key={`comm-msg-${msg.id}-${idx}`} className={`p-2 rounded border space-y-0.5 ${
                    msg.sender === 'RECON'
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : msg.sender === 'VVIP' 
                      ? 'bg-rose-950/30 border-rose-500/30' 
                      : msg.sender === 'ATC' || msg.sender === 'TOWER'
                      ? 'bg-amber-950/20 border-amber-500/20'
                      : msg.sender === 'PILOT'
                      ? 'bg-cyan-950/20 border-cyan-500/20'
                      : 'bg-black/40 border-white/5'
                  }`}>
                    <div className="flex justify-between items-center text-[7px] font-mono">
                      <span className={`font-bold flex items-center gap-1 ${
                        msg.sender === 'RECON'
                          ? 'text-emerald-400'
                          : msg.sender === 'ATC' || msg.sender === 'TOWER'
                          ? 'text-amber-400' 
                          : msg.sender === 'VVIP' 
                          ? 'text-rose-400' 
                          : msg.sender === 'PILOT'
                          ? 'text-cyan-300'
                          : 'text-purple-400'
                      }`}>
                        [{msg.timestamp}] {msg.sender === 'RECON' ? '📡 RECON' : msg.sender === 'TOWER' ? '🗼 TOWER' : msg.sender === 'ATC' ? '🗼 ATC' : msg.sender === 'VVIP' ? '★ VIP' : '✈️ PILOT'}: {msg.callsign}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-white/30 text-[6px]">{msg.frequency}</span>
                        {onReplayAudio && (
                          <button
                            onClick={() => {
                              const text = language === 'id' ? msg.textId : msg.textEn;
                              onReplayAudio(text, msg.sender === 'ATC' || msg.sender === 'TOWER' || msg.sender === 'AWACS');
                            }}
                            className="p-0.5 text-white/30 hover:text-cyan-300 transition-colors"
                          >
                            <Volume2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[8px] font-mono text-white/85 leading-snug">
                      {language === 'id' ? msg.textId : msg.textEn}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

