import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls } from "@react-three/drei"
import { Leva, useControls } from "leva"

import Experience from "./Experience"
import { parameterEnabled } from "./common/Utils"
import { CAMERA_DEFAULTS, KEYBOARD, LEVA_SORT_ORDER, TONE_MAPPING_OPTIONS } from "./common/Constants"

const debug_enabled = parameterEnabled('DEBUG') || parameterEnabled('debug')

const App = () => {

  // TONE MAPPING WITH REACT THREE FIBER
  // https://discourse.threejs.org/t/tone-mapping-change-tonemapping-type/48266/4
  const controls_gl = useControls(
    'tone mapping',

    {
      tone_mapping: {
        label: 'tone',
        value: THREE.ReinhardToneMapping,
        options: TONE_MAPPING_OPTIONS,
      },

      tone_exposure: {
        label: 'exposure',
        value: 1.0,
        min: 0,
        max: 5,
        step: 0.1,
      },
    },

    { collapsed: true, order: LEVA_SORT_ORDER.TONE_MAPPING }
  )

  return <>
    <Leva
      hidden={!debug_enabled}
      collapsed

      titleBar={{
        drag: false,
        title: 'DEBUG PANEL',
        filter: false,
      }}
    />

    <KeyboardControls
      map={[
        { name: KEYBOARD.NORTH, keys: ['KeyW', 'ArrowUp'] },
        { name: KEYBOARD.SOUTH, keys: ['KeyS', 'ArrowDown'] },
        { name: KEYBOARD.EAST, keys: ['KeyD', 'ArrowRight'] },
        { name: KEYBOARD.WEST, keys: ['KeyA', 'ArrowLeft'] },
        { name: KEYBOARD.ROLL_DICE, keys: ['Space'] }
      ]}
    >
      <Canvas
        gl={{
          toneMapping: controls_gl.tone_mapping,
          toneMappingExposure: controls_gl.tone_exposure,
          shadowMapType: THREE.BasicShadowMap
        }}

        shadows

        camera={{
          fov: CAMERA_DEFAULTS.fov,
          near: CAMERA_DEFAULTS.near,
          far: CAMERA_DEFAULTS.far,
          position: CAMERA_DEFAULTS.position
        }}
      >
        <Experience />
      </Canvas>
    </KeyboardControls>
  </>
}

export default App