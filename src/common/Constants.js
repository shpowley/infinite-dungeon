import * as THREE from 'three'

const TONE_MAPPING_OPTIONS = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
}

const CAMERA_DEFAULTS = {
  fov: 45,
  near: 0.1,
  far: 200,
  position: [0, 10, 16],
}

export { TONE_MAPPING_OPTIONS, CAMERA_DEFAULTS }