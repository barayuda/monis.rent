'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, PRESET_WORKSPACES } from '../constants/products';

type CurrencyType = 'USD' | 'IDR';
type DayNightType = 'day' | 'night';

export interface CustomPreset {
  id: string;
  name: string;
  deskId: string;
  chairId: string;
  accessoryIds: string[];
  customPositions: Record<string, [number, number, number]>;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface ConfigState {
  selectedDeskId: string;
  selectedChairId: string;
  selectedAccessoryIds: string[];
  customPositions: Record<string, [number, number, number]>;
}

interface ConfiguratorContextProps {
  selectedDeskId: string;
  selectedChairId: string;
  selectedAccessoryIds: string[];
  leaseDuration: number;
  dayNightMode: DayNightType;
  ledColor: string;
  currency: CurrencyType;
  customPositions: Record<string, [number, number, number]>;
  isDragging: boolean;
  
  // Dynamic UX states
  activeTab: 'desk' | 'chair' | 'tech' | 'eco';
  soundEnabled: boolean;
  customPresets: CustomPreset[];
  toasts: Toast[];
  canUndo: boolean;
  canRedo: boolean;
  
  selectDesk: (id: string) => void;
  selectChair: (id: string) => void;
  toggleAccessory: (id: string) => void;
  setLeaseDuration: (months: number) => void;
  setDayNightMode: (mode: DayNightType) => void;
  setLedColor: (color: string) => void;
  setCurrency: (cur: CurrencyType) => void;
  selectPreset: (presetId: string) => void;
  
  getMonthlyRate: () => { baseRate: number; discountedRate: number; discountPercent: number };
  getFormattedPrice: (amount: number) => string;
  
  updateCustomPosition: (itemId: string, pos: [number, number, number]) => void;
  resetAllPositions: () => void;
  setIsDragging: (dragging: boolean) => void;
  
  // Advanced UX actions
  setActiveTab: (tab: 'desk' | 'chair' | 'tech' | 'eco') => void;
  setSoundEnabled: (enabled: boolean) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: number) => void;
  undo: () => void;
  redo: () => void;
}

const ConfiguratorContext = createContext<ConfiguratorContextProps | undefined>(undefined);

// Procedural audio synthesizer using Web Audio API (Zero load delay, zero assets bandwidth)
const playProceduralSound = (type: 'click' | 'sweep' | 'swoosh' | 'snap', enabled: boolean) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
      // Soft wood/plastic switch click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'snap') {
      // High-fidelity item grab click / alignment latch
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'sweep') {
      // Low sunset frequency sweep for ambience toggles
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'swoosh') {
      // Fast sweeping low-to-high swoop for resets/undos
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.25);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn('Procedural audio synthesis blocked or failed:', e);
  }
};

export const ConfiguratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDeskId, setSelectedDeskId] = useState('desk-bamboo');
  const [selectedChairId, setSelectedChairId] = useState('chair-ergo');
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>(['eco-plant', 'eco-lamp', 'tech-input']);
  const [leaseDuration, setLeaseDurationState] = useState(6);
  const [dayNightMode, setDayNightMode] = useState<DayNightType>('day');
  const [ledColor, setLedColor] = useState('#fbbf24');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [customPositions, setCustomPositions] = useState<Record<string, [number, number, number]>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic UX Enhancement states
  const [activeTab, setActiveTab] = useState<'desk' | 'chair' | 'tech' | 'eco'>('desk');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // History tracking buffer for Undo & Redo
  const [history, setHistory] = useState<ConfigState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load from local storage dynamically
  useEffect(() => {
    let parsedDesk = 'desk-bamboo';
    let parsedChair = 'chair-ergo';
    let parsedAccs = ['eco-plant', 'eco-lamp', 'tech-input'];
    let parsedPositions = {};

    const saved = localStorage.getItem('monis-workspace-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDeskId) {
          setSelectedDeskId(parsed.selectedDeskId);
          parsedDesk = parsed.selectedDeskId;
        }
        if (parsed.selectedChairId) {
          setSelectedChairId(parsed.selectedChairId);
          parsedChair = parsed.selectedChairId;
        }
        if (parsed.selectedAccessoryIds) {
          setSelectedAccessoryIds(parsed.selectedAccessoryIds);
          parsedAccs = parsed.selectedAccessoryIds;
        }
        if (parsed.leaseDuration) setLeaseDurationState(parsed.leaseDuration);
        if (parsed.dayNightMode) setDayNightMode(parsed.dayNightMode);
        if (parsed.ledColor) setLedColor(parsed.ledColor);
        if (parsed.currency) setCurrency(parsed.currency);
      } catch (e) {
        console.error("Error parsing saved workspace config", e);
      }
    }
    const savedPositions = localStorage.getItem('monis-custom-positions');
    if (savedPositions) {
      try {
        const parsed = JSON.parse(savedPositions);
        setCustomPositions(parsed);
        parsedPositions = parsed;
      } catch (e) {
        console.error("Error parsing saved custom positions", e);
      }
    }
    const savedSound = localStorage.getItem('monis-sound-enabled');
    if (savedSound !== null) {
      setSoundEnabledState(savedSound === 'true');
    }
    const savedCustom = localStorage.getItem('monis-custom-presets');
    if (savedCustom) {
      try {
        setCustomPresets(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Error parsing custom presets", e);
      }
    }

    // Set initial loaded state in history stack
    const initial: ConfigState = {
      selectedDeskId: parsedDesk,
      selectedChairId: parsedChair,
      selectedAccessoryIds: parsedAccs,
      customPositions: parsedPositions,
    };
    setHistory([initial]);
    setHistoryIndex(0);
  }, []);

  // Save config details helper
  const saveConfig = (
    desk: string,
    chair: string,
    accs: string[],
    duration: number,
    mode: DayNightType,
    color: string,
    cur: CurrencyType
  ) => {
    localStorage.setItem(
      'monis-workspace-config',
      JSON.stringify({
        selectedDeskId: desk,
        selectedChairId: chair,
        selectedAccessoryIds: accs,
        leaseDuration: duration,
        dayNightMode: mode,
        ledColor: color,
        currency: cur,
      })
    );
  };

  // Toast Notification triggers
  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3200);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sound FX toggle
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('monis-sound-enabled', String(enabled));
    addToast(enabled ? 'Procedural Sound FX enabled 🔊' : 'Procedural Sound FX muted 🔇', 'info');
    if (enabled) {
      playProceduralSound('click', true);
    }
  };

  // Push new state onto history stack
  const pushToHistory = (
    desk: string,
    chair: string,
    accs: string[],
    positions: Record<string, [number, number, number]>
  ) => {
    const newState: ConfigState = {
      selectedDeskId: desk,
      selectedChairId: chair,
      selectedAccessoryIds: [...accs],
      customPositions: { ...positions },
    };

    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      
      // Prevent consecutive identical pushes
      if (nextHistory.length > 0) {
        const last = nextHistory[nextHistory.length - 1];
        const isIdentical = 
          last.selectedDeskId === newState.selectedDeskId &&
          last.selectedChairId === newState.selectedChairId &&
          JSON.stringify(last.selectedAccessoryIds.sort()) === JSON.stringify(newState.selectedAccessoryIds.sort()) &&
          JSON.stringify(last.customPositions) === JSON.stringify(newState.customPositions);
          
        if (isIdentical) return prev;
      }
      
      const updated = [...nextHistory, newState];
      if (updated.length > 30) {
        updated.shift();
      }
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  };

  // Undo Action
  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const state = history[prevIdx];
      
      setSelectedDeskId(state.selectedDeskId);
      setSelectedChairId(state.selectedChairId);
      setSelectedAccessoryIds(state.selectedAccessoryIds);
      setCustomPositions(state.customPositions);
      setHistoryIndex(prevIdx);
      
      saveConfig(
        state.selectedDeskId,
        state.selectedChairId,
        state.selectedAccessoryIds,
        leaseDuration,
        dayNightMode,
        ledColor,
        currency
      );
      
      if (Object.keys(state.customPositions).length > 0) {
        localStorage.setItem('monis-custom-positions', JSON.stringify(state.customPositions));
      } else {
        localStorage.removeItem('monis-custom-positions');
      }

      playProceduralSound('swoosh', soundEnabled);
      addToast('Undone last configurator change ↩️', 'info');
    }
  };

  // Redo Action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const state = history[nextIdx];
      
      setSelectedDeskId(state.selectedDeskId);
      setSelectedChairId(state.selectedChairId);
      setSelectedAccessoryIds(state.selectedAccessoryIds);
      setCustomPositions(state.customPositions);
      setHistoryIndex(nextIdx);
      
      saveConfig(
        state.selectedDeskId,
        state.selectedChairId,
        state.selectedAccessoryIds,
        leaseDuration,
        dayNightMode,
        ledColor,
        currency
      );
      
      if (Object.keys(state.customPositions).length > 0) {
        localStorage.setItem('monis-custom-positions', JSON.stringify(state.customPositions));
      } else {
        localStorage.removeItem('monis-custom-positions');
      }

      playProceduralSound('snap', soundEnabled);
      addToast('Redone configuration change ↪️', 'info');
    }
  };

  const selectDesk = (id: string) => {
    setSelectedDeskId(id);
    saveConfig(id, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, currency);
    pushToHistory(id, selectedChairId, selectedAccessoryIds, customPositions);
    
    const item = PRODUCTS.find((p) => p.id === id);
    addToast(`Selected desk style: ${item?.name || id} 🪵`, 'success');
    playProceduralSound('click', soundEnabled);
  };

  const selectChair = (id: string) => {
    setSelectedChairId(id);
    saveConfig(selectedDeskId, id, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, currency);
    pushToHistory(selectedDeskId, id, selectedAccessoryIds, customPositions);
    
    const item = PRODUCTS.find((p) => p.id === id);
    addToast(`Selected chair style: ${item?.name || id} 🪑`, 'success');
    playProceduralSound('click', soundEnabled);
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessoryIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      saveConfig(selectedDeskId, selectedChairId, next, leaseDuration, dayNightMode, ledColor, currency);
      
      let nextPositions = { ...customPositions };
      if (id === 'coffee-machine') {
        delete nextPositions['coffee-mug'];
        localStorage.setItem('monis-custom-positions', JSON.stringify(nextPositions));
        setCustomPositions(nextPositions);
      }
      
      pushToHistory(selectedDeskId, selectedChairId, next, nextPositions);
      
      const item = PRODUCTS.find((p) => p.id === id);
      const isAdded = next.includes(id);
      addToast(
        isAdded ? `Added: ${item?.name || id} 🌿` : `Removed: ${item?.name || id} 🗑️`, 
        isAdded ? 'success' : 'info'
      );
      playProceduralSound('click', soundEnabled);
      
      return next;
    });
  };

  const setLeaseDuration = (months: number) => {
    setLeaseDurationState(months);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, months, dayNightMode, ledColor, currency);
    addToast(`Lease duration updated to ${months} months! 🗓️`, 'info');
    playProceduralSound('click', soundEnabled);
  };

  const updateDayNightMode = (mode: DayNightType) => {
    setDayNightMode(mode);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, mode, ledColor, currency);
    addToast(mode === 'night' ? 'Canggu Sunset mode activated! 🌅' : 'Sunny Bali day mode activated! ☀️', 'info');
    playProceduralSound('sweep', soundEnabled);
  };

  const updateLedColor = (color: string) => {
    setLedColor(color);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, color, currency);
    playProceduralSound('click', soundEnabled);
  };

  const updateCurrency = (cur: CurrencyType) => {
    setCurrency(cur);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, cur);
    addToast(`Switched currency to ${cur}! 💰`, 'info');
    playProceduralSound('click', soundEnabled);
  };

  const selectPreset = (presetId: string) => {
    let preset = PRESET_WORKSPACES.find((p) => p.id === presetId) as any;
    if (!preset) {
      preset = customPresets.find((p) => p.id === presetId);
    }

    if (preset) {
      setSelectedDeskId(preset.deskId);
      setSelectedChairId(preset.chairId);
      setSelectedAccessoryIds(preset.accessoryIds);
      saveConfig(preset.deskId, preset.chairId, preset.accessoryIds, leaseDuration, dayNightMode, ledColor, currency);
      
      const positions = preset.customPositions || {};
      setCustomPositions(positions);
      if (Object.keys(positions).length > 0) {
        localStorage.setItem('monis-custom-positions', JSON.stringify(positions));
      } else {
        localStorage.removeItem('monis-custom-positions');
      }

      pushToHistory(preset.deskId, preset.chairId, preset.accessoryIds, positions);
      addToast(`Preset Loaded: "${preset.name}"! 🏝️`, 'success');
      playProceduralSound('sweep', soundEnabled);
    }
  };

  const updateCustomPosition = (itemId: string, pos: [number, number, number]) => {
    setCustomPositions((prev) => {
      const next = { ...prev, [itemId]: pos };
      localStorage.setItem('monis-custom-positions', JSON.stringify(next));
      pushToHistory(selectedDeskId, selectedChairId, selectedAccessoryIds, next);
      return next;
    });
    playProceduralSound('snap', soundEnabled);
  };

  const resetAllPositions = () => {
    setCustomPositions({});
    localStorage.removeItem('monis-custom-positions');
    pushToHistory(selectedDeskId, selectedChairId, selectedAccessoryIds, {});
    addToast('Visualizer layout reset to default alignment! 🎯', 'info');
    playProceduralSound('swoosh', soundEnabled);
  };

  // Custom User Presets Manager
  const saveCustomPreset = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      addToast('Please enter a valid layout name! 🏷️', 'warning');
      return;
    }
    
    const newPreset: CustomPreset = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      deskId: selectedDeskId,
      chairId: selectedChairId,
      accessoryIds: [...selectedAccessoryIds],
      customPositions: { ...customPositions },
    };

    setCustomPresets((prev) => {
      const next = [...prev, newPreset];
      localStorage.setItem('monis-custom-presets', JSON.stringify(next));
      return next;
    });

    addToast(`Saved current design as custom layout "${trimmedName}"! 💾`, 'success');
    playProceduralSound('snap', soundEnabled);
  };

  const deleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem('monis-custom-presets', JSON.stringify(next));
      return next;
    });

    addToast('Deleted custom layout preset! 🗑️', 'info');
    playProceduralSound('swoosh', soundEnabled);
  };

  const getMonthlyRate = () => {
    let totalUSD = 0;
    let totalIDR = 0;

    const desk = PRODUCTS.find((p) => p.id === selectedDeskId);
    if (desk) {
      totalUSD += desk.priceUSD;
      totalIDR += desk.priceIDR;
    }

    const chair = PRODUCTS.find((p) => p.id === selectedChairId);
    if (chair) {
      totalUSD += chair.priceUSD;
      totalIDR += chair.priceIDR;
    }

    selectedAccessoryIds.forEach((id) => {
      const acc = PRODUCTS.find((p) => p.id === id);
      if (acc) {
        totalUSD += acc.priceUSD;
        totalIDR += acc.priceIDR;
      }
    });

    const baseUSD = totalUSD;
    const baseIDR = totalIDR;

    let discountPercent = 0;
    if (leaseDuration === 3) discountPercent = 5;
    else if (leaseDuration === 6) discountPercent = 15;
    else if (leaseDuration === 12) discountPercent = 25;

    const baseRate = currency === 'USD' ? baseUSD : baseIDR;
    const discountMultiplier = (100 - discountPercent) / 100;
    const discountedRate = Math.round(baseRate * discountMultiplier);

    return {
      baseRate,
      discountedRate,
      discountPercent,
    };
  };

  const getFormattedPrice = (amount: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return 'Rp ' + new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <ConfiguratorContext.Provider
      value={{
        selectedDeskId,
        selectedChairId,
        selectedAccessoryIds,
        leaseDuration,
        dayNightMode,
        ledColor,
        currency,
        customPositions,
        isDragging,
        activeTab,
        soundEnabled,
        customPresets,
        toasts,
        canUndo,
        canRedo,
        selectDesk,
        selectChair,
        toggleAccessory,
        setLeaseDuration,
        setDayNightMode: updateDayNightMode,
        setLedColor: updateLedColor,
        setCurrency: updateCurrency,
        selectPreset,
        getMonthlyRate,
        getFormattedPrice,
        updateCustomPosition,
        resetAllPositions,
        setIsDragging,
        setActiveTab,
        setSoundEnabled,
        saveCustomPreset,
        deleteCustomPreset,
        addToast,
        dismissToast,
        undo,
        redo,
      }}
    >
      {children}
    </ConfiguratorContext.Provider>
  );
};

export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext);
  if (context === undefined) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider');
  }
  return context;
};
