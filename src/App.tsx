/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Info, 
  ShieldCheck, 
  Banknote, 
  CarFront, 
  ChevronRight, 
  Settings, 
  Download, 
  Zap, 
  Fuel, 
  CheckCircle2,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Loader2,
  Plus,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type Variant = 'MX1' | 'MX3' | 'MX5' | 'AX3L' | 'Star Edition' | 'AX5L' | 'AX7L';
type FuelType = 'Petrol TGDi' | 'Diesel mHawk';
type InsuranceType = 'Comprehensive' | 'Zero Depreciation';

interface ConfigState {
  variant: Variant;
  exShowroomPrice: number;
  fuelType: FuelType;
  insuranceType: InsuranceType;
  extendedWarranty: boolean;
  fastag: boolean;
  premiumKit: boolean;
  educatorMode: boolean;
}

// --- Constants ---

const HERO_IMAGE = "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_1_screenshot.png";

const FEATURE_HIGHLIGHTS = [
  { 
    title: "Panoramic Skyroof", 
    desc: "The largest in its segment, offering an unhindered view of the heavens.", 
    img: "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_10_screenshot.png",
    icon: Zap
  },
  { 
    title: "Digital Cockpit", 
    desc: "Twin 26.03 cm digital screens with Adrenox connectivity.", 
    img: "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_21_screenshot.png",
    icon: Settings
  },
  { 
    title: "Harman Kardon Sound", 
    desc: "9-speaker custom-tuned system with Dolby Atmos technology.", 
    img: "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_11_screenshot.png",
    icon: Video
  },
  { 
    title: "ADAS Level 2", 
    desc: "10 sophisticated safety features designed for Indian conditions.", 
    img: "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_20_screenshot.png",
    icon: ShieldCheck
  },
];

const GALLERY_IMAGES = [
  "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_3_screenshot.png",
  "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_15_screenshot.png",
  "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_13_screenshot.png",
  "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_14_screenshot.png",
];

const TRAILER_VIDEO = "https://player.vimeo.com/external/494252666.sd.mp4?s=721c073802fc26059e38399334d9e9c682973bc5&profile_id=164&oauth2_token_id=57447761";

const VARIANTS: Variant[] = ['MX1', 'MX3', 'MX5', 'AX3L', 'Star Edition', 'AX5L', 'AX7L'];
const VARIANT_PRICES: Record<Variant, number> = {
  'MX1': 1299000,
  'MX3': 1499000,
  'MX5': 1699000,
  'AX3L': 1899000,
  'Star Edition': 1685000,
  'AX5L': 2099000,
  'AX7L': 2299000,
};

const KERALA_TAX_SLABS = [
  { limit: 500000, rate: 0.09 },
  { limit: 1000000, rate: 0.11 },
  { limit: 1500000, rate: 0.13 },
  { limit: 2000000, rate: 0.16 },
  { limit: Infinity, rate: 0.21 },
];

// --- Helper Functions ---

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const calculateRoadTax = (price: number) => {
  if (price <= 500000) return price * 0.09;
  if (price <= 1000000) return price * 0.11;
  if (price <= 1500000) return price * 0.13;
  if (price <= 2000000) return price * 0.16;
  return price * 0.21;
};

const calculateTCS = (price: number) => {
  return price > 1000000 ? price * 0.01 : 0;
};

const calculateInsurance = (price: number, type: InsuranceType) => {
  const baseRate = type === 'Comprehensive' ? 0.035 : 0.045;
  return price * baseRate;
};

// --- Components ---

// --- Components ---

const Vehicle360Viewer = () => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Mocking a 36-frame sequence. In a real app, these would be 36 different angles.
  // We'll use the provided high-quality images for key angles and placeholders for others.
  const frames = useMemo(() => {
    const baseImages = [
      "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_1_screenshot.png", // Front 3/4
      "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_3_screenshot.png", // Side
      "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_4_screenshot.png", // Front
      "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_7_screenshot.png", // Side (Blue)
      "https://ais-dev-t4ckjp56254bwxiakhl7sk-631490334397.europe-west2.run.app/page_19_screenshot.png", // Front 3/4 (Grey)
    ];
    
    // Create a 36-frame array by cycling through available images
    return Array.from({ length: 36 }, (_, i) => baseImages[i % baseImages.length]);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 5) {
      const sensitivity = 0.5;
      const newRotation = (rotation - Math.round(deltaX * sensitivity) + 36) % 36;
      setRotation(newRotation);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) > 5) {
      const sensitivity = 0.5;
      const newRotation = (rotation - Math.round(deltaX * sensitivity) + 36) % 36;
      setRotation(newRotation);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 1), 2.5));
  };

  return (
    <div className="rugged-card rounded-[2.5rem] p-8 mb-12 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg uppercase tracking-widest flex items-center gap-2">
          <Zap className="text-accent w-5 h-5" /> 360° Immersive View
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => handleZoom(0.2)}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleZoom(-0.2)}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-4 h-0.5 bg-white rounded-full" />
          </button>
        </div>
      </div>

      <div 
        className="relative aspect-video cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl bg-black/40"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <motion.div 
          className="w-full h-full flex items-center justify-center"
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <img 
            src={frames[rotation]} 
            alt={`Thar ROXX 360 View Frame ${rotation}`}
            className="max-w-full max-h-full object-contain pointer-events-none select-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Interaction Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowRight className="w-3 h-3 animate-pulse" /> Drag to Rotate
          </div>
        </div>

        {/* Rotation Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: 36 }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-1 h-1 rounded-full transition-all",
                rotation === i ? "bg-accent scale-150" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-500 mt-4 text-center uppercase tracking-[0.2em]">
        Experience the ROXX from every angle. Drag horizontally to orbit.
      </p>
    </div>
  );
};

const EducatorCard = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-6 rounded-2xl mb-4"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-accent/20 rounded-lg">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h4 className="font-display text-lg uppercase tracking-wider">{title}</h4>
    </div>
    <div className="text-zinc-400 text-sm leading-relaxed">
      {children}
    </div>
  </motion.div>
);

const AIStudioTools = () => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState('');

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [{ parts: [{ text: `A high-end cinematic shot of a Mahindra Thar ROXX in ${imagePrompt}, rugged mountain background, 4k, hyper-realistic` }] }],
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Image generation failed", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoFile) return;
    setIsGeneratingVideo(true);
    setVideoStatus('Initializing Veo...');
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(videoFile);
      });
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'The Mahindra Thar ROXX driving through a rugged desert landscape, cinematic motion, dust clouds',
        image: {
          imageBytes: base64Data,
          mimeType: videoFile.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        setVideoStatus('Veo is crafting your adventure... (polling)');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        });
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video generation failed", error);
      setVideoStatus('Error occurred during generation.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="mt-12 space-y-8">
      <div className="rugged-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-accent text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest rounded-bl-xl">
          AI Powered
        </div>
        <h3 className="font-display text-2xl uppercase tracking-widest mb-6 flex items-center gap-3">
          <ImageIcon className="text-accent" /> Visualizer AI
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Describe your Thar's environment (e.g. snowy peaks, neon city)..."
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-sm"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="bg-accent text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingImage ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
              GENERATE
            </button>
          </div>
          {generatedImage && (
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={generatedImage} 
              alt="Generated Thar" 
              className="w-full rounded-2xl border border-zinc-800"
            />
          )}
        </div>
      </div>

      <div className="rugged-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-accent text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest rounded-bl-xl">
          AI Powered
        </div>
        <h3 className="font-display text-2xl uppercase tracking-widest mb-6 flex items-center gap-3">
          <Video className="text-accent" /> Cinematic ROXX
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-accent transition-colors bg-black/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Plus className="w-8 h-8 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-500">Upload a photo to animate with Veo</p>
              </div>
              <input type="file" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} accept="image/*" />
            </label>
            {videoFile && <p className="text-xs text-accent">Selected: {videoFile.name}</p>}
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoFile}
              className="w-full bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingVideo ? <Loader2 className="animate-spin w-4 h-4" /> : <Video className="w-4 h-4" />}
              {isGeneratingVideo ? 'ANIMATING...' : 'ANIMATE WITH VEO'}
            </button>
            {isGeneratingVideo && <p className="text-center text-xs text-zinc-500 animate-pulse">{videoStatus}</p>}
          </div>
          {generatedVideoUrl && (
            <motion.video 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={generatedVideoUrl} 
              controls 
              className="w-full rounded-2xl border border-zinc-800"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [config, setConfig] = useState<ConfigState>({
    variant: 'Star Edition',
    exShowroomPrice: 1685000,
    fuelType: 'Diesel mHawk',
    insuranceType: 'Comprehensive',
    extendedWarranty: false,
    fastag: true,
    premiumKit: false,
    educatorMode: false,
  });

  // Sync price when variant changes
  useEffect(() => {
    setConfig(prev => ({ ...prev, exShowroomPrice: VARIANT_PRICES[prev.variant] }));
  }, [config.variant]);

  const calculations = useMemo(() => {
    const roadTax = calculateRoadTax(config.exShowroomPrice);
    const tcs = calculateTCS(config.exShowroomPrice);
    const insurance = calculateInsurance(config.exShowroomPrice, config.insuranceType);
    const registration = 1500; // Standard reg fee
    const fastag = config.fastag ? 500 : 0;
    const warranty = config.extendedWarranty ? 25000 : 0;
    const kit = config.premiumKit ? 45000 : 0;

    const total = config.exShowroomPrice + roadTax + tcs + insurance + registration + fastag + warranty + kit;

    return {
      roadTax,
      tcs,
      insurance,
      registration,
      fastag,
      warranty,
      kit,
      total
    };
  }, [config]);

  const chartData = [
    { name: 'Ex-Showroom', value: config.exShowroomPrice, color: '#FFFFFF' },
    { name: 'Road Tax', value: calculations.roadTax, color: '#EAB308' },
    { name: 'Insurance', value: calculations.insurance, color: '#71717A' },
    { name: 'Others', value: calculations.tcs + calculations.registration + calculations.fastag + calculations.warranty + calculations.kit, color: '#3F3F46' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <CarFront className="text-black w-6 h-6" />
          </div>
          <h1 className="font-display text-xl uppercase tracking-[0.2em]">Thar ROXX Configurator</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Educator Mode</span>
          <button 
            onClick={() => setConfig(prev => ({ ...prev, educatorMode: !prev.educatorMode }))}
            className={cn(
              "w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center",
              config.educatorMode ? "bg-accent" : "bg-zinc-800"
            )}
          >
            <motion.div 
              animate={{ x: config.educatorMode ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Settings className={cn("w-3 h-3", config.educatorMode ? "text-accent" : "text-zinc-400")} />
            </motion.div>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <img 
          src={HERO_IMAGE} 
          alt="Mahindra Thar ROXX Hero" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-20 left-12 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-display uppercase tracking-tighter mb-4"
          >
            The Star is <br /> <span className="text-accent">Always in Spotlight</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg uppercase tracking-widest font-bold"
          >
            Introductory Price starting at ₹16.85 Lakh*
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-10">
          <section>
            <h2 className="font-display text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">01. Select Variant</h2>
            <div className="grid grid-cols-3 gap-3">
              {VARIANTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setConfig(prev => ({ ...prev, variant: v }))}
                  className={cn(
                    "py-4 rounded-xl font-bold text-sm transition-all border",
                    config.variant === v 
                      ? "bg-accent text-black border-accent shadow-[0_0_20px_rgba(234,179,8,0.3)]" 
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-display text-xs uppercase tracking-[0.3em] text-zinc-500">02. Ex-Showroom Price</h2>
              <span className="text-2xl font-display text-white">{formatCurrency(config.exShowroomPrice)}</span>
            </div>
            <input 
              type="range" 
              min="1200000" 
              max="2500000" 
              step="10000"
              value={config.exShowroomPrice}
              onChange={(e) => setConfig(prev => ({ ...prev, exShowroomPrice: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <span>₹12.00 Lakh</span>
              <span>₹25.00 Lakh</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">03. Fuel Type</h2>
              <div className="flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                {(['Petrol TGDi', 'Diesel mHawk'] as FuelType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setConfig(prev => ({ ...prev, fuelType: f }))}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                      config.fuelType === f ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {f.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">04. Insurance</h2>
              <select 
                value={config.insuranceType}
                onChange={(e) => setConfig(prev => ({ ...prev, insuranceType: e.target.value as InsuranceType }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Zero Depreciation">Zero Depreciation</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">05. Optional Add-ons</h2>
            <div className="space-y-3">
              {[
                { id: 'extendedWarranty', label: 'Extended Warranty (5 Years)', price: '₹25,000' },
                { id: 'fastag', label: 'Fastag', price: '₹500' },
                { id: 'premiumKit', label: 'Premium Accessories Kit', price: '₹45,000' },
              ].map((item) => (
                <label 
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                    config[item.id as keyof ConfigState] ? "bg-accent/5 border-accent/50" : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      config[item.id as keyof ConfigState] ? "bg-accent border-accent" : "border-zinc-700"
                    )}>
                      {config[item.id as keyof ConfigState] && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">{item.price}</span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!!config[item.id as keyof ConfigState]}
                    onChange={() => setConfig(prev => ({ ...prev, [item.id]: !prev[item.id as keyof ConfigState] }))}
                  />
                </label>
              ))}
            </div>
          </section>

          <AIStudioTools />
        </div>

        {/* Right Column: Breakdown */}
        <div className="lg:col-span-7 space-y-8">
          <Vehicle360Viewer />
          
          <div className="rugged-card rounded-[2.5rem] p-10 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <h2 className="font-display text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2">Final On-Road Price</h2>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl md:text-7xl font-display text-accent">{formatCurrency(calculations.total)}</span>
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">*T&C Apply</span>
              </div>

              <div className="grid grid-cols-3 gap-8 border-t border-zinc-800 pt-8 mb-12">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Ex-Showroom</p>
                  <p className="text-lg font-display">{formatCurrency(config.exShowroomPrice)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Road Tax (KL)</p>
                  <p className="text-lg font-display">{formatCurrency(calculations.roadTax)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Insurance</p>
                  <p className="text-lg font-display">{formatCurrency(calculations.insurance)}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-sm font-display">{((item.value / calculations.total) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rugged-card rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Component</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-zinc-800">
                  <td className="px-6 py-4 text-zinc-300">Ex-Showroom Price</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(config.exShowroomPrice)}</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="px-6 py-4 text-zinc-300">Kerala Road Tax (Progressive)</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(calculations.roadTax)}</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="px-6 py-4 text-zinc-300">Insurance ({config.insuranceType})</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(calculations.insurance)}</td>
                </tr>
                {calculations.tcs > 0 && (
                  <tr className="border-b border-zinc-800">
                    <td className="px-6 py-4 text-zinc-300">TCS (1% for &gt; ₹10L)</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(calculations.tcs)}</td>
                  </tr>
                )}
                <tr className="border-b border-zinc-800">
                  <td className="px-6 py-4 text-zinc-300">Registration & Handling</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(calculations.registration)}</td>
                </tr>
                {(calculations.fastag > 0 || calculations.warranty > 0 || calculations.kit > 0) && (
                  <tr>
                    <td className="px-6 py-4 text-zinc-300">Add-ons & Accessories</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(calculations.fastag + calculations.warranty + calculations.kit)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {config.educatorMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <h3 className="font-display text-xs uppercase tracking-[0.4em] text-accent mt-8 mb-6">Educator Insights</h3>
                
                <EducatorCard title="Ex-Showroom Price" icon={Banknote}>
                  The Ex-Showroom price is the base cost of the vehicle set by Mahindra. It includes the manufacturing cost, dealer margin, and GST (usually 28% + Cess for SUVs). It does not include registration, insurance, or road tax.
                </EducatorCard>

                <EducatorCard title="Kerala Road Tax Logic" icon={Info}>
                  Kerala follows a progressive slab system for private vehicles. For your current input of {formatCurrency(config.exShowroomPrice)}, the tax rate is 
                  <span className="text-accent font-bold mx-1">
                    {(calculateRoadTax(config.exShowroomPrice) / config.exShowroomPrice * 100).toFixed(0)}%
                  </span>.
                  <div className="mt-2 p-3 bg-black/40 rounded-xl font-mono text-xs">
                    Formula: {formatCurrency(config.exShowroomPrice)} × Slab Rate = {formatCurrency(calculations.roadTax)}
                  </div>
                </EducatorCard>

                <EducatorCard title="TCS (Tax Collected at Source)" icon={AlertCircle}>
                  As per Section 206C(1F) of the Income Tax Act, a 1% TCS is mandatory on the sale of any motor vehicle exceeding ₹10 Lakhs. This is collected by the dealer and can be claimed back during your ITR filing.
                </EducatorCard>

                <EducatorCard title="Insurance Breakdown" icon={ShieldCheck}>
                  Your {config.insuranceType} insurance covers third-party liabilities and own damage. Zero Depreciation (Zero-Dep) ensures you don't pay for parts' depreciation during claims, though the premium is slightly higher.
                </EducatorCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <h2 className="font-display text-4xl uppercase tracking-tighter mb-12">Experience <span className="text-accent">Sophistication</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURE_HIGHLIGHTS.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="rugged-card rounded-[2rem] overflow-hidden group"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={f.img} 
                  alt={f.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <f.icon className="text-accent w-6 h-6" />
                  <h3 className="font-display text-2xl uppercase tracking-tight">{f.title}</h3>
                </div>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cinematic Trailer Section */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="rugged-card rounded-[3rem] overflow-hidden relative h-[500px]">
          <video 
            src={TRAILER_VIDEO} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-5xl uppercase tracking-tighter mb-4">Unleash the <br /> <span className="text-accent">Legend Within</span></h2>
              <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
                Experience the raw power and refined luxury of the Mahindra Thar ROXX. Built for those who dare to explore the unknown.
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3">
                <Video className="w-5 h-5" /> Watch Full Film
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <h2 className="font-display text-xs uppercase tracking-[0.4em] text-zinc-500 mb-8">Adventure Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              className="aspect-square rounded-2xl overflow-hidden border border-zinc-800"
            >
              <img 
                src={img} 
                alt={`Gallery ${i}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="fixed bottom-0 left-0 right-0 glass px-6 py-4 border-t border-white/5 flex justify-between items-center">
        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selected Variant</p>
          <p className="text-sm font-display text-white">{config.variant} • {config.fuelType}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none border border-zinc-700 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Brochure
          </button>
          <button className="flex-1 md:flex-none bg-accent text-black px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-2">
            Book Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
