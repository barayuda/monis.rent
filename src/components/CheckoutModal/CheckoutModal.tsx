'use client';

import React, { useState, useEffect } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { PRODUCTS } from '@/constants/products';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  PartyPopper,
  Leaf,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BALI_NEIGHBORHOODS = [
  { 
    id: 'Canggu', 
    name: 'Canggu', 
    tagline: 'Surf & Code', 
    icon: '🏄‍♂️', 
    description: 'Beach clubs, cafes, and digital nomad hubs.' 
  },
  { 
    id: 'Ubud', 
    name: 'Ubud', 
    tagline: 'Eco Jungle Retreat', 
    icon: '🌴', 
    description: 'Green rice terraces, serenity, and yoga centers.' 
  },
  { 
    id: 'Seminyak', 
    name: 'Seminyak', 
    tagline: 'Upscale & Elegant', 
    icon: '☕', 
    description: 'Boutique shopping, luxury villas, and fine dining.' 
  },
  { 
    id: 'Uluwatu', 
    name: 'Uluwatu', 
    tagline: 'Cliffside Waves', 
    icon: '🌊', 
    description: 'Breathtaking ocean views, dramatic cliffs, and surfing.' 
  },
];

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const {
    selectedDeskId,
    selectedChairId,
    selectedAccessoryIds,
    leaseDuration,
    currency,
    getMonthlyRate,
    getFormattedPrice,
  } = useConfigurator();

  const [step, setStep] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [neighborhood, setNeighborhood] = useState('Canggu');
  const [addressDetails, setAddressDetails] = useState('');
  
  // Nomad details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { discountedRate } = getMonthlyRate();

  // Reset modal when opened or closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      // Set default delivery date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeliveryDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const deskName = PRODUCTS.find((p) => p.id === selectedDeskId)?.name || 'Smart Desk';
  const chairName = PRODUCTS.find((p) => p.id === selectedChairId)?.name || 'Ergonomic Chair';
  const accessoryNames = selectedAccessoryIds.map(
    (id) => PRODUCTS.find((p) => p.id === id)?.name || 'Accessory'
  );

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!deliveryDate) errs.deliveryDate = 'Delivery date is required';
    if (!neighborhood) errs.neighborhood = 'Neighborhood is required';
    if (!addressDetails.trim()) errs.addressDetails = 'Specific delivery address is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Full name is required';
    
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email';
    }

    if (!whatsapp.trim()) {
      errs.whatsapp = 'WhatsApp number is required';
    } else if (whatsapp.length < 8) {
      errs.whatsapp = 'Please provide a valid WhatsApp number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  // Prevent background clicks inside the modal card
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={handleModalClick}>
        {/* Close Button */}
        {step !== 3 && (
          <button className={styles.modalCard__closeBtn} onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5 text-[#8A8478] hover:text-[#1C1A17] transition-all" />
          </button>
        )}

        {/* Top Progress indicator */}
        {step !== 3 && (
          <div className={styles.modalCard__header}>
            <div className={styles.modalCard__progressBar}>
              <div 
                className={styles.modalCard__progressFill} 
                style={{ width: `${step === 1 ? 50 : 100}%` }}
              ></div>
            </div>
            <div className={styles.modalCard__stepsTitle}>
              <span className={step === 1 ? 'text-emerald-700 font-extrabold' : 'text-[#8A8478]'}>
                1. Delivery Details
              </span>
              <span className={step === 2 ? 'text-emerald-700 font-extrabold' : 'text-[#8A8478]'}>
                2. Nomad Contact
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Rental details */}
        {step === 1 && (
          <div className={styles.modalStep}>
            <div className="mb-4">
              <h2 className={styles.modalCard__title}>Bali Delivery Logistics</h2>
              <p className={styles.modalCard__subtitle}>
                Specify where and when you want your high-performance workspace delivered.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-7 space-y-4">
                {/* Popular Bali neighborhood selectors */}
                <div>
                  <label className={styles.modalCard__label}>
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                    Select Bali Neighborhood Preset
                  </label>
                  <div className={styles.modalCard__neighborhoodGrid}>
                    {BALI_NEIGHBORHOODS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNeighborhood(n.id)}
                        className={`${styles.modalCard__neighborhoodBtn} ${
                          neighborhood === n.id ? styles['modalCard__neighborhoodBtn--active'] : ''
                        }`}
                      >
                        <div className="text-xl mb-1">{n.icon}</div>
                        <div className="font-bold text-xs text-[#1C1A17]">{n.name}</div>
                        <div className="text-[9px] text-emerald-700 font-semibold tracking-wide uppercase mt-0.5">
                          {n.tagline}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Date Picker */}
                <div>
                  <label htmlFor="delivery-date" className={styles.modalCard__label}>
                    <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                    Preferred Setup Delivery Date
                  </label>
                  <input
                    type="date"
                    id="delivery-date"
                    min={new Date().toISOString().split('T')[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={`${styles.modalCard__input} ${
                      errors.deliveryDate ? 'border-rose-500' : ''
                    }`}
                  />
                  {errors.deliveryDate && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                      {errors.deliveryDate}
                    </span>
                  )}
                </div>

                {/* Delivery address details */}
                <div>
                  <label htmlFor="address-details" className={styles.modalCard__label}>
                    Detailed Address / Guest House / Villa Name
                  </label>
                  <textarea
                    id="address-details"
                    rows={3}
                    placeholder="e.g., Room 12, Canggu Breeze Guest House, Jalan Pantai Batu Bolong No. 42"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className={`${styles.modalCard__textarea} ${
                      errors.addressDetails ? 'border-rose-500' : ''
                    }`}
                  ></textarea>
                  {errors.addressDetails && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                      {errors.addressDetails}
                    </span>
                  )}
                  <p className="text-[10px] text-[#8A8478] mt-1">
                    Please provide gate codes, room numbers, or drop-off guidelines for our delivery scooter fleet.
                  </p>
                </div>
              </div>

              {/* Workspace Review Panel */}
              <div className="lg:col-span-5">
                <div className={styles.modalCard__summaryBox}>
                  <h3 className="font-extrabold text-xs text-[#6B655A] uppercase tracking-wider mb-3">
                    Setup Summary
                  </h3>
                  
                  <div className="space-y-3 mb-4 border-b border-[#E6E1D6] pb-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#1C1A17]">{deskName}</span>
                        <div className="text-[9px] text-[#8A8478]">Sustainable Bamboo/Wood</div>
                      </div>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        Included
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#1C1A17]">{chairName}</span>
                        <div className="text-[9px] text-[#8A8478]">Premium Ergonomic Back</div>
                      </div>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        Included
                      </span>
                    </div>

                    {accessoryNames.length > 0 && (
                      <div>
                        <div className="text-[10px] text-[#8A8478] font-bold uppercase tracking-wider mb-1.5">
                          Accessories ({accessoryNames.length})
                        </div>
                        <ul className="space-y-1 text-xs">
                          {accessoryNames.map((name, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[#6B655A]">
                              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-[#6B655A] mb-4">
                    <div className="flex justify-between">
                      <span>Lease Term:</span>
                      <span className="font-bold text-[#1C1A17]">{leaseDuration} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Destination Vibe:</span>
                      <span className="font-bold text-emerald-700">{neighborhood}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <div className="text-[9px] text-[#8A8478] uppercase font-bold tracking-wider">
                        Monthly Cost
                      </div>
                      <div className="text-xl font-black text-emerald-800">
                        {getFormattedPrice(discountedRate)}
                        <span className="text-[10px] text-emerald-700 font-normal">/mo</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-emerald-700 font-semibold bg-emerald-100/50 px-2 py-1 rounded-lg">
                      Free Setup & Install
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E6E1D6]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#D0C9BA] hover:bg-[#FAF8F5] text-xs font-bold text-[#6B655A] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer"
              >
                Nomad Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Nomad details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className={styles.modalStep}>
            <div className="mb-4">
              <h2 className={styles.modalCard__title}>Nomad Account Info</h2>
              <p className={styles.modalCard__subtitle}>
                We will coordinate keyless smart locker delivery or in-villa assembly with you over WhatsApp.
              </p>
            </div>

            <div className="space-y-4 max-w-lg mx-auto py-2">
              {/* Full Name */}
              <div>
                <label htmlFor="fullname" className={styles.modalCard__label}>
                  <User className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${styles.modalCard__input} ${errors.name ? 'border-rose-500' : ''}`}
                />
                {errors.name && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className={styles.modalCard__label}>
                  <Mail className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="e.g., nomad@monis.rent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${styles.modalCard__input} ${errors.email ? 'border-rose-500' : ''}`}
                />
                {errors.email && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* WhatsApp Contact */}
              <div>
                <label htmlFor="whatsapp" className={styles.modalCard__label}>
                  <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                  WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#8A8478] font-bold">
                    +
                  </span>
                  <input
                    type="tel"
                    id="whatsapp"
                    placeholder="62 812 3456 7890 (Include country code)"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                    className={`${styles.modalCard__input} pl-6 ${
                      errors.whatsapp ? 'border-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.whatsapp && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                    {errors.whatsapp}
                  </span>
                )}
                <p className="text-[10px] text-[#8A8478] mt-1">
                  Our operations team uses WhatsApp as the primary communication channel in Bali to ping you when the scooter fleet departs.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-2xl p-4 mt-6">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1A17]">Eco-Friendly Operations</h4>
                    <p className="text-[10px] text-[#6B655A] mt-0.5 leading-relaxed">
                      monis.rent carbon-offsets all local transport delivery scooters. Our staff will install, level, and wire up the setup in under 20 minutes!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-[#E6E1D6]">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-[#D0C9BA] hover:bg-[#FAF8F5] text-xs font-bold text-[#6B655A] flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Logistics
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Confirm Setup Rental <PartyPopper className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Celebratory Screen */}
        {step === 3 && (
          <div className={`${styles.modalStep} ${styles.celebrationStep} overflow-hidden relative`}>
            {/* Falling Leaves Elements */}
            <div className={styles.fallingLeaves}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.leafParticle} />
              ))}
            </div>

            <div className="text-center py-6 max-w-md mx-auto z-10 relative">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 border border-emerald-100/50 shadow-inner">
                <CheckCircle className="w-10 h-10 animate-scaleIn" />
              </div>

              <h2 className="text-2xl font-black text-[#1C1A17] tracking-tight">
                Order Confirmed, {name.split(' ')[0]}!
              </h2>
              
              <p className="text-sm text-[#6B655A] mt-2 leading-relaxed">
                Your high-productivity workspace setup will be dispatched to your villa or apartment in <span className="font-extrabold text-emerald-700">{neighborhood}</span>.
              </p>

              <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-2xl p-4 my-6 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#F0EBE1] pb-2 font-bold text-[#1C1A17]">
                  <span>Order Reference</span>
                  <span className="font-mono text-emerald-700 uppercase">MONIS-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8478]">Delivery Date:</span>
                  <span className="font-semibold text-[#1C1A17]">{deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8478]">Monthly Rental:</span>
                  <span className="font-bold text-emerald-800">{getFormattedPrice(discountedRate)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8478]">Lease Term:</span>
                  <span className="font-semibold text-[#1C1A17]">{leaseDuration} Months</span>
                </div>
                <div className="pt-2 border-t border-[#F0EBE1]">
                  <div className="text-[10px] font-bold text-[#8A8478] uppercase mb-1">Delivering setup</div>
                  <div className="text-[#1C1A17] font-medium leading-relaxed">
                    {deskName} + {chairName} {accessoryNames.length > 0 ? `+ ${accessoryNames.join(', ')}` : ''}
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-2xl p-3 flex gap-2.5 items-start text-left mb-6">
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-[#1C1A17]">Carbon Neutral Delivery</h4>
                  <p className="text-[9px] text-[#8A8478] leading-normal">
                    We plant 1 bamboo shoot in West Bali for every workspace rented. Thank you for voting for a greener digital nomad ecosystem!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider transition-all duration-300 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Awesome, back to canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
