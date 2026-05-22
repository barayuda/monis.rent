'use client';

import React from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { PRODUCTS, ProductItem } from '@/constants/products';
import { 
  Coffee, 
  Waves, 
  Sofa, 
  Wrench,
  Sparkles
} from 'lucide-react';
import styles from './LifestylePanel.module.css';

export default function LifestylePanel() {
  const {
    selectedAccessoryIds,
    toggleAccessory,
    currency,
    getFormattedPrice,
  } = useConfigurator();

  // Filter lifestyle products
  const coffeeItems = PRODUCTS.filter(p => p.category === 'coffee');
  const outdoorItems = PRODUCTS.filter(p => p.category === 'outdoor');
  const relaxItems = PRODUCTS.filter(p => p.category === 'relax');
  const garageItems = PRODUCTS.filter(p => p.category === 'garage');

  // Helper to check if item is selected
  const isSelected = (id: string) => selectedAccessoryIds.includes(id);

  // Render a product selector card
  const renderCard = (item: ProductItem) => {
    const active = isSelected(item.id);
    const priceVal = currency === 'USD' ? item.priceUSD : item.priceIDR;
    const formattedPrice = getFormattedPrice(priceVal);

    return (
      <div
        key={item.id}
        onClick={() => toggleAccessory(item.id)}
        className={`${styles.lifestyle__card} ${active ? styles['lifestyle__card--active'] : ''}`}
        title={item.description}
      >
        <div className={styles.lifestyle__cardInfo}>
          <span className={styles.lifestyle__itemName}>{item.name}</span>
          <span className={styles.lifestyle__itemPrice}>{formattedPrice}/mo</span>
        </div>

        <div className={`${styles.lifestyle__toggle} ${active ? styles['lifestyle__toggle--active'] : ''}`}>
          <div className={`${styles.lifestyle__toggleDot} ${active ? styles['lifestyle__toggleDot--active'] : ''}`} />
        </div>
      </div>
    );
  };

  const activeLifestyleCount = selectedAccessoryIds.filter(id => 
    PRODUCTS.find(p => p.id === id && ['coffee', 'outdoor', 'relax', 'garage'].includes(p.category))
  ).length;

  return (
    <div className={styles.lifestyle}>
      <div className={styles.lifestyle__titleRow}>
        <div className={styles.lifestyle__title}>
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Bali Nomad Lifestyle Zones</span>
        </div>
        {activeLifestyleCount > 0 && (
          <span className={styles.lifestyle__badge}>
            {activeLifestyleCount} lifestyle assets added
          </span>
        )}
      </div>

      <div className={styles.lifestyle__grid}>
        {/* Coffee Station Zone */}
        <div className={styles.lifestyle__zone}>
          <div className={styles.lifestyle__zoneTitle}>
            <Coffee className="w-4 h-4 text-amber-700" />
            <span>Coffee Station</span>
          </div>
          <div className={styles.lifestyle__cardList}>
            {coffeeItems.map(renderCard)}
          </div>
        </div>

        {/* Outdoor Gear Zone */}
        <div className={styles.lifestyle__zone}>
          <div className={styles.lifestyle__zoneTitle}>
            <Waves className="w-4 h-4 text-cyan-600" />
            <span>Outdoor Gear</span>
          </div>
          <div className={styles.lifestyle__cardList}>
            {outdoorItems.map(renderCard)}
          </div>
        </div>

        {/* Relax Zone */}
        <div className={styles.lifestyle__zone}>
          <div className={styles.lifestyle__zoneTitle}>
            <Sofa className="w-4 h-4 text-orange-600" />
            <span>Relax Zone</span>
          </div>
          <div className={styles.lifestyle__cardList}>
            {relaxItems.map(renderCard)}
          </div>
        </div>

        {/* Garage Space Zone */}
        <div className={styles.lifestyle__zone}>
          <div className={styles.lifestyle__zoneTitle}>
            <Wrench className="w-4 h-4 text-slate-600" />
            <span>Garage Space</span>
          </div>
          <div className={styles.lifestyle__cardList}>
            {garageItems.map(renderCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
