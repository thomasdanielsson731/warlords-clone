// Songs of Conquest-inspired terrain color palettes
// Warm, painterly, high-contrast for readability

export const PALETTE = {
  grass: {
    base: ['#5a8a3a', '#4e7a35', '#68944a', '#3d6e2a', '#72a050'],
    accent: ['#8ab840', '#7aaa35', '#96c255', '#a8c868'],
    dirt: ['#8a7a55', '#7a6a48', '#9a8a60'],
    flowers: ['#d4a050', '#c87830', '#ddb855', '#e8c070', '#bb5533'],
  },
  forest: {
    ground: ['#3a5e2a', '#2e4f22', '#4a6b35', '#345828'],
    canopy: ['#1a5c1a', '#226622', '#1a4e1a', '#2d7a2d', '#185018'],
    autumn: ['#c87830', '#d4943a', '#bb5533', '#e8a840', '#aa4422'],
    trunk: ['#5c3d2e', '#4a3020', '#6b4a35', '#3a2518'],
  },
  mountain: {
    rock: ['#6b5e50', '#7a6b5a', '#5e5045', '#8a7a6a', '#544838'],
    cliff: ['#4a4038', '#5a5040', '#3a3530'],
    snow: ['#e8e0d5', '#f0ebe0', '#d8d0c5'],
    dirt: ['#6a5a48', '#7a6a55'],
  },
  water: {
    deep: ['#1a4a6a', '#153d5a', '#1e5575'],
    surface: ['#2a6a8a', '#2580a0', '#3388aa'],
    shore: ['#3a8aaa', '#45a0bb', '#55b0cc'],
    foam: ['#88ccdd', '#99ddee', '#aaeeff'],
  },
} as const

// Terrain height values for 3D depth
export const TERRAIN_HEIGHT = {
  water: 0.02,
  grass: 0.08,
  forest: 0.08,
  mountain: 0.18,
} as const

// Detail density per terrain type
export const DETAIL_DENSITY = {
  grass: { patches: 5, tufts: 6, rocks: 0.2, flowers: 0.4 },
  forest: { trees: 4, bushes: 3, groundcover: 4 },
  mountain: { peaks: 2, boulders: 4, scree: 3 },
} as const
