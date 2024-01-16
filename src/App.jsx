import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"

import Experience from "./Experience"
import { parameterEnabled } from "./common/Utils"
import { CAMERA_DEFAULTS, TONE_MAPPING_OPTIONS } from "./common/Constants"
import { generateLevel, getFloorData } from "./common/Level"
import { MONSTERS } from "./common/Monsters"

const debug_enabled = parameterEnabled('DEBUG') || parameterEnabled('debug')


let level_info = null


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
        value: 1.5,
        min: 0,
        max: 5,
        step: 0.1,
      },
    },

    { collapsed: true }
  )

  // TESTING LEVEL GENERATION
  if (!level_info) {

    // DEBUG ROOM
    const exit_room_debug = {
      index: 7,
      level_door: 'E'
    }

    let
      room_count = 0,
      min_room_count = 10,
      attempts = 1,
      max_attempts = 20

    while (room_count <= min_room_count) {
      // level = generateLevel(exit_room_debug)
      level_info = generateLevel(1)
      room_count = level_info.level.filter(block => block.is_room).length

      if (room_count <= min_room_count && attempts > max_attempts) {
        console.warn(`TOO FEW ROOMS - ATTEMPT # ${attempts++}`)

        break
      }
    }

    console.log(level_info)

    const floor_data = getFloorData(level_info.floor_number)
    console.log(floor_data)

    // 1) pick 3-5 random rooms (not including the start and end rooms)
    // 2) pick a random monster from the level's monster list and place it in the room
    // 3) pick a random item from the level's item list and place it in the room with the monster
    level_info.level
      .filter(block => block.is_room && !block.start_room && !block.end_room)
      .sort(() => Math.random() - 0.5) // shuffle
      .slice(0, Math.floor(Math.random() * 3) + 3)
      .forEach(room => {
        const available_floor_monster_count = floor_data.monsters.length

        if (available_floor_monster_count > 0) {
          room.monster = available_floor_monster_count === 1
            ? floor_data.monsters[0]
            : floor_data.monsters[Math.floor(Math.random() * floor_data.monsters.length)]

          if (floor_data.items.length > 0) {
            room.item = floor_data.items.pop()
          }
        }
      })
  }





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
  </>
}

export default App