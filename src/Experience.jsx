import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { CuboidCollider, Physics, RigidBody, quat, vec3 } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import D20, { FACE_ID_LOOKUP } from './components/D20'


const Experience = () => {
  const
    ref_d20_body = useRef(),
    ref_d20_mesh = useRef()

  const [dice_sound] = useState({
    is_playing: false,
    media: new Audio('/sounds/hit.mp3'),
  })

  let d20_start = {
    pos: 0,
    quatertion: 0,
  }

  const randomFloat = (min, max) => Math.random() * (max - min) + min

  const rollD20 = () => {
    if (!ref_d20_body.current) return

    // randomize the roll position
    const roll_start_pos = new Vector3(
      randomFloat(-5, 5), // roll left/right position
      6, // roll height
      6 // how far back to roll
    )

    // reset the d20
    ref_d20_body.current.setTranslation(roll_start_pos, true)
    ref_d20_body.current.setRotation(d20_start.quatertion, true)
    ref_d20_body.current.setAngvel({ x: 0, y: 0, z: 0 })
    ref_d20_body.current.setLinvel({ x: 0, y: 0, z: 0 })

    // apply a random force and spin
    ref_d20_body.current.applyImpulse({
      x: randomFloat(-100, 100), // left/right force
      y: randomFloat(-70, 10), // upward force
      z: randomFloat(-150, -80) // forward force
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
    raycaster.set(new THREE.Vector3(d20_position.x, d20_position.y + 1, d20_position.z), new THREE.Vector3(0, -1, 0))

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

  // save the initial position and rotation of the d20
  useEffect(() => {
    if (ref_d20_body.current) {
      d20_start.pos = vec3(ref_d20_body.current.translation())
      d20_start.quatertion = quat(ref_d20_body.current.rotation())
    }
  }, [])

  return <>

    <Perf position='top-left' />

    <OrbitControls makeDefault />

    <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
    <ambientLight intensity={1.5} />

    <Physics debug={false} >

      {/* D20 */}
      <RigidBody
        ref={ref_d20_body}
        colliders='hull'
        position={[0, 8, 0]}
        onClick={rollD20}
        onSleep={onRollComplete}
        onContactForce={(payload) => { handleDiceSound(payload.totalForceMagnitude) }}
        mass={1}
        restitution={0.2}
        friction={0.3}
      >
        <D20
          child_ref={ref_d20_mesh}
          castShadow
        // onClick={testFace}
        />

      </RigidBody>

      {/* WALLS + TOP */}
      <RigidBody
        type='fixed'
        restitution={0.1}
        friction={0.3}
      >
        <CuboidCollider
          args={[7.3, 4, 0.3]}
          position={[0, 4.3, -7.7]}
        />
        <CuboidCollider
          args={[7.3, 4, 0.3]}
          position={[0, 4.3, 7.7]}
        />
        <CuboidCollider
          args={[7.3, 4, 0.3]}
          position={[7.7, 4.3, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <CuboidCollider
          args={[7.3, 4, 0.3]}
          position={[-7.7, 4.3, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* TOP */}
        <CuboidCollider
          args={[7.3, 0.2, 7.3]}
          position={[0, 8.6, 0]}
        />
      </RigidBody>

      {/* GROUND */}
      <RigidBody
        type='fixed'
        restitution={0.1}
        friction={0.3}
      >
        <mesh receiveShadow position-y={0} visible={true}>
          <boxGeometry args={[16, 0.5, 16]} />
          <meshStandardMaterial color='greenyellow' />
        </mesh>
      </RigidBody>

    </Physics>

  </>
}

export default Experience