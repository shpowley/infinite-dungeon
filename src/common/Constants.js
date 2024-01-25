import * as THREE from 'three'

const LEVA_SORT_ORDER = {
  TONE_MAPPING: 0,
  CAMERA: 1,
  LIGHTING: 2,
  PHYSICS: 3,
  DUNGEON: 4,
  DICE: 5,
  SIGN: 6,
  WARRIOR: 7
}

const TONE_MAPPING_OPTIONS = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
}

const CAMERA_DEFAULTS = {
  fov: 45,
  near: 0.5,
  far: 60,
  position: [0, 10, 16.5],
}

// REACT-SPRING RELATED PROPS
const ANIMATION_DEFAULTS = {
  animate: false, // trigger animation
  visible: false  // initial visibility state
}

// KEYBOARD INPUTS
const KEYBOARD = {
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST',
  ROLL_DICE: 'ROLL_DICE'
}

const ITEM_KEYS = {
  HEALTH_POTION: 0,
  TREASURE_CHEST: 1,
  KEY: 2
}

const DICE_OWNER = {
  PLAYER: 0,
  ENEMY: 1
}

const GAME_PHASE = {
  START: 0,
  GAME_OVER: 1,
  STANDBY: 2,
  MOVEMENT: 3,
  COMBAT: 4
}

const FILE_FONT_BEBAS_NEUE = './fonts/bebas-neue-v9-latin-regular.woff'

export {
  TONE_MAPPING_OPTIONS,
  CAMERA_DEFAULTS,
  ANIMATION_DEFAULTS,
  LEVA_SORT_ORDER,
  KEYBOARD,
  ITEM_KEYS,
  DICE_OWNER,
  GAME_PHASE,
  FILE_FONT_BEBAS_NEUE
}