'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, PRODUCTS as productList, PRESET_WORKSPACES } from '../constants/products';

type CurrencyType = 'USD' | 'IDR';
type DayNightType = 'day' | 'night';

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
}

const ConfiguratorContext = createContext<ConfiguratorContextProps | undefined>(undefined);

export const ConfiguratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDeskId, setSelectedDeskId] = useState('desk-bamboo');
  const [selectedChairId, setSelectedChairId] = useState('chair-ergo');
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>(['eco-plant', 'eco-lamp', 'tech-input']);
  const [leaseDuration, setLeaseDurationState] = useState(6); // Default 6 months
  const [dayNightMode, setDayNightMode] = useState<DayNightType>('day');
  const [ledColor, setLedColor] = useState('#fbbf24'); // Sunset amber default
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [customPositions, setCustomPositions] = useState<Record<string, [number, number, number]>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Load from local storage if available (standard Next.js dynamic check)
  useEffect(() => {
    const saved = localStorage.getItem('monis-workspace-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDeskId) setSelectedDeskId(parsed.selectedDeskId);
        if (parsed.selectedChairId) setSelectedChairId(parsed.selectedChairId);
        if (parsed.selectedAccessoryIds) setSelectedAccessoryIds(parsed.selectedAccessoryIds);
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
        setCustomPositions(JSON.parse(savedPositions));
      } catch (e) {
        console.error("Error parsing saved custom positions", e);
      }
    }
  }, []);

  // Save changes to local storage
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

  const selectDesk = (id: string) => {
    setSelectedDeskId(id);
    saveConfig(id, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, currency);
  };

  const selectChair = (id: string) => {
    setSelectedChairId(id);
    saveConfig(selectedDeskId, id, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, currency);
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessoryIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      saveConfig(selectedDeskId, selectedChairId, next, leaseDuration, dayNightMode, ledColor, currency);
      return next;
    });
  };

  const setLeaseDuration = (months: number) => {
    setLeaseDurationState(months);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, months, dayNightMode, ledColor, currency);
  };

  const updateDayNightMode = (mode: DayNightType) => {
    setDayNightMode(mode);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, mode, ledColor, currency);
  };

  const updateLedColor = (color: string) => {
    setLedColor(color);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, color, currency);
  };

  const updateCurrency = (cur: CurrencyType) => {
    setCurrency(cur);
    saveConfig(selectedDeskId, selectedChairId, selectedAccessoryIds, leaseDuration, dayNightMode, ledColor, cur);
  };

  const selectPreset = (presetId: string) => {
    const preset = PRESET_WORKSPACES.find((p) => p.id === presetId);
    if (preset) {
      setSelectedDeskId(preset.deskId);
      setSelectedChairId(preset.chairId);
      setSelectedAccessoryIds(preset.accessoryIds);
      saveConfig(preset.deskId, preset.chairId, preset.accessoryIds, leaseDuration, dayNightMode, ledColor, currency);
      // Snapping accessories to default on preset shift prevents visual chaotic overlap
      setCustomPositions({});
      localStorage.removeItem('monis-custom-positions');
    }
  };

  const updateCustomPosition = (itemId: string, pos: [number, number, number]) => {
    setCustomPositions((prev) => {
      const next = { ...prev, [itemId]: pos };
      localStorage.setItem('monis-custom-positions', JSON.stringify(next));
      return next;
    });
  };

  const resetAllPositions = () => {
    setCustomPositions({});
    localStorage.removeItem('monis-custom-positions');
  };

  const getMonthlyRate = () => {
    let totalUSD = 0;
    let totalIDR = 0;

    // Find desk price
    const desk = PRODUCTS.find((p) => p.id === selectedDeskId);
    if (desk) {
      totalUSD += desk.priceUSD;
      totalIDR += desk.priceIDR;
    }

    // Find chair price
    const chair = PRODUCTS.find((p) => p.id === selectedChairId);
    if (chair) {
      totalUSD += chair.priceUSD;
      totalIDR += chair.priceIDR;
    }

    // Add accessories
    selectedAccessoryIds.forEach((id) => {
      const acc = PRODUCTS.find((p) => p.id === id);
      if (acc) {
        totalUSD += acc.priceUSD;
        totalIDR += acc.priceIDR;
      }
    });

    const baseUSD = totalUSD;
    const baseIDR = totalIDR;

    // Apply lease dynamic discount
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
