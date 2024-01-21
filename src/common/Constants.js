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

export { TONE_MAPPING_OPTIONS, CAMERA_DEFAULTS, ANIMATION_DEFAULTS, LEVA_SORT_ORDER }