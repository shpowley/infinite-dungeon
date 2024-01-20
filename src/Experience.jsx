import { memo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { button, folder, useControls } from "leva"

import { CAMERA_DEFAULTS, ANIMATION_DEFAULTS, LEVA_SORT_ORDER } from './common/Constants'
import { parameterEnabled } from './common/Utils'
import D20 from './components/D20'
import Room from './components/Room'
import Warrior from './components/Warrior'
import Sign from './components/Sign'
import { generateLevel } from './common/Level'
import { MONSTERS } from './common/Monsters'

const sign_props_default = {
  ...ANIMATION_DEFAULTS,
  monster: 'NONE'
}

// DYNAMIC IMPORT FOR R3F PERFORMANCE MONITOR
let Perf = null

if (parameterEnabled('PERF') || parameterEnabled('perf')) {
  Perf = (await import('r3f-perf')).Perf
}

let level = generateLevel()

const Experience = memo(() => {
  const
    ref_orbit_controls = useRef(),
    ref_light = useRef(),
    ref_shadow_camera = useRef()

  const
    [animation_walls, setAnimationWalls] = useState(ANIMATION_DEFAULTS),
    [animation_warrior, setAnimationWarrior] = useState(ANIMATION_DEFAULTS),
    [animation_sign, setAnimationSign] = useState(sign_props_default),
    [d20_player_enabled, setD20PlayerEnabled] = useState(false),
    [d20_player_roll, setD20PlayerRoll] = useState(false),

    [leva_dungeon_info, setLevaDungeonInfo] = useState({
      floor_select: 1,
      room_select: 1,
    })

  /**
   * DEBUG CONTROLS
   */

  // CAMERA DEBUG
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
          ref_orbit_controls.current.update()
        }
      },
    },

    { collapsed: true, order: LEVA_SORT_ORDER.CAMERA }
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
              ref_shadow_camera.current.near = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_far: {
            label: 'far',
            value: 20,
            min: 10,
            max: 200,
            step: 1,

            onChange: value => {
              ref_shadow_camera.current.far = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_left: {
            label: 'left',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_shadow_camera.current.left = -value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_right: {
            label: 'right',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_shadow_camera.current.right = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_top: {
            label: 'top',
            value: 12,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_shadow_camera.current.top = value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },

          shadow_bottom: {
            label: 'bottom',
            value: 10,
            min: 1,
            max: 50,
            step: 1,

            onChange: value => {
              ref_shadow_camera.current.bottom = -value
              ref_shadow_camera.current.updateProjectionMatrix()
            }
          },
        },

        { collapsed: true }
      ),
    },

    { collapsed: true, order: LEVA_SORT_ORDER.LIGHTING }
  )

  // PHYSICS DEBUG
  const controls_physics = useControls(
    'physics',

    {
      debug: {
        value: false,
      }
    },

    { collapsed: true, order: LEVA_SORT_ORDER.PHYSICS }
  )

  // ROOM / LEVEL ANIMATION DEBUG
  const controls_dungeon = useControls(
    'dungeon',

    {
      'floor': folder(
        {
          floor_select: {
            label: 'floor select',
            value: 1,
            min: 1,
            max: 30,
            step: 1,
          },
          'build floor': button(() => {
            // create new random floor based on template
            console.log('create new floor')
          }),
          'show floor info': button(() => {
            if (level) {
              console.log(level)
            }
          })
        },
        { collapsed: true }
      ),

      'room': folder(
        {
          room_select: {
            label: 'room select',
            value: 1,
            min: 1,
            max: 16,
            step: 1,

            onChange: value => {
              setLevaDungeonInfo({
                ...leva_dungeon_info,
                room_select: value
              })
            }
          },
          'build room': button(() => {
            console.log('show room: ', leva_dungeon_info.room_select)

            if (level) {
              console.log(level.rooms[leva_dungeon_info.room_select - 1])

              // clear sign
              setAnimationSign({
                ...sign_props_default,
                animate: true,
                visible: false
              })

              setTimeout(() => {

                // clear warrior
                setAnimationWarrior({
                  animate: true,
                  visible: false
                })

                setTimeout(() => {

                  // clear walls
                  setAnimationWalls({
                    animate: true,
                    visible: false
                  })

                  setTimeout(() => {
                    // construct walls
                    setAnimationWalls({
                      animate: true,
                      visible: true
                    })

                    setTimeout(() => {
                      // construct warrior
                      setAnimationWarrior({
                        animate: true,
                        visible: true
                      })

                      setTimeout(() => {
                        // construct sign
                        setAnimationSign({
                          ...sign_props_default,
                          animate: true,
                          visible: true
                        })
                      }, 500)
                    }, 1500)
                  }, 2000)
                }, 500)
              }, 500)

              // STOPPED HERE
              // clear room
              // a) if block is not a room, do nothing
              // b) if block is a room > wait > build the room based on selected room
              // move to function
              // add door visibility to room / each wall
              // leva debug timing
            }
          }),
        },
        { collapsed: true }
      ),

      'individuals objects': folder(
        {
          'walls - show/hide': button(() => {
            setAnimationWalls(prev => ({
              visible: !prev.visible,
              animate: true
            }))
          }),

          'warrior - show/hide': button(() => {
            setAnimationWarrior(prev => ({
              visible: !prev.visible,
              animate: true
            }))
          }),

          'monster sign': folder(
            {
              monster_select: {
                label: 'monster',
                value: animation_sign.monster,
                options: MONSTERS,

                onChange: value => {
                  setAnimationSign({
                    ...animation_sign,
                    monster: value
                  })
                }
              },

              'sign - show/hide': button(() => {
                setAnimationSign(prev => ({
                  ...prev,
                  visible: !prev.visible,
                  animate: true
                }))
              })
            },
            { collapsed: true }
          ),

          'player d20': folder(
            {
              d20_player_enable: {
                label: 'show dice',
                value: d20_player_enabled,
                onChange: value => setD20PlayerEnabled(value)
              },

              'roll player d20': button(
                () => {
                  console.log('show/hide red d20')
                  setD20PlayerRoll(true)
                },
                { disabled: !d20_player_enabled }
              )
            },
            { collapsed: true }
          )
        },
        { collapsed: true }
      ),
    },

    { collapsed: true, order: LEVA_SORT_ORDER.DUNGEON },

    // leva dependency array
    //  d20_player_enabled - allows disabling 'roll' button when d20 isn't visible
    // leva_dungeon_info - allows selecting dungeon floor/room and using that info in leva buttons (maybe a better way?)
    [d20_player_enabled, leva_dungeon_info]
  )


  /**
   * HELPERS
   */

  useHelper(
    controls_lighting.shadow_helper && ref_shadow_camera,
    THREE.CameraHelper
  )


  // COMMENT: REMOVED, BUT KEEPING FOR REFERENCE FOR PLACEMENT OF OTHER OBJECTS
  // save the initial position and rotation of the d20
  // useEffect(() => {
  //   if (ref_d20_body.current) {
  //     d20_start.pos = vec3(ref_d20_body.current.translation())
  //     d20_start.quaternion = quat(ref_d20_body.current.rotation())
  //   }
  // }, [])

  // COMMENT: IF NECESSARY, SET STARTING CAMERA TARGET POSITION HERE
  // useEffect(() => {
  //   ref_orbit_controls.current.target.set(0, 0, 0)
  //   ref_orbit_controls.current.update()
  // }, [])

  return <>

    {Perf && <Perf position='top-left' />}

    <OrbitControls
      ref={ref_orbit_controls}
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
        ref={ref_shadow_camera}
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
      <Warrior
        castShadow
        position={[1.5, 0.8, 1.5]}
        rotation={[0, -Math.PI * 0.75, 0]}
        animation_props={animation_warrior}
      />

      <Sign
        castShadow
        position={[-1, 1.3, -1]}
        scale={[1.4, 1.4, 1.4]}
        rotation={[0, Math.PI * 0.25, 0]}
        animation_props={animation_sign}
      />

      <D20
        castShadow
        enabled={d20_player_enabled}
        roll={d20_player_roll}
      />

      <Room
        receiveShadow
        ref_orbit_controls={ref_orbit_controls}
        animation_props={animation_walls}
      />
    </Physics>
  </>
})

export default Experience