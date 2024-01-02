import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Physics, RigidBody, quat, vec3 } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import D20 from './components/D20'



const Experience = () => {
  const ref_d20 = useRef()
  const ref_d20_mesh = useRef()

  let d20_start = {
    pos: 0,
    quatertion: 0,
  }

  const randomFloat = (min, max) => Math.random() * (max - min) + min

  const rollD20 = () => {

    // randomize the roll position
    const roll_pos = new Vector3(
      d20_start.pos.x + randomFloat(-3, 3), // roll left/right position
      d20_start.pos.y + randomFloat(-3, 1), // roll height
      d20_start.pos.z + randomFloat(8, 12) // how far back to roll
    )

    // reset the d20
    ref_d20.current.setLinvel({ x: 0, y: 0, z: 0 })
    ref_d20.current.setAngvel({ x: 0, y: 0, z: 0 })
    ref_d20.current.setTranslation(roll_pos, true)
    ref_d20.current.setRotation(d20_start.quatertion, true)

    // apply a random force and spin
    ref_d20.current.applyImpulse({
      x: randomFloat(-10, 10), // left/right force
      y: 0,
      z: randomFloat(-30, -15) // forward force
    }, true)

    ref_d20.current.applyTorqueImpulse({
      x: randomFloat(-7, -4), // forward spin
      y: 0,
      z: randomFloat(-2, 2) // left/right spin
    }, true)
  }

  const onRollComplete = () => {
    console.log('onRollComplete')

    // get the face of the d20 that is facing up
    // const d20_position = ref_d20_mesh.current.translation()
    const d20_position = ref_d20_mesh.current.getWorldPosition(new THREE.Vector3())
    // console.log('d20_position', d20_position)

    const raycaster = new THREE.Raycaster()
    raycaster.set(new THREE.Vector3(d20_position.x, d20_position.y + 1, d20_position.z), new THREE.Vector3(0, -1, 0))
    const intersect = raycaster.intersectObject(ref_d20_mesh.current, true)

    console.log('intersect', intersect)
  }

  // save the initial position and rotation of the d20
  useEffect(() => {
    if (ref_d20.current) {
      d20_start.pos = vec3(ref_d20.current.translation())
      d20_start.quatertion = quat(ref_d20.current.rotation())
    }

    if (ref_d20_mesh.current) {
      ref_d20_mesh.current.switchGeometry()
    }
  }, [])

  return <>

    <Perf position='top-left' />

    <OrbitControls makeDefault />

    <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
    <ambientLight intensity={1.5} />

    <Physics debug={true} >



      {/* D20 */}
      <RigidBody
        ref={ref_d20}
        colliders='hull'
        position={[0, 8, 0]}
        // onSleep={onRollComplete}
        restitution={0.2}
        // friction={0.5}
        // canSleep={false}
      >
        <D20
          child_ref={ref_d20_mesh}
          castShadow
          onClick={rollD20}
        />

      </RigidBody>

      {/* WALL */}
      <RigidBody>
        <mesh castShadow position={[0, 6, -7.7]}>
          <boxGeometry args={[16, 4, 0.6]} />
          <meshStandardMaterial color='mediumpurple' />
        </mesh>
      </RigidBody>

      {/* GROUND */}
      <RigidBody type='fixed'>
        <mesh receiveShadow position-y={0} visible={true}>
          <boxGeometry args={[16, 0.5, 16]} />
          <meshStandardMaterial color='greenyellow' />
        </mesh>
      </RigidBody>

    </Physics>

  </>
}

export default Experience