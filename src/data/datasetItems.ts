import beachLagoonBg from '../assets/images/beach_lagoon_bg_1790837488988.jpg';
import emeraldWaterfallBg from '../assets/images/emerald_waterfall_bg_1790837499711.jpg';
import goldenAtollBg from '../assets/images/golden_atoll_bg_1790837510017.jpg';
import linkSplashBanner from '../assets/images/link_splash_banner_1790837518976.jpg';
import itemKiwiTrue from '../assets/images/item_kiwi_true_1790850278136.jpg';
import itemPearTrue from '../assets/images/item_pear_true_1790850084858.jpg';
import itemSpoonTrue from '../assets/images/item_spoon_true_1790849529283.jpg';
import itemCycleTrue from '../assets/images/item_cycle_true_1790849542190.jpg';
import itemPenTrue from '../assets/images/item_pen_true_1790849697674.jpg';

export type ItemCategory = 'Fruit' | 'Animal' | 'Nature' | 'Object';

export interface DatasetItem {
  id: string;
  index: number;
  name: string;
  category: ItemCategory;
  imagePath: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorGroup: 'red_pink' | 'yellow_orange' | 'green' | 'blue_purple' | 'brown_neutral';
}

const RAW_ITEMS: Array<{
  name: string;
  category: ItemCategory;
  primary: string;
  secondary: string;
  accent: string;
  colorGroup: DatasetItem['colorGroup'];
}> = [
  // Fruits (1 - 50)
  { name: 'Apple', category: 'Fruit', primary: '#EF4444', secondary: '#FCA5A5', accent: '#16A34A', colorGroup: 'red_pink' },
  { name: 'Banana', category: 'Fruit', primary: '#FACC15', secondary: '#FEF08A', accent: '#A16207', colorGroup: 'yellow_orange' },
  { name: 'Orange', category: 'Fruit', primary: '#F97316', secondary: '#FDBA74', accent: '#15803D', colorGroup: 'yellow_orange' },
  { name: 'Strawberry', category: 'Fruit', primary: '#E11D48', secondary: '#FDA4AF', accent: '#16A34A', colorGroup: 'red_pink' },
  { name: 'Grape', category: 'Fruit', primary: '#7C3AED', secondary: '#C4B5FD', accent: '#15803D', colorGroup: 'blue_purple' },
  { name: 'Mango', category: 'Fruit', primary: '#F59E0B', secondary: '#FDE047', accent: '#EF4444', colorGroup: 'yellow_orange' },
  { name: 'Pineapple', category: 'Fruit', primary: '#EAB308', secondary: '#CA8A04', accent: '#15803D', colorGroup: 'yellow_orange' },
  { name: 'Watermelon', category: 'Fruit', primary: '#F43F5E', secondary: '#16A34A', accent: '#1E293B', colorGroup: 'red_pink' },
  { name: 'Blueberry', category: 'Fruit', primary: '#2563EB', secondary: '#93C5FD', accent: '#1E3A8A', colorGroup: 'blue_purple' },
  { name: 'Raspberry', category: 'Fruit', primary: '#DB2777', secondary: '#F472B6', accent: '#16A34A', colorGroup: 'red_pink' },
  { name: 'Peach', category: 'Fruit', primary: '#FB7185', secondary: '#FDBA74', accent: '#16A34A', colorGroup: 'red_pink' },
  { name: 'Pear', category: 'Fruit', primary: '#84CC16', secondary: '#D9F99D', accent: '#713F12', colorGroup: 'green' },
  { name: 'Cherry', category: 'Fruit', primary: '#DC2626', secondary: '#F87171', accent: '#15803D', colorGroup: 'red_pink' },
  { name: 'Kiwi', category: 'Fruit', primary: '#65A30D', secondary: '#ECFCCB', accent: '#78350F', colorGroup: 'green' },
  { name: 'Lemon', category: 'Fruit', primary: '#EAB308', secondary: '#FEF08A', accent: '#16A34A', colorGroup: 'yellow_orange' },
  { name: 'Lime', category: 'Fruit', primary: '#16A34A', secondary: '#86EFAC', accent: '#065F46', colorGroup: 'green' },
  { name: 'Avocado', category: 'Fruit', primary: '#15803D', secondary: '#BEF264', accent: '#78350F', colorGroup: 'green' },
  { name: 'Coconut', category: 'Fruit', primary: '#78350F', secondary: '#F8FAFC', accent: '#A16207', colorGroup: 'brown_neutral' },
  { name: 'Papaya', category: 'Fruit', primary: '#F97316', secondary: '#FDE047', accent: '#1E293B', colorGroup: 'yellow_orange' },
  { name: 'Pomegranate', category: 'Fruit', primary: '#BE123C', secondary: '#FB7185', accent: '#881337', colorGroup: 'red_pink' },
  { name: 'Fig', category: 'Fruit', primary: '#6D28D9', secondary: '#F43F5E', accent: '#4C1D95', colorGroup: 'blue_purple' },
  { name: 'Plum', category: 'Fruit', primary: '#7E22CE', secondary: '#C084FC', accent: '#15803D', colorGroup: 'blue_purple' },
  { name: 'Apricot', category: 'Fruit', primary: '#FB923C', secondary: '#FED7AA', accent: '#16A34A', colorGroup: 'yellow_orange' },
  { name: 'Blackberry', category: 'Fruit', primary: '#312E81', secondary: '#6366F1', accent: '#15803D', colorGroup: 'blue_purple' },
  { name: 'Cranberry', category: 'Fruit', primary: '#B91C1C', secondary: '#FCA5A5', accent: '#166534', colorGroup: 'red_pink' },
  { name: 'Dragon Fruit', category: 'Fruit', primary: '#EC4899', secondary: '#F8FAFC', accent: '#22C55E', colorGroup: 'red_pink' },
  { name: 'Passion Fruit', category: 'Fruit', primary: '#581C87', secondary: '#FACC15', accent: '#15803D', colorGroup: 'blue_purple' },
  { name: 'Guava', category: 'Fruit', primary: '#22C55E', secondary: '#FB7185', accent: '#FEF08A', colorGroup: 'green' },
  { name: 'Lychee', category: 'Fruit', primary: '#F43F5E', secondary: '#FFF1F2', accent: '#78350F', colorGroup: 'red_pink' },
  { name: 'Cantaloupe', category: 'Fruit', primary: '#FB923C', secondary: '#BBF7D0', accent: '#FDBA74', colorGroup: 'yellow_orange' },
  { name: 'Honeydew Melon', category: 'Fruit', primary: '#86EFAC', secondary: '#DCFCE7', accent: '#15803D', colorGroup: 'green' },
  { name: 'Grapefruit', category: 'Fruit', primary: '#F43F5E', secondary: '#FDBA74', accent: '#FB923C', colorGroup: 'red_pink' },
  { name: 'Tangerine', category: 'Fruit', primary: '#EA580C', secondary: '#FED7AA', accent: '#16A34A', colorGroup: 'yellow_orange' },
  { name: 'Clementine', category: 'Fruit', primary: '#F97316', secondary: '#FFEDD5', accent: '#15803D', colorGroup: 'yellow_orange' },
  { name: 'Persimmon', category: 'Fruit', primary: '#EA580C', secondary: '#FDBA74', accent: '#3F6212', colorGroup: 'yellow_orange' },
  { name: 'Nectarine', category: 'Fruit', primary: '#E11D48', secondary: '#FBBF24', accent: '#15803D', colorGroup: 'red_pink' },
  { name: 'Star Fruit', category: 'Fruit', primary: '#FACC15', secondary: '#FEF08A', accent: '#A16207', colorGroup: 'yellow_orange' },
  { name: 'Durian', category: 'Fruit', primary: '#65A30D', secondary: '#FDE047', accent: '#3F6212', colorGroup: 'green' },
  { name: 'Jackfruit', category: 'Fruit', primary: '#84CC16', secondary: '#FACC15', accent: '#4D7C0F', colorGroup: 'green' },
  { name: 'Rambutan', category: 'Fruit', primary: '#E11D48', secondary: '#FDE047', accent: '#16A34A', colorGroup: 'red_pink' },
  { name: 'Mangosteen', category: 'Fruit', primary: '#581C87', secondary: '#F8FAFC', accent: '#16A34A', colorGroup: 'blue_purple' },
  { name: 'Date', category: 'Fruit', primary: '#78350F', secondary: '#B45309', accent: '#451A03', colorGroup: 'brown_neutral' },
  { name: 'Mulberry', category: 'Fruit', primary: '#4C1D95', secondary: '#A78BFA', accent: '#16A34A', colorGroup: 'blue_purple' },
  { name: 'Gooseberry', category: 'Fruit', primary: '#84CC16', secondary: '#ECFCCB', accent: '#3F6212', colorGroup: 'green' },
  { name: 'Elderberry', category: 'Fruit', primary: '#1E1B4B', secondary: '#818CF8', accent: '#15803D', colorGroup: 'blue_purple' },
  { name: 'Boysenberry', category: 'Fruit', primary: '#701A75', secondary: '#E879F9', accent: '#16A34A', colorGroup: 'blue_purple' },
  { name: 'Kumquat', category: 'Fruit', primary: '#F59E0B', secondary: '#FDE68A', accent: '#15803D', colorGroup: 'yellow_orange' },
  { name: 'Plantain', category: 'Fruit', primary: '#84CC16', secondary: '#FEF08A', accent: '#3F6212', colorGroup: 'green' },
  { name: 'Tamarind', category: 'Fruit', primary: '#92400E', secondary: '#D97706', accent: '#451A03', colorGroup: 'brown_neutral' },
  { name: 'Quince', category: 'Fruit', primary: '#EAB308', secondary: '#FEF9C3', accent: '#15803D', colorGroup: 'yellow_orange' },

  // Animals (51 - 80)
  { name: 'Cat', category: 'Animal', primary: '#F97316', secondary: '#FFEDD5', accent: '#F43F5E', colorGroup: 'yellow_orange' },
  { name: 'Wolf', category: 'Animal', primary: '#64748B', secondary: '#E2E8F0', accent: '#F59E0B', colorGroup: 'brown_neutral' },
  { name: 'Eagle', category: 'Animal', primary: '#78350F', secondary: '#F8FAFC', accent: '#FACC15', colorGroup: 'brown_neutral' },
  { name: 'Lion', category: 'Animal', primary: '#F59E0B', secondary: '#B45309', accent: '#FEF3C7', colorGroup: 'yellow_orange' },
  { name: 'Tiger', category: 'Animal', primary: '#EA580C', secondary: '#FFEDD5', accent: '#1E293B', colorGroup: 'yellow_orange' },
  { name: 'Dolphin', category: 'Animal', primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#0284C7', colorGroup: 'blue_purple' },
  { name: 'Panda', category: 'Animal', primary: '#F8FAFC', secondary: '#1E293B', accent: '#22C55E', colorGroup: 'brown_neutral' },
  { name: 'Elephant', category: 'Animal', primary: '#94A3B8', secondary: '#CBD5E1', accent: '#FDA4AF', colorGroup: 'brown_neutral' },
  { name: 'Penguin', category: 'Animal', primary: '#1E293B', secondary: '#F8FAFC', accent: '#F97316', colorGroup: 'brown_neutral' },
  { name: 'Giraffe', category: 'Animal', primary: '#FACC15', secondary: '#92400E', accent: '#FEF08A', colorGroup: 'yellow_orange' },
  { name: 'Dog', category: 'Animal', primary: '#D97706', secondary: '#FEF3C7', accent: '#78350F', colorGroup: 'brown_neutral' },
  { name: 'Rabbit', category: 'Animal', primary: '#F8FAFC', secondary: '#FDA4AF', accent: '#F43F5E', colorGroup: 'red_pink' },
  { name: 'Fox', category: 'Animal', primary: '#EA580C', secondary: '#F8FAFC', accent: '#1E293B', colorGroup: 'yellow_orange' },
  { name: 'Horse', category: 'Animal', primary: '#92400E', secondary: '#451A03', accent: '#FDE68A', colorGroup: 'brown_neutral' },
  { name: 'Monkey', category: 'Animal', primary: '#92400E', secondary: '#FDE68A', accent: '#78350F', colorGroup: 'brown_neutral' },
  { name: 'Kangaroo', category: 'Animal', primary: '#D97706', secondary: '#FDE68A', accent: '#92400E', colorGroup: 'brown_neutral' },
  { name: 'Bear', category: 'Animal', primary: '#78350F', secondary: '#D97706', accent: '#451A03', colorGroup: 'brown_neutral' },
  { name: 'Cheetah', category: 'Animal', primary: '#FBBF24', secondary: '#FEF3C7', accent: '#1E293B', colorGroup: 'yellow_orange' },
  { name: 'Owl', category: 'Animal', primary: '#854D0E', secondary: '#FEF08A', accent: '#F97316', colorGroup: 'brown_neutral' },
  { name: 'Whale', category: 'Animal', primary: '#2563EB', secondary: '#DBEAFE', accent: '#1D4ED8', colorGroup: 'blue_purple' },
  { name: 'Gorilla', category: 'Animal', primary: '#334155', secondary: '#64748B', accent: '#0F172A', colorGroup: 'brown_neutral' },
  { name: 'Koala', category: 'Animal', primary: '#64748B', secondary: '#E2E8F0', accent: '#1E293B', colorGroup: 'brown_neutral' },
  { name: 'Sloth', category: 'Animal', primary: '#A16207', secondary: '#FEF3C7', accent: '#451A03', colorGroup: 'brown_neutral' },
  { name: 'Crocodile', category: 'Animal', primary: '#15803D', secondary: '#86EFAC', accent: '#FACC15', colorGroup: 'green' },
  { name: 'Jaguar', category: 'Animal', primary: '#F59E0B', secondary: '#FDE68A', accent: '#1E293B', colorGroup: 'yellow_orange' },
  { name: 'Falcon', category: 'Animal', primary: '#475569', secondary: '#F8FAFC', accent: '#EAB308', colorGroup: 'brown_neutral' },
  { name: 'Zebra', category: 'Animal', primary: '#F8FAFC', secondary: '#0F172A', accent: '#64748B', colorGroup: 'brown_neutral' },
  { name: 'Flamingo', category: 'Animal', primary: '#F43F5E', secondary: '#FDA4AF', accent: '#1E293B', colorGroup: 'red_pink' },
  { name: 'Otter', category: 'Animal', primary: '#92400E', secondary: '#FDE68A', accent: '#451A03', colorGroup: 'brown_neutral' },
  { name: 'Peacock', category: 'Animal', primary: '#0284C7', secondary: '#10B981', accent: '#FACC15', colorGroup: 'blue_purple' },

  // Objects & Nature (81 - 100)
  { name: 'Pizza', category: 'Object', primary: '#F59E0B', secondary: '#EF4444', accent: '#D97706', colorGroup: 'yellow_orange' },
  { name: 'Flower', category: 'Nature', primary: '#EC4899', secondary: '#FACC15', accent: '#F472B6', colorGroup: 'red_pink' },
  { name: 'Guitar', category: 'Object', primary: '#D97706', secondary: '#78350F', accent: '#FDE68A', colorGroup: 'brown_neutral' },
  { name: 'Piano', category: 'Object', primary: '#1E293B', secondary: '#F8FAFC', accent: '#EF4444', colorGroup: 'brown_neutral' },
  { name: 'Waterfall', category: 'Nature', primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#10B981', colorGroup: 'blue_purple' },
  { name: 'Mountain', category: 'Nature', primary: '#64748B', secondary: '#F8FAFC', accent: '#10B981', colorGroup: 'brown_neutral' },
  { name: 'Moon', category: 'Nature', primary: '#FACC15', secondary: '#FEF08A', accent: '#CA8A04', colorGroup: 'yellow_orange' },
  { name: 'Sun', category: 'Nature', primary: '#F59E0B', secondary: '#FDE047', accent: '#EA580C', colorGroup: 'yellow_orange' },
  { name: 'Star', category: 'Nature', primary: '#FACC15', secondary: '#FEF9C3', accent: '#EAB308', colorGroup: 'yellow_orange' },
  { name: 'Cloud', category: 'Nature', primary: '#38BDF8', secondary: '#F8FAFC', accent: '#BAE6FD', colorGroup: 'blue_purple' },
  { name: 'Lake', category: 'Nature', primary: '#0284C7', secondary: '#7DD3FC', accent: '#22C55E', colorGroup: 'blue_purple' },
  { name: 'Sea', category: 'Nature', primary: '#0369A1', secondary: '#38BDF8', accent: '#E0F2FE', colorGroup: 'blue_purple' },
  { name: 'Plate', category: 'Object', primary: '#E2E8F0', secondary: '#F8FAFC', accent: '#3B82F6', colorGroup: 'brown_neutral' },
  { name: 'Sunglasses', category: 'Object', primary: '#1E293B', secondary: '#0EA5E9', accent: '#F43F5E', colorGroup: 'blue_purple' },
  { name: 'Ice-cream', category: 'Object', primary: '#F472B6', secondary: '#FDE68A', accent: '#D97706', colorGroup: 'red_pink' },
  { name: 'Spoon', category: 'Object', primary: '#94A3B8', secondary: '#F1F5F9', accent: '#475569', colorGroup: 'brown_neutral' },
  { name: 'Cycle', category: 'Object', primary: '#EF4444', secondary: '#1E293B', accent: '#38BDF8', colorGroup: 'red_pink' },
  { name: 'Car', category: 'Object', primary: '#EF4444', secondary: '#38BDF8', accent: '#1E293B', colorGroup: 'red_pink' },
  { name: 'Pen', category: 'Object', primary: '#2563EB', secondary: '#FACC15', accent: '#1E293B', colorGroup: 'blue_purple' },
  { name: 'Bottle', category: 'Object', primary: '#06B6D4', secondary: '#CFFAFE', accent: '#0284C7', colorGroup: 'blue_purple' },
];

export const TRUE_GENERATED_ITEM_IMAGES: Record<string, string> = {
  kiwi: itemKiwiTrue,
  pear: itemPearTrue,
  spoon: itemSpoonTrue,
  cycle: itemCycleTrue,
  pen: itemPenTrue,
};

export const DATASET_ITEMS: DatasetItem[] = RAW_ITEMS.map((item, idx) => {
  const slug = item.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return {
    id: slug,
    index: idx + 1,
    name: item.name,
    category: item.category,
    imagePath: TRUE_GENERATED_ITEM_IMAGES[slug] || `/images/${slug}.svg`,
    primaryColor: item.primary,
    secondaryColor: item.secondary,
    accentColor: item.accent,
    colorGroup: item.colorGroup,
  };
});

export interface LevelConfig {
  level: number;
  difficultyLabel: string;
  title: string;
  subtitle: string;
  stageBackdrop: string;
  targetCount: number; // How many target matching items must be connected
  distractorPoolSize: number; // How many additional items appear on the field (10 total or 10 distractors)
  stepDurationSeconds: number; // Always 10 seconds per step as requested
  stepsPerLevel: number;
  driftSpeed: number; // 0 = gentle bob, 1 = slow current, 2 = medium, 3 = rapid
  lookalikeDistractors: boolean; // Whether distractors share color/category
  pointsPerTarget: number;
}

export const STAGE_BACKDROPS = {
  beachLagoon: beachLagoonBg,
  emeraldWaterfall: emeraldWaterfallBg,
  goldenAtoll: goldenAtollBg,
  heroBanner: linkSplashBanner,
};

export function getLevelConfig(level: number): LevelConfig {
  const safeLevel = Math.max(1, level);
  // Keep the tropical beach lagoon background constant so it never changes across deployments or levels
  const stageBackdrop = STAGE_BACKDROPS.beachLagoon;

  if (safeLevel === 1) {
    return {
      level: 1,
      difficultyLabel: 'Easy',
      title: 'Azure Sandbar Lagoon',
      subtitle: 'Link 3 matching target items among 10 items in 10s',
      stageBackdrop,
      targetCount: 3,
      distractorPoolSize: 10,
      stepDurationSeconds: 10,
      stepsPerLevel: 3,
      driftSpeed: 0.35,
      lookalikeDistractors: false,
      pointsPerTarget: 100,
    };
  }
  if (safeLevel === 2) {
    return {
      level: 2,
      difficultyLabel: 'Medium',
      title: 'Emerald Cascade Pool',
      subtitle: 'Link 4 matching items with same-category decoys in 10s',
      stageBackdrop,
      targetCount: 4,
      distractorPoolSize: 10,
      stepDurationSeconds: 10,
      stepsPerLevel: 3,
      driftSpeed: 0.8,
      lookalikeDistractors: true,
      pointsPerTarget: 140,
    };
  }
  if (safeLevel === 3) {
    return {
      level: 3,
      difficultyLabel: 'Hard',
      title: 'Golden Coral Atoll',
      subtitle: 'Link 5 matching items across drifting currents in 10s',
      stageBackdrop,
      targetCount: 5,
      distractorPoolSize: 10,
      stepDurationSeconds: 10,
      stepsPerLevel: 4,
      driftSpeed: 1.25,
      lookalikeDistractors: true,
      pointsPerTarget: 180,
    };
  }
  if (safeLevel === 4) {
    return {
      level: 4,
      difficultyLabel: 'Expert',
      title: 'Tidal Vortex Reef',
      subtitle: 'Link 5 color-matched targets in fast currents in 10s',
      stageBackdrop,
      targetCount: 5,
      distractorPoolSize: 10,
      stepDurationSeconds: 10,
      stepsPerLevel: 4,
      driftSpeed: 1.75,
      lookalikeDistractors: true,
      pointsPerTarget: 230,
    };
  }
  return {
    level: safeLevel,
    difficultyLabel: safeLevel === 5 ? 'Master' : `Master ${safeLevel}`,
    title: `Abyssal Cyclone Stage ${safeLevel}`,
    subtitle: 'Link 6 matching targets in rapid currents within 10s',
    stageBackdrop,
    targetCount: 6,
    distractorPoolSize: 10,
    stepDurationSeconds: 10,
    stepsPerLevel: 5,
    driftSpeed: Math.min(2.6, 1.8 + (safeLevel - 4) * 0.3),
    lookalikeDistractors: true,
    pointsPerTarget: 250 + (safeLevel - 4) * 50,
  };
}
