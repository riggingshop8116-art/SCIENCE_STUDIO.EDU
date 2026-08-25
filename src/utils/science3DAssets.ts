// Curated 3D Science Assets, Banners and Subject Configurations

import bannerScienceHeroFull from '../assets/images/science_hero_banner_1787479588801.jpg';
import bannerBlackHoleSpacetime from '../assets/images/space_blackhole_spacetime_1787480086847.jpg';
import bannerParticleAccelerator from '../assets/images/quantum_particle_accelerator_1787480103836.jpg';
import bannerCosmicNebula from '../assets/images/cosmic_nebula_astrophysics_1787480119149.jpg';
import bannerLaserOptics from '../assets/images/optics_laser_electromagnetic_1787480133446.jpg';
import bannerMolecularDNA from '../assets/images/molecular_dna_quantum_bio_1787480146520.jpg';
import bannerBioCellOrganelle from '../assets/images/bio_cell_organelle_3d_1787480529503.jpg';
import bannerNeuroSynapse from '../assets/images/neuro_synapse_brain_3d_1787480544302.jpg';
import bannerElectromagnetismFlux from '../assets/images/electromagnetism_flux_3d_1787480559721.jpg';
import bannerThermodynamicsEntropy from '../assets/images/thermodynamics_quantum_entropy_1787480572868.jpg';
import bannerSolarFusion from '../assets/images/astrophysics_solar_fusion_1787480588065.jpg';
import banner3DScienceStudio from '../assets/images/science_3d_banner_1787479248876.jpg';
import bannerPhysicsLab from '../assets/images/hero_physics_quantum_lab_1787477039417.jpg';
import bannerChemistryHub from '../assets/images/hero_chemistry_molecular_hub_1787477057681.jpg';
import bannerMathStudio from '../assets/images/hero_mathematics_calculus_studio_1787477075299.jpg';
import bannerBiologyGenetics from '../assets/images/hero_biology_genetics_lab_1787477092542.jpg';

export const SCIENCE_3D_BANNERS = {
  heroFull: bannerScienceHeroFull,
  blackHole: bannerBlackHoleSpacetime,
  particleAccelerator: bannerParticleAccelerator,
  cosmicNebula: bannerCosmicNebula,
  laserOptics: bannerLaserOptics,
  molecularDNA: bannerMolecularDNA,
  bioCell: bannerBioCellOrganelle,
  neuroSynapse: bannerNeuroSynapse,
  electromagnetism: bannerElectromagnetismFlux,
  thermodynamics: bannerThermodynamicsEntropy,
  solarFusion: bannerSolarFusion,
  scienceStudio: banner3DScienceStudio,
  physicsLab: bannerPhysicsLab,
  chemistryHub: bannerChemistryHub,
  mathStudio: bannerMathStudio,
  biologyGenetics: bannerBiologyGenetics
};

export interface SubjectTheme {
  id: string;
  name: string;
  nameBangla: string;
  badge: string;
  tagline: string;
  banner: string;
  glowColor: string;
  borderGlow: string;
  accentGradient: string;
  symbol: string;
}

export const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  physics: {
    id: 'physics',
    name: 'Physics',
    nameBangla: 'পদার্থবিজ্ঞান',
    badge: 'QUANTUM & FIELD PHYSICS',
    tagline: 'ওয়েভ মেকানিক্স, কোয়ান্টাম ডায়নামিক্স ও মহাকর্ষীয় ফিল্ড',
    banner: bannerParticleAccelerator,
    glowColor: 'cyan',
    borderGlow: 'rgba(34,211,238,0.4)',
    accentGradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    symbol: '🌌'
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry',
    nameBangla: 'রসায়নবিজ্ঞান',
    badge: 'MOLECULAR ORBITALS & ATOMS',
    tagline: 'পরমাণু মডেল, অরবিটাল হাইব্রিডাইজেশন ও রাসায়নিক বিক্রিয়া',
    banner: bannerChemistryHub,
    glowColor: 'emerald',
    borderGlow: 'rgba(16,185,129,0.4)',
    accentGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    symbol: '⚛️'
  },
  biology: {
    id: 'biology',
    name: 'Biology',
    nameBangla: 'জীববিজ্ঞান',
    badge: 'CYTOLOGY & CELL ANATOMY',
    tagline: 'ইউক্যারিওটিক সেল, নিউরন সাইন্যাপ্স ও ডিএনএ ডাবল হেলিক্স',
    banner: bannerBioCellOrganelle,
    glowColor: 'rose',
    borderGlow: 'rgba(244,63,94,0.4)',
    accentGradient: 'from-rose-500 via-pink-500 to-purple-600',
    symbol: '🧬'
  },
  math: {
    id: 'math',
    name: 'Mathematics',
    nameBangla: 'উচ্চতর গণিত',
    badge: 'CALCULUS & 3D VECTORS',
    tagline: 'ডিফারেনশিয়াল ক্যালকুলাস, ত্রিকোণমিতিক বৃত্ত ও ভেক্টর স্পেস',
    banner: bannerMathStudio,
    glowColor: 'amber',
    borderGlow: 'rgba(245,158,11,0.4)',
    accentGradient: 'from-amber-500 via-orange-500 to-red-600',
    symbol: '📐'
  },
  electromagnetism: {
    id: 'electromagnetism',
    name: 'Electromagnetism',
    nameBangla: 'তড়িৎ ও চৌম্বকবিজ্ঞান',
    badge: 'ELECTROMAGNETIC DYNAMICS',
    tagline: 'লরেঞ্জ ফোর্স, ম্যাক্সওয়েল সমীকরণ ও ম্যাগনেটিক ফ্লাক্স',
    banner: bannerElectromagnetismFlux,
    glowColor: 'purple',
    borderGlow: 'rgba(168,85,247,0.4)',
    accentGradient: 'from-purple-500 via-indigo-500 to-cyan-500',
    symbol: '⚡'
  },
  thermodynamics: {
    id: 'thermodynamics',
    name: 'Thermodynamics',
    nameBangla: 'তাপ ও গতিবিজ্ঞান',
    badge: 'THERMODYNAMICS & ENTROPY',
    tagline: 'কার্নো চক্র, এন্ট্রপি গ্রাফ ও মলিকিউলার কাইনেটিক থিওরি',
    banner: bannerThermodynamicsEntropy,
    glowColor: 'amber',
    borderGlow: 'rgba(251,146,60,0.4)',
    accentGradient: 'from-amber-500 via-rose-500 to-orange-600',
    symbol: '🔥'
  }
};
