import { memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { randomFloat } from '../common/Utils'

// face id lookup table -- specific to this model only!
// see NOTES.txt on how to do this
const FACE_ID_LOOKUP = {
  1063: 1,
  154: 2,
  744: 3,
  174: 4,
  695: 5,
  278: 6,
  926: 7,
  210: 8,
  635: 9,
  408: 10,
  623: 11,
  419: 12,
  796: 13,
  119: 14,
  775: 15,
  291: 16,
  755: 17,
  244: 18,
  900: 19,
  0: 20
}

const
  FILE_PXLMESH_LOGO = './models/d20-compressed.glb',
  FILE_SOUND_HIT = './sounds/hit.mp3'

let dice_roll_value = null

useGLTF.preload(FILE_PXLMESH_LOGO)

const D20 = memo(({ castShadow = false, position, enabled = false, inner_ref }) => {
  const
    ref_d20_body = useRef(),
    ref_d20_mesh = useRef()

  const { nodes, materials } = useGLTF(FILE_PXLMESH_LOGO)

  const
    [dice_sound] = useState({
      media: new Audio(FILE_SOUND_HIT),
      is_playing: false,
    })

  dice_sound.media.onended = () => {
    dice_sound.is_playing = false
  }

  const handleDiceSound = force => {
    if (force > 100 && !dice_sound.is_playing) {
      dice_sound.media.currentTime = 0
      dice_sound.media.volume = Math.min(force / 2000, 1)

      dice_sound.media.play()
        .then(() => dice_sound.is_playing = true)
        .catch(err => dice_sound.is_playing = false)
    }
  }

  const rollD20 = () => {

    // don't roll if the d20 is already rolling
    if (!ref_d20_body.current || !ref_d20_body.current.isSleeping()) return

    // COMMENT: REMOVED, BUT KEEPING AS REFERENCE CODE IF I NEED TO RESET THE ACTUAL POSITION / ROTATION
    // // randomize the roll position
    // const roll_start_pos = new THREE.Vector3(
    //   randomFloat(-5, 5), // roll left/right position
    //   2, // roll height
    //   6 // how far back to roll
    // )

    // // reset the d20 position and rotation
    // ref_d20_body.current.setTranslation(roll_start_pos, true)
    // ref_d20_body.current.setRotation({ x: 0, y: 0, z: 0, w: 0 }, true)



    const scaling = 1.0

    // reset the d20 prior to rolling
    ref_d20_body.current.setAngvel({ x: 0, y: 0, z: 0 })
    ref_d20_body.current.setLinvel({ x: 0, y: 0, z: 0 })

    // apply a random force and spin
    ref_d20_body.current.applyImpulse({
      x: scaling * randomFloat(-80, 80), // left/right force
      y: scaling * randomFloat(30, 40), // upward force
      z: scaling * randomFloat(-80, 80) // forward force
    }, true)

    ref_d20_body.current.applyTorqueImpulse({
      x: randomFloat(-15, -5), // forward spin
      y: 0,
      z: randomFloat(-10, 10) // left/right spin
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

    dice_roll_value = FACE_ID_LOOKUP[intersect[0].faceIndex]
    console.log('YOU ROLLED A: ', dice_roll_value)
  }

  useImperativeHandle(inner_ref, () => ({ rollD20 }))

  return (
    enabled &&
    <RigidBody
      ref={ref_d20_body}
      colliders='hull'
      position={position ?? [randomFloat(-5, 5), 6, 6]}
      rotation={[Math.random(), 0, Math.random()]}
      mass={1}
      restitution={0.4}
      friction={0.3}

      onSleep={onRollComplete}
      onContactForce={(payload) => { handleDiceSound(payload.totalForceMagnitude) }}
    >
      <group
        ref={ref_d20_mesh}
      >
        <mesh
          castShadow={castShadow}
          geometry={nodes.d20_red_plastic.geometry}
          material={materials['red plastic']}
        />
      </group>
    </RigidBody>
  )
})

export { FACE_ID_LOOKUP }
export default D20