import fs from 'fs';
import path from 'path';

const DATASET_ITEMS = [
  // Fruits (50)
  { name: 'Apple', category: 'Fruit', primary: '#EF4444', secondary: '#FCA5A5', accent: '#16A34A', shape: 'round_fruit' },
  { name: 'Banana', category: 'Fruit', primary: '#FACC15', secondary: '#FEF08A', accent: '#A16207', shape: 'crescent' },
  { name: 'Orange', category: 'Fruit', primary: '#F97316', secondary: '#FED7AA', accent: '#15803D', shape: 'citrus' },
  { name: 'Strawberry', category: 'Fruit', primary: '#E11D48', secondary: '#FDA4AF', accent: '#16A34A', shape: 'berry_heart' },
  { name: 'Grape', category: 'Fruit', primary: '#7C3AED', secondary: '#C4B5FD', accent: '#15803D', shape: 'cluster' },
  { name: 'Mango', category: 'Fruit', primary: '#F59E0B', secondary: '#FDE047', accent: '#EF4444', shape: 'oval_fruit' },
  { name: 'Pineapple', category: 'Fruit', primary: '#EAB308', secondary: '#CA8A04', accent: '#15803D', shape: 'pineapple' },
  { name: 'Watermelon', category: 'Fruit', primary: '#F43F5E', secondary: '#16A34A', accent: '#1E293B', shape: 'melon_slice' },
  { name: 'Blueberry', category: 'Fruit', primary: '#2563EB', secondary: '#93C5FD', accent: '#1E3A8A', shape: 'double_berry' },
  { name: 'Raspberry', category: 'Fruit', primary: '#DB2777', secondary: '#F472B6', accent: '#16A34A', shape: 'cluster_berry' },
  { name: 'Peach', category: 'Fruit', primary: '#FB7185', secondary: '#FDBA74', accent: '#16A34A', shape: 'cleft_fruit' },
  { name: 'Pear', category: 'Fruit', primary: '#84CC16', secondary: '#D9F99D', accent: '#713F12', shape: 'pear' },
  { name: 'Cherry', category: 'Fruit', primary: '#DC2626', secondary: '#F87171', accent: '#15803D', shape: 'twin_cherry' },
  { name: 'Kiwi', category: 'Fruit', primary: '#65A30D', secondary: '#ECFCCB', accent: '#78350F', shape: 'kiwi_half' },
  { name: 'Lemon', category: 'Fruit', primary: '#FACC15', secondary: '#FEF08A', accent: '#16A34A', shape: 'lemon' },
  { name: 'Lime', category: 'Fruit', primary: '#16A34A', secondary: '#86EFAC', accent: '#065F46', shape: 'lemon' },
  { name: 'Avocado', category: 'Fruit', primary: '#15803D', secondary: '#BEF264', accent: '#78350F', shape: 'avocado' },
  { name: 'Coconut', category: 'Fruit', primary: '#78350F', secondary: '#F8FAFC', accent: '#A16207', shape: 'coconut' },
  { name: 'Papaya', category: 'Fruit', primary: '#F97316', secondary: '#FDE047', accent: '#1E293B', shape: 'papaya' },
  { name: 'Pomegranate', category: 'Fruit', primary: '#BE123C', secondary: '#FB7185', accent: '#881337', shape: 'crowned_fruit' },
  { name: 'Fig', category: 'Fruit', primary: '#6D28D9', secondary: '#F43F5E', accent: '#4C1D95', shape: 'pear' },
  { name: 'Plum', category: 'Fruit', primary: '#7E22CE', secondary: '#C084FC', accent: '#15803D', shape: 'cleft_fruit' },
  { name: 'Apricot', category: 'Fruit', primary: '#FB923C', secondary: '#FED7AA', accent: '#16A34A', shape: 'cleft_fruit' },
  { name: 'Blackberry', category: 'Fruit', primary: '#312E81', secondary: '#6366F1', accent: '#15803D', shape: 'cluster_berry' },
  { name: 'Cranberry', category: 'Fruit', primary: '#B91C1C', secondary: '#FCA5A5', accent: '#166534', shape: 'double_berry' },
  { name: 'Dragon Fruit', category: 'Fruit', primary: '#EC4899', secondary: '#F8FAFC', accent: '#22C55E', shape: 'dragon_fruit' },
  { name: 'Passion Fruit', category: 'Fruit', primary: '#581C87', secondary: '#FACC15', accent: '#15803D', shape: 'kiwi_half' },
  { name: 'Guava', category: 'Fruit', primary: '#22C55E', secondary: '#FB7185', accent: '#FEF08A', shape: 'kiwi_half' },
  { name: 'Lychee', category: 'Fruit', primary: '#F43F5E', secondary: '#FFF1F2', accent: '#78350F', shape: 'spiky_round' },
  { name: 'Cantaloupe', category: 'Fruit', primary: '#FB923C', secondary: '#BBF7D0', accent: '#FDBA74', shape: 'melon_slice' },
  { name: 'Honeydew Melon', category: 'Fruit', primary: '#86EFAC', secondary: '#DCFCE7', accent: '#15803D', shape: 'melon_slice' },
  { name: 'Grapefruit', category: 'Fruit', primary: '#F43F5E', secondary: '#FDBA74', accent: '#FB923C', shape: 'citrus' },
  { name: 'Tangerine', category: 'Fruit', primary: '#EA580C', secondary: '#FED7AA', accent: '#16A34A', shape: 'citrus' },
  { name: 'Clementine', category: 'Fruit', primary: '#F97316', secondary: '#FFEDD5', accent: '#15803D', shape: 'round_fruit' },
  { name: 'Persimmon', category: 'Fruit', primary: '#EA580C', secondary: '#FDBA74', accent: '#3F6212', shape: 'crowned_fruit' },
  { name: 'Nectarine', category: 'Fruit', primary: '#E11D48', secondary: '#FBBF24', accent: '#15803D', shape: 'cleft_fruit' },
  { name: 'Star Fruit', category: 'Fruit', primary: '#FACC15', secondary: '#FEF08A', accent: '#A16207', shape: 'star_shape' },
  { name: 'Durian', category: 'Fruit', primary: '#65A30D', secondary: '#FDE047', accent: '#3F6212', shape: 'spiky_round' },
  { name: 'Jackfruit', category: 'Fruit', primary: '#84CC16', secondary: '#FACC15', accent: '#4D7C0F', shape: 'oval_fruit' },
  { name: 'Rambutan', category: 'Fruit', primary: '#E11D48', secondary: '#FDE047', accent: '#16A34A', shape: 'spiky_round' },
  { name: 'Mangosteen', category: 'Fruit', primary: '#581C87', secondary: '#F8FAFC', accent: '#16A34A', shape: 'crowned_fruit' },
  { name: 'Date', category: 'Fruit', primary: '#78350F', secondary: '#B45309', accent: '#451A03', shape: 'oval_fruit' },
  { name: 'Mulberry', category: 'Fruit', primary: '#4C1D95', secondary: '#A78BFA', accent: '#16A34A', shape: 'cluster_berry' },
  { name: 'Gooseberry', category: 'Fruit', primary: '#84CC16', secondary: '#ECFCCB', accent: '#3F6212', shape: 'round_fruit' },
  { name: 'Elderberry', category: 'Fruit', primary: '#1E1B4B', secondary: '#818CF8', accent: '#15803D', shape: 'cluster' },
  { name: 'Boysenberry', category: 'Fruit', primary: '#701A75', secondary: '#E879F9', accent: '#16A34A', shape: 'cluster_berry' },
  { name: 'Kumquat', category: 'Fruit', primary: '#F59E0B', secondary: '#FDE68A', accent: '#15803D', shape: 'oval_fruit' },
  { name: 'Plantain', category: 'Fruit', primary: '#84CC16', secondary: '#FEF08A', accent: '#3F6212', shape: 'crescent' },
  { name: 'Tamarind', category: 'Fruit', primary: '#92400E', secondary: '#D97706', accent: '#451A03', shape: 'crescent' },
  { name: 'Quince', category: 'Fruit', primary: '#EAB308', secondary: '#FEF9C3', accent: '#15803D', shape: 'pear' },

  // Animals (30)
  { name: 'Cat', category: 'Animal', primary: '#F97316', secondary: '#FFEDD5', accent: '#F43F5E', shape: 'feline' },
  { name: 'Wolf', category: 'Animal', primary: '#64748B', secondary: '#E2E8F0', accent: '#F59E0B', shape: 'canine_pointy' },
  { name: 'Eagle', category: 'Animal', primary: '#78350F', secondary: '#F8FAFC', accent: '#FACC15', shape: 'eagle' },
  { name: 'Lion', category: 'Animal', primary: '#F59E0B', secondary: '#B45309', accent: '#FEF3C7', shape: 'lion' },
  { name: 'Tiger', category: 'Animal', primary: '#EA580C', secondary: '#FFEDD5', accent: '#1E293B', shape: 'tiger' },
  { name: 'Dolphin', category: 'Animal', primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#0284C7', shape: 'dolphin' },
  { name: 'Panda', category: 'Animal', primary: '#F8FAFC', secondary: '#1E293B', accent: '#22C55E', shape: 'panda' },
  { name: 'Elephant', category: 'Animal', primary: '#94A3B8', secondary: '#CBD5E1', accent: '#FDA4AF', shape: 'elephant' },
  { name: 'Penguin', category: 'Animal', primary: '#1E293B', secondary: '#F8FAFC', accent: '#F97316', shape: 'penguin' },
  { name: 'Giraffe', category: 'Animal', primary: '#FACC15', secondary: '#92400E', accent: '#FEF08A', shape: 'giraffe' },
  { name: 'Dog', category: 'Animal', primary: '#D97706', secondary: '#FEF3C7', accent: '#78350F', shape: 'dog_floppy' },
  { name: 'Rabbit', category: 'Animal', primary: '#F8FAFC', secondary: '#FDA4AF', accent: '#F43F5E', shape: 'rabbit' },
  { name: 'Fox', category: 'Animal', primary: '#EA580C', secondary: '#F8FAFC', accent: '#1E293B', shape: 'canine_pointy' },
  { name: 'Horse', category: 'Animal', primary: '#92400E', secondary: '#451A03', accent: '#FDE68A', shape: 'horse' },
  { name: 'Monkey', category: 'Animal', primary: '#92400E', secondary: '#FDE68A', accent: '#78350F', shape: 'monkey' },
  { name: 'Kangaroo', category: 'Animal', primary: '#D97706', secondary: '#FDE68A', accent: '#92400E', shape: 'kangaroo' },
  { name: 'Bear', category: 'Animal', primary: '#78350F', secondary: '#D97706', accent: '#451A03', shape: 'bear' },
  { name: 'Cheetah', category: 'Animal', primary: '#FBBF24', secondary: '#FEF3C7', accent: '#1E293B', shape: 'cheetah' },
  { name: 'Owl', category: 'Animal', primary: '#854D0E', secondary: '#FEF08A', accent: '#F97316', shape: 'owl' },
  { name: 'Whale', category: 'Animal', primary: '#2563EB', secondary: '#DBEAFE', accent: '#1D4ED8', shape: 'whale' },
  { name: 'Gorilla', category: 'Animal', primary: '#334155', secondary: '#64748B', accent: '#0F172A', shape: 'monkey' },
  { name: 'Koala', category: 'Animal', primary: '#64748B', secondary: '#E2E8F0', accent: '#1E293B', shape: 'koala' },
  { name: 'Sloth', category: 'Animal', primary: '#A16207', secondary: '#FEF3C7', accent: '#451A03', shape: 'sloth' },
  { name: 'Crocodile', category: 'Animal', primary: '#15803D', secondary: '#86EFAC', accent: '#FACC15', shape: 'crocodile' },
  { name: 'Jaguar', category: 'Animal', primary: '#F59E0B', secondary: '#FDE68A', accent: '#1E293B', shape: 'cheetah' },
  { name: 'Falcon', category: 'Animal', primary: '#475569', secondary: '#F8FAFC', accent: '#EAB308', shape: 'eagle' },
  { name: 'Zebra', category: 'Animal', primary: '#F8FAFC', secondary: '#0F172A', accent: '#64748B', shape: 'zebra' },
  { name: 'Flamingo', category: 'Animal', primary: '#F43F5E', secondary: '#FDA4AF', accent: '#1E293B', shape: 'flamingo' },
  { name: 'Otter', category: 'Animal', primary: '#92400E', secondary: '#FDE68A', accent: '#451A03', shape: 'bear' },
  { name: 'Peacock', category: 'Animal', primary: '#0284C7', secondary: '#10B981', accent: '#FACC15', shape: 'peacock' },

  // Objects & Nature (20)
  { name: 'Pizza', category: 'Object', primary: '#F59E0B', secondary: '#EF4444', accent: '#D97706', shape: 'pizza' },
  { name: 'Flower', category: 'Nature', primary: '#EC4899', secondary: '#FACC15', accent: '#F472B6', shape: 'flower' },
  { name: 'Guitar', category: 'Object', primary: '#D97706', secondary: '#78350F', accent: '#FDE68A', shape: 'guitar' },
  { name: 'Piano', category: 'Object', primary: '#1E293B', secondary: '#F8FAFC', accent: '#EF4444', shape: 'piano' },
  { name: 'Waterfall', category: 'Nature', primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#10B981', shape: 'waterfall' },
  { name: 'Mountain', category: 'Nature', primary: '#64748B', secondary: '#F8FAFC', accent: '#10B981', shape: 'mountain' },
  { name: 'Moon', category: 'Nature', primary: '#FACC15', secondary: '#FEF08A', accent: '#CA8A04', shape: 'moon' },
  { name: 'Sun', category: 'Nature', primary: '#F59E0B', secondary: '#FDE047', accent: '#EA580C', shape: 'sun' },
  { name: 'Star', category: 'Nature', primary: '#FACC15', secondary: '#FEF9C3', accent: '#EAB308', shape: 'star_shape' },
  { name: 'Cloud', category: 'Nature', primary: '#38BDF8', secondary: '#F8FAFC', accent: '#BAE6FD', shape: 'cloud' },
  { name: 'Lake', category: 'Nature', primary: '#0284C7', secondary: '#7DD3FC', accent: '#22C55E', shape: 'lake' },
  { name: 'Sea', category: 'Nature', primary: '#0369A1', secondary: '#38BDF8', accent: '#E0F2FE', shape: 'sea' },
  { name: 'Plate', category: 'Object', primary: '#E2E8F0', secondary: '#F8FAFC', accent: '#3B82F6', shape: 'plate' },
  { name: 'Sunglasses', category: 'Object', primary: '#1E293B', secondary: '#0EA5E9', accent: '#F43F5E', shape: 'sunglasses' },
  { name: 'Ice-cream', category: 'Object', primary: '#F472B6', secondary: '#FDE68A', accent: '#D97706', shape: 'icecream' },
  { name: 'Spoon', category: 'Object', primary: '#94A3B8', secondary: '#F8FAFC', accent: '#475569', shape: 'spoon' },
  { name: 'Cycle', category: 'Object', primary: '#EF4444', secondary: '#1E293B', accent: '#38BDF8', shape: 'cycle' },
  { name: 'Car', category: 'Object', primary: '#EF4444', secondary: '#38BDF8', accent: '#1E293B', shape: 'car' },
  { name: 'Pen', category: 'Object', primary: '#2563EB', secondary: '#FACC15', accent: '#1E293B', shape: 'pen' },
  { name: 'Bottle', category: 'Object', primary: '#06B6D4', secondary: '#CFFAFE', accent: '#0284C7', shape: 'bottle' }
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderSvgShape(item) {
  const { primary, secondary, accent, shape } = item;
  let inner = '';

  switch (shape) {
    case 'spoon':
      // True metallic dining spoon angled diagonally with bowl highlight and slender handle
      inner = `
        <g transform="rotate(-40 60 60)">
          <!-- Spoon Handle -->
          <path d="M56 58 L54 96 C54 100 66 100 66 96 L64 58 Z" fill="#64748B" stroke="#334155" stroke-width="2" />
          <path d="M58 60 L57 94 C57 96 61 96 61 94 L60 60 Z" fill="#E2E8F0" />
          <!-- Spoon Bowl -->
          <ellipse cx="60" cy="38" rx="16" ry="23" fill="#94A3B8" stroke="#334155" stroke-width="2.5" />
          <ellipse cx="60" cy="39" rx="12" ry="18" fill="#CBD5E1" />
          <!-- Specular Shine on Bowl -->
          <path d="M53 27 C50 33 50 43 54 49" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
        </g>
      `;
      break;
    case 'cycle':
      // True bicycle with spoked front/rear wheels, diamond frame, handlebars, and saddle
      inner = `
        <!-- Rear Wheel -->
        <circle cx="34" cy="72" r="16" fill="none" stroke="#1E293B" stroke-width="4.5" />
        <circle cx="34" cy="72" r="12" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3" />
        <!-- Front Wheel -->
        <circle cx="86" cy="72" r="16" fill="none" stroke="#1E293B" stroke-width="4.5" />
        <circle cx="86" cy="72" r="12" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4 3" />
        <!-- Bicycle Frame -->
        <path d="M34 72 L56 72 L74 48 L48 48 Z" fill="none" stroke="${primary}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Seat Post & Saddle -->
        <line x1="56" y1="72" x2="45" y2="40" stroke="${primary}" stroke-width="4" stroke-linecap="round" />
        <path d="M38 40 L52 40" stroke="#1E293B" stroke-width="5" stroke-linecap="round" />
        <!-- Front Fork & Handlebars -->
        <line x1="86" y1="72" x2="71" y2="36" stroke="${primary}" stroke-width="4" stroke-linecap="round" />
        <path d="M65 36 L78 36 C81 36 82 41 78 42" fill="none" stroke="#1E293B" stroke-width="4" stroke-linecap="round" />
        <!-- Crankset / Pedal Gear -->
        <circle cx="56" cy="72" r="5.5" fill="#FACC15" stroke="#1E293B" stroke-width="2" />
        <circle cx="34" cy="72" r="3" fill="#FACC15" />
        <circle cx="86" cy="72" r="3" fill="#FACC15" />
      `;
      break;
    case 'pen':
      // True fountain / ballpoint pen angled diagonally with gold nib, grip section, barrel, and pocket clip
      inner = `
        <g transform="rotate(38 60 60)">
          <!-- Pen Barrel -->
          <rect x="52" y="18" width="16" height="58" rx="4" fill="${primary}" stroke="#1E3A8A" stroke-width="2" />
          <!-- Top Finial -->
          <path d="M54 18 C54 12 66 12 66 18 Z" fill="#1E293B" />
          <!-- Gold Pocket Clip -->
          <path d="M68 22 L73 22 L73 48 L69 51" fill="none" stroke="#FACC15" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Gold Center Band -->
          <rect x="51" y="48" width="18" height="4" fill="#FACC15" />
          <!-- Grip Section -->
          <polygon points="53,76 67,76 64,88 56,88" fill="#1E293B" />
          <!-- Gold Fountain Nib -->
          <polygon points="56,88 64,88 60,104" fill="#FACC15" stroke="#B45309" stroke-width="1.5" />
          <line x1="60" y1="88" x2="60" y2="99" stroke="#78350F" stroke-width="1.5" />
          <circle cx="60" cy="93" r="1.5" fill="#78350F" />
          <!-- Barrel Highlight -->
          <line x1="56" y1="22" x2="56" y2="72" stroke="#93C5FD" stroke-width="2.5" stroke-linecap="round" />
        </g>
      `;
      break;
    case 'bottle':
      // True water bottle with cap, neck ring, and water level
      inner = `
        <rect x="50" y="16" width="20" height="9" rx="3" fill="#0284C7" />
        <path d="M52 25 L48 38 L72 38 L68 25 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="2" />
        <rect x="42" y="38" width="36" height="62" rx="10" fill="#CFFAFE" stroke="#0284C7" stroke-width="2.5" />
        <path d="M44 58 Q52 54 60 58 T76 58 L76 90 C76 95 72 98 67 98 L53 98 C48 98 44 95 44 90 Z" fill="#06B6D4" />
        <rect x="42" y="52" width="36" height="14" fill="#0284C7" opacity="0.85" />
        <line x1="48" y1="44" x2="48" y2="90" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8" />
      `;
      break;
    case 'plate':
      // True ceramic dining plate with concentric rim and subtle fork/knife gleam
      inner = `
        <circle cx="60" cy="60" r="38" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3.5" />
        <circle cx="60" cy="60" r="26" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2" />
        <path d="M44 46 A22 22 0 0 1 74 44" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="60" cy="60" r="33" fill="none" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="6 4" />
      `;
      break;
    case 'car':
      inner = `
        <path d="M32 56 L44 36 L78 36 L90 56 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2" />
        <polygon points="46,40 60,40 60,54 37,54" fill="#BAE6FD" />
        <polygon points="64,40 76,40 84,54 64,54" fill="#BAE6FD" />
        <rect x="20" y="54" width="80" height="22" rx="9" fill="#EF4444" stroke="#B91C1C" stroke-width="2" />
        <rect x="88" y="58" width="8" height="6" rx="2" fill="#FDE047" />
        <circle cx="38" cy="76" r="11" fill="#1E293B" stroke="#CBD5E1" stroke-width="3" />
        <circle cx="82" cy="76" r="11" fill="#1E293B" stroke="#CBD5E1" stroke-width="3" />
      `;
      break;
    case 'dog_floppy':
      inner = `
        <ellipse cx="26" cy="54" rx="14" ry="22" transform="rotate(20 26 54)" fill="${accent}" />
        <ellipse cx="94" cy="54" rx="14" ry="22" transform="rotate(-20 94 54)" fill="${accent}" />
        <circle cx="60" cy="62" r="32" fill="${primary}" />
        <ellipse cx="60" cy="72" rx="18" ry="14" fill="${secondary}" />
        <circle cx="47" cy="56" r="4.5" fill="#1E293B" />
        <circle cx="73" cy="56" r="4.5" fill="#1E293B" />
        <circle cx="48.5" cy="54.5" r="1.5" fill="#FFFFFF" />
        <circle cx="74.5" cy="54.5" r="1.5" fill="#FFFFFF" />
        <ellipse cx="60" cy="67" rx="6" ry="4.5" fill="#1E293B" />
        <path d="M56 77 Q60 85 64 77" fill="#F43F5E" stroke="#1E293B" stroke-width="2" />
      `;
      break;
    case 'feline':
      inner = `
        <polygon points="28,48 34,20 54,36" fill="${primary}" stroke="${accent}" stroke-width="2" />
        <polygon points="92,48 86,20 66,36" fill="${primary}" stroke="${accent}" stroke-width="2" />
        <polygon points="33,44 37,26 50,36" fill="${secondary}" />
        <polygon points="87,44 83,26 70,36" fill="${secondary}" />
        <circle cx="60" cy="64" r="31" fill="${primary}" />
        <ellipse cx="60" cy="73" rx="16" ry="12" fill="${secondary}" />
        <circle cx="47" cy="58" r="4.5" fill="#1E293B" />
        <circle cx="73" cy="58" r="4.5" fill="#1E293B" />
        <polygon points="56,67 64,67 60,72" fill="#F43F5E" />
        <path d="M25 65 L42 68 M25 73 L42 72 M95 65 L78 68 M95 73 L78 72" stroke="#1E293B" stroke-width="2" stroke-linecap="round" />
      `;
      break;
    case 'tiger':
      inner = `
        <circle cx="34" cy="36" r="10" fill="${primary}" />
        <circle cx="86" cy="36" r="10" fill="${primary}" />
        <circle cx="60" cy="64" r="31" fill="${primary}" />
        <path d="M32 54 L44 58 M30 64 L42 66 M88 54 L76 58 M90 64 L78 66 M60 33 L60 45" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" />
        <ellipse cx="60" cy="74" rx="16" ry="12" fill="${secondary}" />
        <circle cx="47" cy="58" r="4" fill="#1E293B" />
        <circle cx="73" cy="58" r="4" fill="#1E293B" />
        <polygon points="56,68 64,68 60,73" fill="#F43F5E" />
      `;
      break;
    case 'cheetah':
      inner = `
        <circle cx="35" cy="36" r="10" fill="${primary}" />
        <circle cx="85" cy="36" r="10" fill="${primary}" />
        <circle cx="60" cy="64" r="30" fill="${primary}" />
        <circle cx="42" cy="46" r="2.5" fill="#1E293B" />
        <circle cx="78" cy="46" r="2.5" fill="#1E293B" />
        <circle cx="38" cy="68" r="2.5" fill="#1E293B" />
        <circle cx="82" cy="68" r="2.5" fill="#1E293B" />
        <circle cx="60" cy="42" r="2.5" fill="#1E293B" />
        <ellipse cx="60" cy="74" rx="15" ry="11" fill="${secondary}" />
        <circle cx="48" cy="57" r="4" fill="#1E293B" />
        <circle cx="72" cy="57" r="4" fill="#1E293B" />
      `;
      break;
    case 'canine_pointy':
      inner = `
        <polygon points="30,50 32,16 54,36" fill="${primary}" />
        <polygon points="90,50 88,16 66,36" fill="${primary}" />
        <circle cx="60" cy="64" r="30" fill="${primary}" />
        <path d="M34 66 Q60 95 86 66 Q72 58 60 72 Q48 58 34 66 Z" fill="${secondary}" />
        <circle cx="47" cy="56" r="4" fill="${accent}" />
        <circle cx="73" cy="56" r="4" fill="${accent}" />
        <circle cx="60" cy="74" r="5" fill="#0F172A" />
      `;
      break;
    case 'lion':
      inner = `
        <circle cx="60" cy="62" r="40" fill="${secondary}" stroke="${accent}" stroke-width="3" stroke-dasharray="10 4" />
        <circle cx="38" cy="38" r="9" fill="${primary}" />
        <circle cx="82" cy="38" r="9" fill="${primary}" />
        <circle cx="60" cy="62" r="28" fill="${primary}" />
        <ellipse cx="60" cy="71" rx="14" ry="11" fill="${accent}" />
        <circle cx="49" cy="56" r="4" fill="#1E293B" />
        <circle cx="71" cy="56" r="4" fill="#1E293B" />
        <polygon points="55,66 65,66 60,72" fill="#78350F" />
      `;
      break;
    case 'panda':
      inner = `
        <circle cx="34" cy="34" r="12" fill="${secondary}" />
        <circle cx="86" cy="34" r="12" fill="${secondary}" />
        <circle cx="60" cy="64" r="32" fill="${primary}" stroke="#CBD5E1" stroke-width="2" />
        <ellipse cx="46" cy="58" rx="9" ry="11" transform="rotate(-15 46 58)" fill="${secondary}" />
        <ellipse cx="74" cy="58" rx="9" ry="11" transform="rotate(15 74 58)" fill="${secondary}" />
        <circle cx="47" cy="57" r="3" fill="#FFFFFF" />
        <circle cx="73" cy="57" r="3" fill="#FFFFFF" />
        <ellipse cx="60" cy="70" rx="6" ry="4" fill="${secondary}" />
      `;
      break;
    case 'bear':
    case 'koala':
    case 'monkey':
    case 'sloth':
      inner = `
        <circle cx="32" cy="40" r="13" fill="${primary}" />
        <circle cx="88" cy="40" r="13" fill="${primary}" />
        <circle cx="32" cy="40" r="7" fill="${secondary}" />
        <circle cx="88" cy="40" r="7" fill="${secondary}" />
        <circle cx="60" cy="64" r="31" fill="${primary}" />
        <ellipse cx="60" cy="71" rx="16" ry="13" fill="${secondary}" />
        <circle cx="48" cy="56" r="4" fill="#1E293B" />
        <circle cx="72" cy="56" r="4" fill="#1E293B" />
        <ellipse cx="60" cy="67" rx="6" ry="4.5" fill="${accent}" />
      `;
      break;
    case 'rabbit':
    case 'kangaroo':
      inner = `
        <ellipse cx="46" cy="30" rx="8" ry="20" fill="${primary}" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="74" cy="30" rx="8" ry="20" fill="${primary}" stroke="#CBD5E1" stroke-width="1.5" />
        <ellipse cx="46" cy="31" rx="4" ry="14" fill="${secondary}" />
        <ellipse cx="74" cy="31" rx="4" ry="14" fill="${secondary}" />
        <circle cx="60" cy="68" r="27" fill="${primary}" stroke="#CBD5E1" stroke-width="1.5" />
        <circle cx="49" cy="62" r="4" fill="${accent}" />
        <circle cx="71" cy="62" r="4" fill="${accent}" />
        <ellipse cx="60" cy="70" rx="4.5" ry="3.5" fill="${secondary}" />
      `;
      break;
    case 'elephant':
      inner = `
        <ellipse cx="26" cy="60" rx="16" ry="22" fill="${primary}" />
        <ellipse cx="94" cy="60" rx="16" ry="22" fill="${primary}" />
        <ellipse cx="26" cy="60" rx="10" ry="15" fill="${accent}" />
        <ellipse cx="94" cy="60" rx="10" ry="15" fill="${accent}" />
        <circle cx="60" cy="58" r="28" fill="${secondary}" />
        <path d="M53 62 Q53 92 66 90 Q70 89 68 84" fill="none" stroke="${primary}" stroke-width="11" stroke-linecap="round" />
        <circle cx="47" cy="52" r="3.8" fill="#1E293B" />
        <circle cx="73" cy="52" r="3.8" fill="#1E293B" />
      `;
      break;
    case 'giraffe':
    case 'horse':
    case 'zebra':
      inner = `
        <line x1="46" y1="22" x2="50" y2="38" stroke="${secondary}" stroke-width="4" />
        <line x1="74" y1="22" x2="70" y2="38" stroke="${secondary}" stroke-width="4" />
        <circle cx="45" cy="20" r="5" fill="${secondary}" />
        <circle cx="75" cy="20" r="5" fill="${secondary}" />
        <ellipse cx="60" cy="62" rx="24" ry="30" fill="${primary}" stroke="#64748B" stroke-width="1.5" />
        <ellipse cx="60" cy="76" rx="18" ry="13" fill="${secondary}" />
        <circle cx="49" cy="54" r="4" fill="#1E293B" />
        <circle cx="71" cy="54" r="4" fill="#1E293B" />
        <circle cx="54" cy="74" r="2.5" fill="#FFFFFF" />
        <circle cx="66" cy="74" r="2.5" fill="#FFFFFF" />
      `;
      break;
    case 'eagle':
    case 'penguin':
    case 'owl':
    case 'flamingo':
    case 'peacock':
      inner = `
        <circle cx="60" cy="62" r="32" fill="${primary}" />
        <ellipse cx="60" cy="68" rx="20" ry="19" fill="${secondary}" />
        <circle cx="48" cy="52" r="8" fill="#FFFFFF" />
        <circle cx="72" cy="52" r="8" fill="#FFFFFF" />
        <circle cx="48" cy="52" r="4" fill="#1E293B" />
        <circle cx="72" cy="52" r="4" fill="#1E293B" />
        <polygon points="53,60 67,60 60,72" fill="${accent}" />
      `;
      break;
    case 'dolphin':
    case 'whale':
    case 'crocodile':
      inner = `
        <path d="M22 68 Q45 28 84 48 Q98 56 96 72 Q70 68 50 76 Q32 82 22 68 Z" fill="${primary}" />
        <path d="M32 69 Q55 56 86 66 Q65 76 32 69 Z" fill="${secondary}" />
        <circle cx="76" cy="53" r="4" fill="#1E293B" />
        <circle cx="77" cy="52" r="1.5" fill="#FFFFFF" />
        <path d="M52 38 L42 22 L64 36 Z" fill="${accent}" />
      `;
      break;
    case 'crescent':
      inner = `
        <path d="M32 78 Q55 86 82 34 Q92 56 72 84 Q48 102 24 84 Z" fill="${primary}" stroke="${accent}" stroke-width="2.5" />
        <path d="M38 76 Q58 82 78 42" fill="none" stroke="${secondary}" stroke-width="5" stroke-linecap="round" />
      `;
      break;
    case 'berry_heart':
      inner = `
        <path d="M60 92 C32 76 26 44 44 36 C54 32 60 42 60 42 C60 42 66 32 76 36 C94 44 88 76 60 92 Z" fill="${primary}" />
        <path d="M46 34 L60 22 L74 34 L60 39 Z" fill="${accent}" />
        <circle cx="48" cy="54" r="2" fill="${secondary}" />
        <circle cx="60" cy="60" r="2" fill="${secondary}" />
        <circle cx="72" cy="54" r="2" fill="${secondary}" />
        <circle cx="53" cy="70" r="2" fill="${secondary}" />
        <circle cx="67" cy="70" r="2" fill="${secondary}" />
        <circle cx="60" cy="80" r="2" fill="${secondary}" />
      `;
      break;
    case 'pineapple':
      inner = `
        <path d="M46 36 L36 16 L54 28 L60 12 L66 28 L84 16 L74 36 Z" fill="${accent}" />
        <ellipse cx="60" cy="66" rx="24" ry="28" fill="${primary}" stroke="${secondary}" stroke-width="3" />
        <path d="M42 52 L78 80 M42 80 L78 52 M46 42 L74 90 M74 42 L46 90" stroke="${secondary}" stroke-width="2.5" />
      `;
      break;
    case 'melon_slice':
      inner = `
        <path d="M22 48 A38 38 0 0 0 98 48 Z" fill="${secondary}" />
        <path d="M28 48 A32 32 0 0 0 92 48 Z" fill="${primary}" />
        <circle cx="48" cy="60" r="2.5" fill="${accent}" />
        <circle cx="60" cy="66" r="2.5" fill="${accent}" />
        <circle cx="72" cy="60" r="2.5" fill="${accent}" />
      `;
      break;
    case 'cluster':
    case 'cluster_berry':
      inner = `
        <path d="M52 28 Q60 18 68 28" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" />
        <circle cx="46" cy="48" r="11" fill="${primary}" />
        <circle cx="60" cy="48" r="11" fill="${secondary}" />
        <circle cx="74" cy="48" r="11" fill="${primary}" />
        <circle cx="52" cy="64" r="11" fill="${secondary}" />
        <circle cx="68" cy="64" r="11" fill="${primary}" />
        <circle cx="60" cy="80" r="11" fill="${primary}" />
      `;
      break;
    case 'twin_cherry':
    case 'double_berry':
      inner = `
        <path d="M44 66 Q52 32 64 24 Q68 42 76 66" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="42" cy="70" r="16" fill="${primary}" />
        <circle cx="76" cy="70" r="16" fill="${primary}" />
        <circle cx="37" cy="65" r="4" fill="${secondary}" />
        <circle cx="71" cy="65" r="4" fill="${secondary}" />
      `;
      break;
    case 'pear':
      inner = `
        <!-- Whole Pear Silhouette with Stem and Leaf -->
        <path d="M60 24 Q63 14 68 14" fill="none" stroke="#78350F" stroke-width="4" stroke-linecap="round" />
        <path d="M61 20 Q76 14 80 24 Q69 30 61 20 Z" fill="#16A34A" />
        <path d="M60 24 C49 24 46 38 39 54 C29 74 39 94 60 94 C81 94 91 74 81 54 C74 38 71 24 60 24 Z" fill="${primary}" stroke="${accent}" stroke-width="2" />
        <path d="M46 54 C42 66 45 78 52 83" fill="none" stroke="${secondary}" stroke-width="5" stroke-linecap="round" opacity="0.75" />
        <circle cx="49" cy="42" r="3" fill="${secondary}" opacity="0.75" />
      `;
      break;
    case 'avocado':
    case 'papaya':
      inner = `
        <path d="M60 26 C48 26 44 42 38 56 C30 74 40 92 60 92 C80 92 90 74 82 56 C76 42 72 26 60 26 Z" fill="${primary}" />
        <ellipse cx="60" cy="65" rx="16" ry="19" fill="${secondary}" />
        <circle cx="60" cy="70" r="9" fill="${accent}" />
      `;
      break;
    case 'kiwi_half':
      inner = `
        <!-- Fuzzy brown outer skin -->
        <circle cx="60" cy="62" r="34" fill="#78350F" stroke="#451A03" stroke-width="2.5" />
        <!-- Vivid green kiwi flesh -->
        <circle cx="60" cy="62" r="28" fill="${primary}" />
        <!-- Radial flesh rays -->
        <path d="M60 36 L60 88 M34 62 L86 62 M42 44 L78 80 M78 44 L42 80" stroke="${secondary}" stroke-width="2" opacity="0.65" />
        <!-- Creamy white center core -->
        <circle cx="60" cy="62" r="10" fill="#ECFCCB" />
        <!-- Ring of black kiwi seeds -->
        <circle cx="60" cy="47" r="1.8" fill="#0F172A" />
        <circle cx="71" cy="51" r="1.8" fill="#0F172A" />
        <circle cx="75" cy="62" r="1.8" fill="#0F172A" />
        <circle cx="71" cy="73" r="1.8" fill="#0F172A" />
        <circle cx="60" cy="77" r="1.8" fill="#0F172A" />
        <circle cx="49" cy="73" r="1.8" fill="#0F172A" />
        <circle cx="45" cy="62" r="1.8" fill="#0F172A" />
        <circle cx="49" cy="51" r="1.8" fill="#0F172A" />
      `;
      break;
    case 'citrus':
      inner = `
        <circle cx="60" cy="62" r="33" fill="${primary}" />
        <circle cx="60" cy="62" r="28" fill="${secondary}" />
        <circle cx="60" cy="62" r="24" fill="${primary}" />
        <path d="M60 36 L60 88 M34 62 L86 62 M41 43 L79 81 M79 43 L41 81" stroke="${secondary}" stroke-width="3" />
        <circle cx="60" cy="62" r="4" fill="${secondary}" />
      `;
      break;
    case 'coconut':
      inner = `
        <circle cx="60" cy="62" r="33" fill="#78350F" stroke="#451A03" stroke-width="3" />
        <circle cx="60" cy="62" r="24" fill="#F8FAFC" />
        <circle cx="60" cy="62" r="14" fill="#E0F2FE" />
      `;
      break;
    case 'lemon':
      inner = `
        <path d="M24 62 Q40 32 60 32 Q80 32 96 62 Q80 92 60 92 Q40 92 24 62 Z" fill="${primary}" stroke="${accent}" stroke-width="2" />
        <ellipse cx="52" cy="52" rx="14" ry="7" fill="${secondary}" opacity="0.7" />
      `;
      break;
    case 'pizza':
      inner = `
        <polygon points="60,20 24,88 96,88" fill="${accent}" />
        <polygon points="60,24 30,82 90,82" fill="${primary}" />
        <circle cx="56" cy="52" r="6" fill="${secondary}" />
        <circle cx="46" cy="70" r="6" fill="${secondary}" />
        <circle cx="70" cy="68" r="6" fill="${secondary}" />
      `;
      break;
    case 'flower':
      inner = `
        <circle cx="60" cy="34" r="14" fill="${primary}" />
        <circle cx="84" cy="52" r="14" fill="${accent}" />
        <circle cx="74" cy="80" r="14" fill="${primary}" />
        <circle cx="46" cy="80" r="14" fill="${accent}" />
        <circle cx="36" cy="52" r="14" fill="${primary}" />
        <circle cx="60" cy="58" r="14" fill="${secondary}" />
      `;
      break;
    case 'guitar':
      inner = `
        <line x1="38" y1="82" x2="86" y2="24" stroke="${secondary}" stroke-width="7" stroke-linecap="round" />
        <circle cx="44" cy="74" r="18" fill="${primary}" />
        <circle cx="56" cy="60" r="13" fill="${primary}" />
        <circle cx="50" cy="67" r="6" fill="${accent}" />
      `;
      break;
    case 'piano':
      inner = `
        <rect x="24" y="34" width="72" height="52" rx="8" fill="${primary}" />
        <rect x="30" y="52" width="14" height="30" rx="2" fill="${secondary}" />
        <rect x="46" y="52" width="14" height="30" rx="2" fill="${secondary}" />
        <rect x="62" y="52" width="14" height="30" rx="2" fill="${secondary}" />
        <rect x="78" y="52" width="12" height="30" rx="2" fill="${secondary}" />
        <rect x="40" y="52" width="8" height="18" fill="${primary}" />
        <rect x="56" y="52" width="8" height="18" fill="${primary}" />
        <rect x="72" y="52" width="8" height="18" fill="${primary}" />
      `;
      break;
    case 'waterfall':
      inner = `
        <rect x="24" y="30" width="72" height="60" rx="10" fill="${accent}" />
        <path d="M44 30 L40 90 L80 90 L76 30 Z" fill="${primary}" />
        <path d="M52 32 L50 88 M60 32 L60 88 M68 32 L70 88" stroke="${secondary}" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="60" cy="88" rx="26" ry="6" fill="${secondary}" />
      `;
      break;
    case 'mountain':
      inner = `
        <polygon points="18,88 50,30 82,88" fill="${primary}" />
        <polygon points="46,88 74,40 102,88" fill="${accent}" />
        <polygon points="50,30 39,50 50,46 61,50" fill="${secondary}" />
      `;
      break;
    case 'sun':
      inner = `
        <circle cx="60" cy="60" r="24" fill="${secondary}" stroke="${primary}" stroke-width="4" />
        <path d="M60 20 L60 28 M60 92 L60 100 M20 60 L28 60 M92 60 L100 60 M32 32 L38 38 M82 82 L88 88 M88 32 L82 38 M38 82 L32 88" stroke="${primary}" stroke-width="4.5" stroke-linecap="round" />
      `;
      break;
    case 'star_shape':
      inner = `
        <polygon points="60,16 71,43 100,45 77,64 85,92 60,76 35,92 43,64 20,45 49,43" fill="${primary}" stroke="${accent}" stroke-width="2.5" />
        <circle cx="60" cy="58" r="12" fill="${secondary}" opacity="0.6" />
      `;
      break;
    case 'moon':
      inner = `
        <path d="M72 24 A34 34 0 1 0 92 78 A26 26 0 1 1 72 24 Z" fill="${primary}" stroke="${accent}" stroke-width="2" />
      `;
      break;
    case 'cloud':
      inner = `
        <circle cx="44" cy="64" r="18" fill="${primary}" />
        <circle cx="62" cy="52" r="22" fill="${secondary}" />
        <circle cx="80" cy="66" r="16" fill="${primary}" />
        <rect x="38" y="64" width="46" height="18" rx="8" fill="${secondary}" />
      `;
      break;
    case 'lake':
    case 'sea':
      inner = `
        <ellipse cx="60" cy="66" rx="36" ry="22" fill="${primary}" />
        <path d="M34 62 Q47 55 60 62 T86 62" fill="none" stroke="${secondary}" stroke-width="4" stroke-linecap="round" />
        <path d="M38 73 Q50 66 62 73 T82 73" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" />
      `;
      break;
    case 'sunglasses':
      inner = `
        <rect x="20" y="48" width="34" height="24" rx="8" fill="${primary}" stroke="${accent}" stroke-width="3" />
        <rect x="66" y="48" width="34" height="24" rx="8" fill="${primary}" stroke="${accent}" stroke-width="3" />
        <line x1="54" y1="54" x2="66" y2="54" stroke="${accent}" stroke-width="4" />
        <line x1="26" y1="54" x2="38" y2="66" stroke="${secondary}" stroke-width="3" stroke-linecap="round" />
        <line x1="72" y1="54" x2="84" y2="66" stroke="${secondary}" stroke-width="3" stroke-linecap="round" />
      `;
      break;
    case 'icecream':
      inner = `
        <polygon points="44,62 76,62 60,98" fill="${accent}" />
        <circle cx="60" cy="48" r="20" fill="${primary}" />
        <circle cx="52" cy="42" r="6" fill="${secondary}" />
        <circle cx="60" cy="26" r="5" fill="#EF4444" />
      `;
      break;
    default:
      inner = `
        <path d="M60 28 Q72 16 78 26 Q68 34 60 28 Z" fill="${accent}" />
        <circle cx="60" cy="64" r="30" fill="${primary}" />
        <ellipse cx="48" cy="52" rx="8" ry="12" transform="rotate(-25 48 52)" fill="${secondary}" opacity="0.7" />
      `;
      break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#F1F5F9" stop-opacity="0.88" />
    </radialGradient>
    <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.25" />
    </filter>
  </defs>
  <circle cx="60" cy="60" r="54" fill="url(#bgGlow)" stroke="#FFFFFF" stroke-width="4" filter="url(#dropShadow)" />
  <g filter="url(#dropShadow)">
    ${inner}
  </g>
</svg>`;
}

const publicImagesDir = path.resolve('public/images');
const rootImagesDir = path.resolve('images');

fs.mkdirSync(publicImagesDir, { recursive: true });
fs.mkdirSync(rootImagesDir, { recursive: true });

const manifest = [];

for (let i = 0; i < DATASET_ITEMS.length; i++) {
  const item = DATASET_ITEMS[i];
  const slug = slugify(item.name);
  const svgContent = renderSvgShape(item);
  const fileName = `${slug}.svg`;

  fs.writeFileSync(path.join(publicImagesDir, fileName), svgContent, 'utf8');
  fs.writeFileSync(path.join(rootImagesDir, fileName), svgContent, 'utf8');

  manifest.push({
    id: slug,
    index: i + 1,
    name: item.name,
    category: item.category,
    imagePath: `/images/${fileName}`,
    primaryColor: item.primary,
    secondaryColor: item.secondary,
    accentColor: item.accent
  });
}

fs.writeFileSync(path.join(publicImagesDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(path.join(rootImagesDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Updated ${manifest.length} dataset images in /public/images and /images`);
