'use client';

import React, { useState } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { PRODUCTS, LEASE_OPTIONS, PRESET_WORKSPACES } from '@/constants/products';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  DollarSign, 
  Coins, 
  Percent, 
  Info,
  Calendar,
  Layers,
  Leaf,
  Monitor,
  FlameKindling
} from 'lucide-react';
import styles from './ConfiguratorPanel.module.css';

const LED_PRESETS = [
  { name: 'Sunset Amber', value: '#fbbf24', bgClass: 'bg-amber-400' },
  { name: 'Jungle Green', value: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Surf Teal', value: '#06b6d4', bgClass: 'bg-cyan-500' },
  { name: 'Blossom Pink', value: '#f43f5e', bgClass: 'bg-rose-500' },
  { name: 'Neon Purple', value: '#a855f7', bgClass: 'bg-purple-500' },
  { name: 'Calm White', value: '#f8fafc', bgClass: 'bg-slate-50 border border-neutral-300' },
];

export default function ConfiguratorPanel() {
  const {
    selectedDeskId,
    selectedChairId,
    selectedAccessoryIds,
    leaseDuration,
    dayNightMode,
    ledColor,
    currency,
    selectDesk,
    selectChair,
    toggleAccessory,
    setLeaseDuration,
    setDayNightMode,
    setLedColor,
    setCurrency,
    selectPreset,
    getMonthlyRate,
    getFormattedPrice,
    customPositions,
    resetAllPositions,
  } = useConfigurator();

  const [activeTab, setActiveTab] = useState<'desk' | 'chair' | 'tech' | 'eco'>('desk');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { baseRate, discountedRate, discountPercent } = getMonthlyRate();

  const activeProducts = PRODUCTS.filter((p) => p.category === activeTab);

  // Map duration to slider index
  const leaseDurations = [1, 3, 6, 12];
  const currentLeaseIndex = leaseDurations.indexOf(leaseDuration);

  const handleLeaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setLeaseDuration(leaseDurations[idx]);
  };

  const handlePresetSelect = (id: string) => {
    selectPreset(id);
  };

  return (
    <div className={styles.configurator}>
      {/* Top Banner / Currency & Ambience controls */}
      <div className={styles.configurator__topbar}>
        {/* Currency Switcher */}
        <div className={styles.configurator__currencyGroup}>
          <button
            onClick={() => setCurrency('USD')}
            className={`${styles.configurator__currencyBtn} ${
              currency === 'USD' ? styles['configurator__currencyBtn--active'] : ''
            }`}
            aria-label="Switch to USD"
          >
            <DollarSign className="w-3.5 h-3.5 mr-0.5" />
            USD
          </button>
          <button
            onClick={() => setCurrency('IDR')}
            className={`${styles.configurator__currencyBtn} ${
              currency === 'IDR' ? styles['configurator__currencyBtn--active'] : ''
            }`}
            aria-label="Switch to IDR"
          >
            <Coins className="w-3.5 h-3.5 mr-0.5" />
            IDR
          </button>
        </div>

        {/* Day/Night Toggle */}
        <div className={styles.configurator__themeGroup}>
          <button
            onClick={() => setDayNightMode('day')}
            className={`${styles.configurator__themeBtn} ${
              dayNightMode === 'day' ? styles['configurator__themeBtn--activeDay'] : ''
            }`}
            aria-label="Day Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDayNightMode('night')}
            className={`${styles.configurator__themeBtn} ${
              dayNightMode === 'night' ? styles['configurator__themeBtn--activeNight'] : ''
            }`}
            aria-label="Night Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main scrollable body */}
      <div className={styles.configurator__scrollArea}>
        {/* Presets Section */}
        <div className={styles.configurator__section}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className={styles.configurator__sectionTitle}>Bali Vibe Presets</h3>
            </div>
            {customPositions && Object.keys(customPositions).length > 0 && (
              <button
                onClick={resetAllPositions}
                className={styles.configurator__resetBtn}
                title="Reset custom positions to defaults"
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                Reset Layout
              </button>
            )}
          </div>
          <div className={styles.configurator__presetGrid}>
            {PRESET_WORKSPACES.map((preset) => {
              const isActive =
                selectedDeskId === preset.deskId &&
                selectedChairId === preset.chairId &&
                preset.accessoryIds.every((id) => selectedAccessoryIds.includes(id)) &&
                selectedAccessoryIds.every((id) => preset.accessoryIds.includes(id));

              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`${styles.configurator__presetCard} ${
                    isActive ? styles['configurator__presetCard--active'] : ''
                  }`}
                >
                  <div className="font-semibold text-xs text-[#1C1A17]">{preset.name}</div>
                  <div className="text-[10px] text-[#8A8478] mt-0.5 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Category Tabs */}
        <div className={styles.configurator__tabContainer}>
          <div className={styles.configurator__tabs}>
            {(['desk', 'chair', 'tech', 'eco'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.configurator__tab} ${
                  activeTab === tab ? styles['configurator__tab--active'] : ''
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Active Product Grid */}
        <div className={styles.configurator__section}>
          <div className={styles.configurator__productGrid}>
            {activeProducts.map((product) => {
              const isDesk = product.category === 'desk';
              const isChair = product.category === 'chair';
              const isSelected = isDesk
                ? selectedDeskId === product.id
                : isChair
                ? selectedChairId === product.id
                : selectedAccessoryIds.includes(product.id);

              const priceLabel = getFormattedPrice(
                currency === 'USD' ? product.priceUSD : product.priceIDR
              );

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (isDesk) selectDesk(product.id);
                    else if (isChair) selectChair(product.id);
                    else toggleAccessory(product.id);
                  }}
                  className={`${styles.configurator__productCard} ${
                    isSelected ? styles['configurator__productCard--active'] : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-bold text-sm text-[#1C1A17]">{product.name}</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                      {priceLabel}/mo
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#6B655A] leading-relaxed mb-3">
                    {product.description}
                  </p>

                  <div className={styles.configurator__productSpecs}>
                    {product.specs.slice(0, 3).map((spec, i) => (
                      <span key={i} className={styles.configurator__specBadge}>
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0EBE1] text-[10px] font-semibold text-[#8A8478]">
                    <span>{isDesk || isChair ? 'Included in base setup' : 'Add accessory'}</span>
                    <div
                      className={`${styles.configurator__checkbox} ${
                        isSelected ? styles['configurator__checkbox--active'] : ''
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LED customizable controls inside Eco/Ambience section or always visible */}
        {dayNightMode === 'night' && (
          <div className={`${styles.configurator__section} ${styles.configurator__ledCard} animate-fadeIn`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Custom Backlight LED (Night Mode Active)
              </h3>
            </div>
            <p className="text-xs text-emerald-950/70 mb-3">
              Switch the glow color of the standing desk LED strips.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {LED_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setLedColor(preset.value)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                    preset.bgClass
                  } ${
                    ledColor === preset.value
                      ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                  title={preset.name}
                  aria-label={`Set LED to ${preset.name}`}
                >
                  {ledColor === preset.value && (
                    <Check className={`w-3.5 h-3.5 ${preset.value === '#f8fafc' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lease Duration Slider Section */}
        <div className={styles.configurator__section}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className={styles.configurator__sectionTitle}>Lease Term Selection</h3>
            </div>
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-0.5">
                <Percent className="w-3 h-3" /> Save {discountPercent}%
              </span>
            )}
          </div>

          <div className="px-1.5">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={currentLeaseIndex !== -1 ? currentLeaseIndex : 1}
              onChange={handleLeaseChange}
              className={styles.configurator__slider}
              aria-label="Lease Duration Slider"
            />
            
            <div className={styles.configurator__sliderTicks}>
              {LEASE_OPTIONS.map((opt, idx) => {
                const isActive = opt.durationMonths === leaseDuration;
                return (
                  <button
                    key={opt.durationMonths}
                    onClick={() => setLeaseDuration(opt.durationMonths)}
                    className={`${styles.configurator__tickBtn} ${
                      isActive ? styles['configurator__tickBtn--active'] : ''
                    }`}
                  >
                    <span className="block font-bold text-xs">
                      {opt.durationMonths === 1 ? '1 mo' : `${opt.durationMonths} mos`}
                    </span>
                    <span className="block text-[8px] text-[#8A8478] mt-0.5">
                      {opt.discountPercentage > 0 ? `-${opt.discountPercentage}%` : 'Base'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rate Card & Rent CTA */}
      <div className={styles.configurator__rateCard}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#8A8478]">
              Estimated Price / Month
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              {discountPercent > 0 && (
                <span className="text-xs text-[#8A8478] line-through">
                  {getFormattedPrice(baseRate)}
                </span>
              )}
              <span className="text-2xl font-black text-[#1C1A17]">
                {getFormattedPrice(discountedRate)}
              </span>
              <span className="text-xs text-[#6B655A] font-medium">/mo</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-[#F4EFE6] text-[#4A453C] border border-[#E0D9CD]">
              <Layers className="w-3 h-3 text-emerald-600" />
              {1 + 1 + selectedAccessoryIds.length} items
            </span>
          </div>
        </div>

        {/* Pricing breakdown popover/info helper */}
        <div className="bg-[#FAF8F5] border border-[#EDE8DE] rounded-xl p-3 mb-4 text-xs">
          <div className="flex justify-between mb-1 text-[#6B655A]">
            <span>Base Workspace Rent</span>
            <span>{getFormattedPrice(
              (PRODUCTS.find((p) => p.id === selectedDeskId)?.priceUSD || 0) +
              (PRODUCTS.find((p) => p.id === selectedChairId)?.priceUSD || 0)
            )}</span>
          </div>
          <div className="flex justify-between mb-1 text-[#6B655A]">
            <span>Accessories ({selectedAccessoryIds.length})</span>
            <span>
              {getFormattedPrice(
                selectedAccessoryIds.reduce((sum, id) => {
                  const prod = PRODUCTS.find((p) => p.id === id);
                  return sum + (prod ? (currency === 'USD' ? prod.priceUSD : prod.priceIDR) : 0);
                }, 0)
              )}
            </span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between font-medium text-rose-600">
              <span>Lease Discount ({discountPercent}%)</span>
              <span>
                -{getFormattedPrice(baseRate - discountedRate)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className={styles.configurator__cta}
        >
          <Leaf className="w-4.5 h-4.5 animate-bounce mr-1.5" />
          Rent Setup
        </button>
      </div>

      {/* Checkout modal popup */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
