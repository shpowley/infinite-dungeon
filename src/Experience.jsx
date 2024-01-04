import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { folder, useControls } from "leva"

import { CAMERA_DEFAULTS } from './common/Constants'
import { parameterEnabled, randomFloat } from './common/Utils'
import D20, { FACE_ID_LOOKUP } from './components/D20'
import Wall, { ROOM_COLLIDER } from './components/Wall'
import Ceiling from './components/Ceiling'
import Floor from './components/Floor'

// DYNAMIC IMPORT FOR R3F PERFORMANCE MONITOR
let Perf = null

if (parameterEnabled('PERF') || parameterEnabled('perf')) {
  Perf = (await import('r3f-perf')).Perf
}

const Experience = () => {
  const
    ref_controls = useRef(),
    ref_light = useRef(),
    ref_camera = useRef(),
    ref_d20_body = useRef(),
    ref_d20_mesh = useRef()

  const [dice_sound] = useState({
    is_playing: false,
    media: new Audio('./sounds/hit.mp3'),
  })

  /**
   * DEBUG CONTROLS
   */

  // CAMERA DEBUG CONTROLS
  const camera = useThree(state => state.camera)

  useControls(
    'camera',

    {
      fov: {
        value: CAMERA_DEFAULTS.fov,
        min: 0,
        max: 180,
        step: 1,

        onChange: value => {
          camera.fov = value
          camera.updateProjectionMatrix()
        }
      },

      near: {
        value: CAMERA_DEFAULTS.near,
        min: 0,
        max: 10,
        step: 0.1,

        onChange: value => {
          camera.near = value
          camera.updateProjectionMatrix()
        }
      },

      far: {
        value: CAMERA_DEFAULTS.far,
        min: 0,
        max: 1000,
        step: 1,

        onChange: value => {
          camera.far = value
          camera.updateProjectionMatrix()
        }
      },

      position: {
        value: CAMERA_DEFAULTS.position,
        step: 0.1,

        onChange: value => {
          camera.position.set(...value)
          ref_controls.current.update()
        }
      },
    },

    { collapsed: true }
  )

  // LIGHTING DEBUG
  const controls_lighting = useControls(
    'lighting',

    {
      'ambient light': folder(
        {
          ambient_intensity: {
            label: 'intensity',
            value: 0.5,
            min: 0,
            max: 10,
            step: 0.1,
          },

          ambient_color: {
            label: 'color',
            value: '#ffffff',
          },
        },

        { collapsed: true }
      ),

      // subfolder
      'directional light': folder(
        {
          directional_intensity: {
            label: 'intensity',
            value: 1.5,
            min: 0,
            max: 10,
            step: 0.1,
          },

          directional_position: {
            label: 'position',
            value: [5, 12, 5],
            step: 0.1,
          },

          directional_color: {
            label: 'color',
            value: '#ffffff',
          },
        },

        { collapsed: true }
      ),

      // subfolder
      'shadow': folder(
        {
          shadow_enabled: {
            label: 'enabled',
            value: true,
          },

          shadow_helper: {
            label: 'helper',
            value: false,
          },

          shadow_near: {
            label: 'near',
            value: 1.5,
            min: 0,
            max: 10,
            step: 0.01,

            onChange: value => {
              ref_camera.current.near = value
              ref_camera.current.updateProjectionMatrix()
            }
          },

          shadow_far: {
            label: 'far',
            value: 19,
            min: 10,
            max: 200,
            step: 1,

            onChange: value => {
              ref_camera.current.far = value
              ref_camera.current.updateProjectionMatrix()
            }
          },

          shadow_left: {
            label: 'left',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_camera.current.left = -value
              ref_camera.current.updateProjectionMatrix()
            }
          },

          shadow_right: {
            label: 'right',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_camera.current.right = value
              ref_camera.current.updateProjectionMatrix()
            }
          },

          shadow_top: {
            label: 'top',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_camera.current.top = value
              ref_camera.current.updateProjectionMatrix()
            }
          },

          shadow_bottom: {
            label: 'bottom',
            value: 8,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_camera.current.bottom = -value
              ref_camera.current.updateProjectionMatrix()
            }
          },
        },

        { collapsed: true }
      ),
    },

    { collapsed: true }
  )

  // PHYSICS DEBUG
  const controls_physics = useControls(
    'physics',

    {
      debug: {
        value: false,
      }
    },

    { collapsed: true }
  )


  /**
   * HELPERS
   */

  useHelper(
    controls_lighting.shadow_helper && ref_camera,
    THREE.CameraHelper
  )



  /**
   * DICE ROLLING
   */

  const rollD20 = () => {
    if (!ref_d20_body.current) return

    // randomize the roll position
    const roll_start_pos = new THREE.Vector3(
      randomFloat(-5, 5), // roll left/right position
      2, // roll height
      6 // how far back to roll
    )

    // reset the d20
    ref_d20_body.current.setTranslation(roll_start_pos, true)
    ref_d20_body.current.setRotation({ x: 0, y: 0, z: 0, w: 0 }, true)
    ref_d20_body.current.setAngvel({ x: 0, y: 0, z: 0 })
    ref_d20_body.current.setLinvel({ x: 0, y: 0, z: 0 })

    // apply a random force and spin
    ref_d20_body.current.applyImpulse({
      x: randomFloat(-30, 30), // left/right force
      y: randomFloat(20, 40), // upward force
      z: randomFloat(-80, -30) // forward force
    }, true)

    ref_d20_body.current.applyTorqueImpulse({
      x: randomFloat(-20, -5), // forward spin
      y: 0,
      z: randomFloat(-12, 12) // left/right spin
    }, true)
  }

  // get the face of the d20 that is facing up
  const onRollComplete = () => {
    const d20_position = ref_d20_mesh.current.getWorldPosition(new THREE.Vector3())
    const raycaster = new THREE.Raycaster()

    raycaster.set(
      new THREE.Vector3(d20_position.x, d20_position.y + 1, d20_position.z), // start position above the d20
      new THREE.Vector3(0, -1, 0) // direction down
    )

    const intersect = raycaster.intersectObject(ref_d20_mesh.current, true)

    console.log('YOU ROLLED A: ', FACE_ID_LOOKUP[intersect[0].faceIndex])
  }

  dice_sound.media.onended = () => {
    dice_sound.is_playing = false
  }

  const handleDiceSound = (force) => {
    if (force > 100 && !dice_sound.is_playing) {
      dice_sound.media.currentTime = 0
      dice_sound.media.volume = Math.min(force / 2000, 1)

      dice_sound.media.play()
        .then(() => dice_sound.is_playing = true)
        .catch(err => dice_sound.is_playing = false)
    }
  }

  // COMMENT: REMOVED, BUT KEEPING FOR REFERENCE FOR PLACEMENT OF OTHER OBJECTS
  // save the initial position and rotation of the d20
  // useEffect(() => {
  //   if (ref_d20_body.current) {
  //     d20_start.pos = vec3(ref_d20_body.current.translation())
  //     d20_start.quatertion = quat(ref_d20_body.current.rotation())
  //   }
  // }, [])

  useEffect(() => {
    ref_controls.current.target.set(0, 2, 0)
    ref_controls.current.update()
  }, [])

  return <>

    {Perf && <Perf position='top-left' />}

    <OrbitControls
      ref={ref_controls}
      makeDefault
    />

    <directionalLight
      ref={ref_light}
      castShadow={controls_lighting.shadow_enabled}
      position={controls_lighting.directional_position}
      intensity={controls_lighting.directional_intensity}
      color={controls_lighting.directional_color}
      shadow-mapSize={[1024, 1024]}
      shadow-radius={4}
    >
      <orthographicCamera
        ref={ref_camera}
        attach='shadow-camera'
        near={controls_lighting.shadow_near}
        far={controls_lighting.shadow_far}

        args={[
          controls_lighting.shadow_left,
          controls_lighting.shadow_right,
          controls_lighting.shadow_top,
          controls_lighting.shadow_bottom,
        ]}
      />
    </directionalLight>

    <ambientLight
      intensity={controls_lighting.ambient_intensity}
      color={controls_lighting.ambient_color}
    />

    <Physics
      debug={controls_physics.debug}
      gravity={[0, -9.81, 0]}
    >

      {/* D20 */}
      <RigidBody
        ref={ref_d20_body}
        colliders='hull'
        position={[0, 6, 6]}
        rotation={[Math.random(), 0, Math.random()]}
        mass={1}
        restitution={0.4}
        friction={0.3}

        onClick={rollD20}
        onSleep={onRollComplete}
        onContactForce={(payload) => { handleDiceSound(payload.totalForceMagnitude) }}
      >
        <D20
          child_ref={ref_d20_mesh}
          castShadow
        // onClick={testFace}
        />
      </RigidBody>

      {/* ROOM */}
      <Wall
        position={[0, ROOM_COLLIDER.wall_position_y, -7.3]}
      />

      <Wall
        position={[0, ROOM_COLLIDER.wall_position_y, 7.3]}
        rotation={[0, Math.PI, 0]}
      />

      <Wall
        position={[7.3, ROOM_COLLIDER.wall_position_y, 0]}
        rotation={[0, -Math.PI * 0.5, 0]}
      />

      <Wall
        position={[-7.3, ROOM_COLLIDER.wall_position_y, 0]}
        rotation={[0, Math.PI * 0.5, 0]}
      />

      <Ceiling />

      <Floor />

    </Physics>
  </>
}

export default Experience