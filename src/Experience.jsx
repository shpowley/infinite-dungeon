import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Environment, Image, OrbitControls, ScreenSpace, Text, useHelper, useKeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { button, folder, useControls } from "leva"
import { Perf } from 'r3f-perf'

import { CAMERA_DEFAULTS, ANIMATION_DEFAULTS, LEVA_SORT_ORDER, DICE_OWNER, ITEM_KEYS, GAME_PHASE, FILE_FONT_BEBAS_NEUE, KEYBOARD } from './common/Constants'
import { parameterEnabled } from './common/Utils'
import D20 from './components/D20'
import Room, { ROOM_ANIMATION_DEFAULTS } from './components/Room'
import Warrior, { MESH_ANIMATIONS } from './components/Warrior'
import Sign from './components/Sign'
import { FLOOR_ITEMS, generateLevel } from './common/Level'
import D20Enemy from './components/D20Enemy'
import Keys from './components/Keys'
import TitleDialog from './components/TitleDialog'
import PlayerInfo from './components/PlayerInfo'
import StatInfo from './components/StatInfo'
import EnemyInfo from './components/EnemyInfo'
import HUDImages from './common/HUDImages'

const TIMING = {
  CLEAR_SIGN: 500,
  CLEAR_WARRIOR: 500,
  CLEAR_ROOM: 1000,
  BUILD_ROOM: 2000,
  BUILD_WARRIOR: 1500,
  BUILD_SIGN: 1000,
  BUILD_DICE: 1500
}

const SIGN_PROPS_DEFAULT = {
  ...ANIMATION_DEFAULTS,
  monster: 'NONE'
}

const PLAYER_INFO_DEFAULT = {
  health: 100,
  attack: 10,

  floor_index: null,
  room_index: null,

  gold: 0,
  potions: 3,
  key: false,

  kill_count: 0
}

let show_perf = (parameterEnabled('PERF') || parameterEnabled('perf'))

let
  active_level = null,
  active_room = null,
  player_data = null,
  door_indicator_default_url = HUDImages.RED_X.path,

  dice_ready = false,
  in_combat_roll = false,
  is_player_rolling = false,
  dice_roll_player = null,
  is_enemy_rolling = false,
  dice_roll_enemy = null

const Experience = () => {
  const
    ref_orbit_controls = useRef(),
    ref_light = useRef(),
    ref_shadow_camera = useRef(),
    ref_d20 = useRef(),
    ref_d20_enemy = useRef(),
    ref_warrior = useRef(),
    ref_door_indicator = useRef(),
    ref_log = useRef(),

    ref_player_info = {
      health: useRef(),
      potions: useRef(),
      gold: useRef(),
      key: useRef()
    },

    ref_enemy_info = {
      name: useRef(),
      health: useRef()
    },

    ref_stats = {
      floor: useRef()
    }

  const
    [is_build_complete, setIsBuildComplete] = useState(false),
    [animation_room, setAnimationRoom] = useState(ROOM_ANIMATION_DEFAULTS),
    [animation_warrior, setAnimationWarrior] = useState(ANIMATION_DEFAULTS),
    [animation_sign, setAnimationSign] = useState(SIGN_PROPS_DEFAULT),
    [dice_enabled, setDiceEnabled] = useState(false),
    [game_phase, setGamePhase] = useState(GAME_PHASE.START),

    [leva_dungeon_info, setLevaDungeonInfo] = useState({
      floor_select: 1,
      room_select: 1,
    })

  // USED TO HELP POSITION 2D HUD ELEMENTS
  const aspect_ratio = useThree(state => state.viewport.aspect)

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
            value: '#ff8c00',
          },
        },

        { collapsed: true }
      ),

      // subfolder
      'directional light': folder(
        {
          directional_intensity: {
            label: 'intensity',
            value: 1.0,
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
            value: '#dc3a3a',
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
  useControls(
    'dungeon',

    {
      'room debug': folder(
        {
          room_select: {
            label: 'room select',
            value: 0,
            min: 0,
            max: 15,
            step: 1,

            onChange: value => {
              setLevaDungeonInfo({
                ...leva_dungeon_info,
                room_select: value
              })
            }
          },
          'teleport to room': button(() => {
            active_room = active_level.rooms[leva_dungeon_info.room_select]
            active_room.visited = true
            animateRoom()
          }),
        },
        { collapsed: true }
      ),

      'start new game': button(() => newGame()),

      'roll dice': button(
        () => rollCombat(),
        { disabled: !dice_enabled }
      ),
    },

    { collapsed: true, order: LEVA_SORT_ORDER.DUNGEON },

    // leva dependency array
    //  leva_dungeon_info - allows selecting dungeon floor/room and using that info in leva buttons (maybe a better way?)
    [leva_dungeon_info, dice_enabled]
  )


  /**
   * HELPERS
   */

  useHelper(
    controls_lighting.shadow_helper && ref_shadow_camera,
    THREE.CameraHelper
  )


  /**
   * KEYBOARD CONTROLS
   */
  const [sub, get] = useKeyboardControls()


  /**
   * DUNGEON
   */
  const newGame = () => {
    active_level = generateLevel(1)

    console.log('*** NEW GAME ***')
    console.log('LEVEL', active_level)

    const room_start_index = active_level.room_start.index
    active_room = active_level.rooms[room_start_index]
    active_room.visited = true

    // reset player info
    player_data = {
      ...PLAYER_INFO_DEFAULT,
      floor_index: 1,
      room_index: room_start_index
    }

    animateRoom()
  }

  const clearDoorIndicator = () => {
    ref_door_indicator.current.visible = false
  }

  const updateDoorIndicator = () => {
    let
      show_indicator = false,
      indicator_direction,
      HUD_image,
      adjacent_room_id

    // STARTING ROOM
    if (active_room.index === active_level.room_start.index) {
      if (active_level.room_start.level_door) {
        show_indicator = true
        indicator_direction = active_level.room_start.level_door
        HUD_image = HUDImages.RED_X
      }
    }

    // ENDING ROOM
    else if (active_room.index === active_level.room_end.index) {
      if (active_level.room_end.level_door) {
        show_indicator = true
        indicator_direction = active_level.room_end.level_door
        HUD_image = HUDImages.EXIT
      }
    }

    // OTHER ROOMS -- IF ADJACENT TO THE BOSS ROOM, SHOW THE SKULL
    else {
      for (const [direction, is_door] of Object.entries(active_room.doors)) {
        if (is_door) {
          adjacent_room_id = active_room.adjacent_blocks.find(block => block.direction === direction).index

          if (adjacent_room_id === active_level.room_end.index) {
            show_indicator = true
            indicator_direction = direction
            HUD_image = HUDImages.MONSTER
            break
          }
        }
      }
    }

    if (show_indicator) {
      const indicator = ref_door_indicator.current

      indicator.material.map = new THREE.TextureLoader().load(HUD_image.path)
      indicator.scale.set(...HUD_image.scale)

      switch (indicator_direction) {
        case 'N':
          indicator.rotation.set(0, 0, 0)
          indicator.position.set(0, 1.5, -7.5)
          break

        case 'S':
          indicator.rotation.set(0, Math.PI, 0)
          indicator.position.set(0, 1.5, 7.5)
          break

        case 'E':
          indicator.rotation.set(0, -Math.PI * 0.5, 0)
          indicator.position.set(7.5, 1.5, 0)
          break

        case 'W':
          indicator.rotation.set(0, Math.PI * 0.5, 0)
          indicator.position.set(-7.5, 1.5, 0)
          break
      }

      indicator.visible = true
    }
  }

  const animateRoom = () => {
    if (!active_level) {
      console.warn('NO LEVEL DATA')
      return
    }

    if (!active_room) {
      console.warn('NO ROOM DATA')
      return
    }

    // TODO: UPDATE MINI-MAP INSTEAD OF CONSOLE LOG (KEEP THESE COMMENTED LOGS FOR NOW)
    // console.log('ROOM DATA', active_room)
    // console.log('PLAYER DATA', player_data)

    let
      delay = 0,
      delay_triggered = false

    if (!active_room.is_room) {
      console.warn('SELECTED BLOCK IS NOT A ROOM')
    }

    setIsBuildComplete(false)
    setGamePhase(GAME_PHASE.STANDBY)

    // --- DECONSTRUCTION PHASE ---
    if (
      dice_enabled ||
      animation_room.visible ||
      animation_warrior.visible ||
      animation_sign.visible
    ) {
      // clear dice
      if (dice_enabled) {
        setDiceEnabled(false)
        delay_triggered = true
      }

      // clear sign
      if (animation_sign.visible) {
        if (delay_triggered) {
          delay += TIMING.CLEAR_SIGN
        }

        setTimeout(() => {
          setAnimationSign({
            ...SIGN_PROPS_DEFAULT,
            animate: true,
            visible: false
          })
        }, delay)

        delay_triggered = true
      }

      // clear warrior
      if (animation_warrior.visible) {
        if (delay_triggered) {
          delay += TIMING.CLEAR_WARRIOR
        }

        setTimeout(() => {
          if (animation_warrior.visible) {
            ref_warrior.current.handleMeshAnimation(MESH_ANIMATIONS.NONE)

            setAnimationWarrior({
              animate: true,
              visible: false
            })
          }
        }, delay)

        delay_triggered = true
      }

      // clear walls
      if (animation_room.visible) {
        if (delay_triggered) {
          delay += TIMING.CLEAR_ROOM
        }

        setTimeout(() => {
          setAnimationRoom({
            ...ROOM_ANIMATION_DEFAULTS,
            animate: true,
            visible: false
          })

          clearDoorIndicator()
        }, delay)

        delay_triggered = true
      }
    }

    // --- CONSTRUCTION PHASE ---
    if (active_room.is_room) {

      // construct walls
      if (delay_triggered) {
        delay += TIMING.BUILD_ROOM
      }

      setTimeout(() => {
        setAnimationRoom({
          animate: true,
          visible: true,
          delay: 0,

          doors: {
            N: active_room.doors?.N ?? false,
            S: active_room.doors?.S ?? false,
            E: active_room.doors?.E ?? false,
            W: active_room.doors?.W ?? false,
          }
        })

        updateDoorIndicator()
      }, delay)

      // construct warrior
      delay += TIMING.BUILD_WARRIOR

      setTimeout(() => {
        setAnimationWarrior({
          animate: true,
          visible: true
        })
      }, delay)

      if (active_room.monster) {

        // construct sign
        delay += TIMING.BUILD_SIGN

        setTimeout(() => {
          setAnimationSign({
            animate: true,
            visible: true,
            monster: active_room.monster
          })
        }, delay)

        // show dice
        dice_ready = false
        delay += TIMING.BUILD_DICE

        setTimeout(() => {
          setDiceEnabled(true)
          ref_log.current.text = `${active_room.monster.label} APPEARS!\nTIME TO ATTACK!`
        }, delay)
      }
    }
  }

  const rollCombat = () => {
    if (ref_d20.current && ref_d20_enemy.current) {
      in_combat_roll = true
      is_player_rolling = true
      is_enemy_rolling = true
      dice_ready = false

      ref_log.current.text = 'ROLLING THE DICE...'

      ref_warrior.current.handleMeshAnimation(MESH_ANIMATIONS.NONE)

      setTimeout(() => {
        ref_d20.current.rollD20()
      }, Math.random() * 500)

      setTimeout(() => {
        ref_d20_enemy.current.rollD20()
      }, Math.random() * 500)
    }
  }

  const onD20RollComplete = result => {
    if (in_combat_roll) {
      if (is_player_rolling && result.owner === DICE_OWNER.PLAYER) {
        dice_roll_player = result.value
        is_player_rolling = false
      }

      if (is_enemy_rolling && result.owner === DICE_OWNER.ENEMY) {
        dice_roll_enemy = result.value
        is_enemy_rolling = false
      }

      /**
       * COMBAT:
       *
       *  winner = highest dice: player or monster (tie >> next roll)
       *
       *  damage calculation
       *
       *    if winning dice roll = 20 (CRITICAL HIT) >> 2x damage
       *
       *      [(winner dice - loser dice) + 1] / 20 (PERCENTAGE OF ATTACK DAMAGE)
       *    x winner base attack (or CRITICAL HIT DAMAGE)
       *    x winner health / winner max health (PERCENTAGE OF HEALTH)
       */
      let log_text = ''

      if (!is_player_rolling && !is_enemy_rolling) {
        log_text = `PLAYER ROLL: ${dice_roll_player}\nMONSTER ROLL: ${dice_roll_enemy}`

        let
          damage = 0,
          attack = 0

        // TIE - NO DAMAGE DEALT - ROLL AGAIN
        if (dice_roll_player === dice_roll_enemy) {
          log_text += '\nTIE - ROLL AGAIN'
        }

        // PLAYER WINS COMBAT ROUND
        else if (dice_roll_player > dice_roll_enemy) {

          ref_warrior.current.handleMeshAnimation(MESH_ANIMATIONS.SLASH)

          // CRITICAL HIT or BASE ATTACK
          attack = dice_roll_player === 20 ? player_data.attack * 2 : player_data.attack

          damage = Math.ceil(
            (((dice_roll_player - dice_roll_enemy) + 1) / 20)   // DICE DIFFERENCE
            * attack                                            // BASE ATTACK or CRITICAL HIT
            * (player_data.health / PLAYER_INFO_DEFAULT.health) // PERCENTAGE OF HEALTH
          )

          active_room.monster.health -= damage
          ref_enemy_info.health.current.text = `${active_room.monster.health} HP`

          if (dice_roll_player === 20) {
            log_text += '\nCRITICAL HIT!!'
          }

          log_text += `\n${active_room.monster.label} TAKES ${damage} DAMAGE`

          if (active_room.monster.health <= 0) {
            ref_warrior.current.handleMeshAnimation(MESH_ANIMATIONS.NONE)

            log_text += `\nMONSTER DEFEATED!`

            player_data.kill_count++

            if (active_room.item) {
              log_text += `\n${active_room.item.name} FOUND!`

              switch (active_room.item.type) {
                case ITEM_KEYS.HEALTH_POTION:
                  player_data.potions++
                  ref_player_info.potions.current.text = player_data.potions
                  break

                case ITEM_KEYS.TREASURE_CHEST:
                  player_data.gold += active_room.item.value
                  ref_player_info.gold.current.text = player_data.gold
                  break

                case ITEM_KEYS.KEY:
                  player_data.key = true
                  ref_player_info.key.current.visible = true
                  break

                default:
                  console.warn('NO MATCHING ITEM!!')
              }

              delete active_room.item
            }

            delete active_room.monster

            setDiceEnabled(false)

            // HIDING THE SIGN SHOULD AUTOMATICALLY TRIGGER THE STANDBY PHASE IN useEffect()
            setTimeout(() => {
              setAnimationSign({
                ...SIGN_PROPS_DEFAULT,
                animate: true,
                visible: false
              })
            }, 1000)
          }
        }

        // MONSTER WINS COMBAT ROUND
        else {

          ref_warrior.current.handleMeshAnimation(MESH_ANIMATIONS.BLOCK)

          // CRITICAL HIT or BASE ATTACK
          attack = dice_roll_enemy === 20 ? active_room.monster.attack * 2 : active_room.monster.attack

          damage = Math.ceil(
            (((dice_roll_enemy - dice_roll_player) + 1) / 20)               // DICE DIFFERENCE
            * attack                                                        // BASE ATTACK or CRITICAL HIT
            * (active_room.monster.health / active_room.monster.max_health) // PERCENTAGE OF HEALTH
          )

          player_data.health -= damage
          ref_player_info.health.current.text = `${player_data.health} HP`

          if (dice_roll_enemy === 20) {
            log_text += '\nCRITICAL HIT!!'
          }

          log_text += `\nPLAYER TAKES ${damage} DAMAGE`

          if (player_data.health <= 0) {
            log_text += `\nOH NOES!! PLAYER DEFEATED!`
            setGamePhase(GAME_PHASE.GAME_OVER)
          }
        }

        ref_log.current.text = log_text
        in_combat_roll = false
        dice_ready = true
      }
    }
    else {
      dice_ready = true
    }
  }

  const controlsHandler = command => {
    // DUNGEON MOVEMENT
    switch (command) {
      case KEYBOARD.NORTH:
      case KEYBOARD.SOUTH:
      case KEYBOARD.EAST:
      case KEYBOARD.WEST:

        if (game_phase === GAME_PHASE.MOVEMENT && is_build_complete) {
          let direction = null

          if (command === KEYBOARD.NORTH && active_room.doors.N) {
            direction = 'N'
          }

          else if (command === KEYBOARD.SOUTH && active_room.doors.S) {
            direction = 'S'
          }

          else if (command === KEYBOARD.EAST && active_room.doors.E) {
            direction = 'E'
          }

          else if (command === KEYBOARD.WEST && active_room.doors.W) {
            direction = 'W'
          }

          if (direction) {
            const next_room = active_room.adjacent_blocks.find(block => block.direction === direction)

            if (next_room) {
              const next_index = next_room.index

              // CHECK FOR KEY TO FLOOR BOSS ROOM
              if (next_index === active_level.room_end.index) {
                if (player_data.key) {
                  ref_log.current.text = 'ENTERING THE BOSS ROOM...'
                  player_data.key = false
                  active_room = active_level.rooms[next_index]
                  active_room.visited = true
                  animateRoom()
                }
                else {
                  ref_log.current.text = 'YOU NEED A KEY TO OPEN THIS DOOR'
                }
              }

              // NO KEY REQUIRED FOR OTHER ROOMS
              else {
                ref_log.current.text = '...'
                active_room = active_level.rooms[next_index]
                active_room.visited = true
                animateRoom()
              }
            }

            // UNDEFINED OR NOT AN INTEGER TO ANOTHER ROOM. IF CURRENTLY IN THE FLOOR BOSS ROOM MOVE TO NEXT FLOOR
            else if (active_room.index === active_level.room_end.index) {
              ref_log.current.text = 'MOVE TO THE NEXT FLOOR'
              player_data.floor_index++
              ref_stats.floor.current.text = `FLOOR: ${player_data.floor_index}`

              // GENERATE NEW LEVEL BASED ON CURRENT FLOOR (1 >> 2 >> 3 >> etc.)
              // - STARTING ROOM IS FOR THE NEXT LEVEL IS BASED ON THE CURRENT LEVEL'S ENDING ROOM
              active_level = generateLevel(
                player_data.floor_index,

                {
                  index: active_room.index,
                  level_door: direction
                }
              )

              // INTENTIONALLY LOGGING THE LEVEL DATA TO THE CONSOLE
              console.log('LEVEL', active_level)

              active_room = active_level.rooms[active_level.room_start.index]
              active_room.visited = true
              animateRoom()
            }
          }
        }

        break

      // ROLL DICE (COMBAT)
      case KEYBOARD.ROLL_DICE:
        if (game_phase === GAME_PHASE.COMBAT && dice_enabled && dice_ready) {
          rollCombat()
        }

        break

      // USE A HEALTH POTION
      case KEYBOARD.POTION:
        if ((game_phase === GAME_PHASE.COMBAT || game_phase === GAME_PHASE.MOVEMENT) && player_data.potions > 0) {
          ref_log.current.text = 'USED A HEALTH POTION'

          player_data.potions--
          ref_player_info.potions.current.text = player_data.potions

          player_data.health = Math.min(
            player_data.health + FLOOR_ITEMS.HEALTH_POTION.value,
            PLAYER_INFO_DEFAULT.health
          )

          ref_player_info.health.current.text = `${player_data.health} HP`
        }

        break

      default:
    }
  }

  const handleWarriorConstructComplete = () => {
    setIsBuildComplete(true)
  }

  const adjustGamePhase = () => {
    if (is_build_complete) {
      if (animation_sign.visible) {
        setGamePhase(GAME_PHASE.COMBAT)
      }
      else if (
        animation_room.visible &&
        active_room &&
        active_room.is_room && (
          active_room.doors.N ||
          active_room.doors.S ||
          active_room.doors.E ||
          active_room.doors.W
        )
      ) {
        setGamePhase(GAME_PHASE.MOVEMENT)
      }
      else {
        setGamePhase(GAME_PHASE.STANDBY)
      }
    }
  }

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


  // KEYBOARD CONTROLS
  useEffect(() => {
    return sub(
      state => state,

      keys => {
        // ROLL DICE (COMBAT)
        if (keys.ROLL_DICE) {
          controlsHandler(KEYBOARD.ROLL_DICE)
        }

        // MOVEMENT
        else if (keys.NORTH) {
          controlsHandler(KEYBOARD.NORTH)
        }

        else if (keys.SOUTH) {
          controlsHandler(KEYBOARD.SOUTH)
        }

        else if (keys.EAST) {
          controlsHandler(KEYBOARD.EAST)
        }

        else if (keys.WEST) {
          controlsHandler(KEYBOARD.WEST)
        }

        // POTION
        else if (keys.POTION) {
          controlsHandler(KEYBOARD.POTION)
        }
      }
    )
  }, [game_phase, is_build_complete, animation_sign, animation_room, dice_enabled])

  // SET GAME PHASE
  useEffect(() => {
    adjustGamePhase()
  }, [animation_room, animation_sign, is_build_complete])

  return <>

    {show_perf && <Perf position='top-left' />}

    <Environment preset='sunset' />

    <color attach="background" args={['#6c323d']} />

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

    <ScreenSpace depth={1} >
      <Suspense fallback={null}>
        <PlayerInfo
          game_phase={game_phase}
          aspect_ratio={aspect_ratio}
          data={player_data}
          inner_refs={ref_player_info}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EnemyInfo
          game_phase={game_phase}
          aspect_ratio={aspect_ratio}
          data={active_room?.monster}
          inner_refs={ref_enemy_info}
        />
      </Suspense>

      <Suspense fallback={null}>
        <StatInfo
          game_phase={game_phase}
          aspect_ratio={aspect_ratio}
          data={player_data}
          level_data={active_level}
          current_room={active_room}
          inner_refs={ref_stats}
        />
      </Suspense>

      {game_phase === GAME_PHASE.START &&
        <TitleDialog
          visible={game_phase === GAME_PHASE.START}
          onClick={newGame}
        />
      }

      <Suspense fallback={null}>
        <Keys
          game_phase={game_phase}
          onClick={controlsHandler}
        />
      </Suspense>

      <Text
        ref={ref_log}
        font={FILE_FONT_BEBAS_NEUE}
        color='#1f5592'
        scale={0.025}
        anchorX='left'
        anchorY='bottom'
        position={[-0.4 * aspect_ratio, -0.3, 0]}
        visible={[GAME_PHASE.STANDBY, GAME_PHASE.MOVEMENT, GAME_PHASE.COMBAT].includes(game_phase)}
      >
        THE ADVENTURE BEGINS...
        <meshBasicMaterial toneMapped={false} />
      </Text>
    </ScreenSpace>

    {/*
      DOOR INDICATOR (EXIT, FLOOR BOSS ROOM (SKULL), PREVIOUS FLOOR (BLOCKED - "X"))
      - ONLY ONE DOOR INDICATOR PER ANY ROOM SHOULD BE NECESSARY
      */}
    <Suspense fallback={null}>
      <Image
        ref={ref_door_indicator}
        visible={false}
        transparent
        url={door_indicator_default_url}
      />
    </Suspense>

    <Physics
      debug={controls_physics.debug}
      gravity={[0, -9.81, 0]}
    >
      <Warrior
        inner_ref={ref_warrior}
        castShadow
        position={[1.5, 0.8, 1.5]}
        rotation={[0, -Math.PI * 0.75, 0]}
        animation_props={animation_warrior}
        scale={[1.3, 1.3, 1.3]}
        onConstructComplete={handleWarriorConstructComplete}
      />

      <Sign
        castShadow
        position={[-1, 1.3, -1]}
        scale={[2.0, 2.0, 2.0]}
        rotation={[0, Math.PI * 0.25, 0]}
        animation_props={animation_sign}
      />

      <Suspense fallback={null}>
        <D20
          inner_ref={ref_d20}
          castShadow
          enabled={dice_enabled}
          onRollComplete={onD20RollComplete}
        />
      </Suspense>

      <Suspense fallback={null}>
        <D20Enemy
          inner_ref={ref_d20_enemy}
          castShadow
          enabled={dice_enabled}
          onRollComplete={onD20RollComplete}
        />
      </Suspense>

      <Room
        receiveShadow
        ref_orbit_controls={ref_orbit_controls}
        animation_props={animation_room}
        onDirectionClick={controlsHandler}
      />
    </Physics>
  </>
}

export default Experience