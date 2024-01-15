import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { useAnimations, useGLTF } from "@react-three/drei"
import { CylinderCollider, RigidBody } from "@react-three/rapier"
import { useControls } from 'leva'

const FILE_WARRIOR = './models/warrior-compressed.glb'

useGLTF.preload(FILE_WARRIOR)

const ANIMATION_OPTIONS = {
  NONE: 'none',
  IDLE: 'idle',
  BLOCK: 'idle_block',
  SLASH: 'slash',
  WALK: 'walk.f',
  RUN: 'run.f',
}

/**
 * ANIMATIONS
 *   idle, idle_block, slash, walk.f, run.f
 */

/**
 * SCALING NEEDS TO BE DONE HERE AS THE COLLIDER IS ALSO AFFECTED
 */
const Warrior = ({ castShadow = false, position, rotation }) => {
  const ref_warrior = useRef()
  const [current_animation, setCurrentAnimation] = useState(ANIMATION_OPTIONS.NONE)
  const { nodes, materials, animations } = useGLTF(FILE_WARRIOR)

  // https://github.com/pmndrs/drei?tab=readme-ov-file#useanimations
  const { actions } = useAnimations(animations, nodes._rootJoint)

  const { selected_animation } = useControls(
    'warrior',

    {
      selected_animation: {
        label: 'animation',
        options: ANIMATION_OPTIONS,
      }
    },

    { collapsed: true }
  )

  const handleAnimation = (animation) => {
    if (current_animation !== ANIMATION_OPTIONS.NONE) {
      actions[current_animation]?.fadeOut(0.5).stop()
      actions[current_animation]?.reset()
    }

    switch (animation) {
      case ANIMATION_OPTIONS.SLASH:
        actions[animation]?.setLoop(THREE.LoopRepeat, 3)
        break

      case ANIMATION_OPTIONS.WALK:
      case ANIMATION_OPTIONS.RUN:
        actions[animation]?.setLoop(THREE.LoopOnce)
        break
    }

    if (animation !== ANIMATION_OPTIONS.NONE) {
      actions[animation]?.fadeIn(0.2).play()
    }

    setCurrentAnimation(animation)
  }

  useEffect(() => {
    handleAnimation(selected_animation)
  }, [selected_animation])

  return <RigidBody
    type='kinematicPosition'
    colliders={false}
  >
    <CylinderCollider
      args={[position[1], 0.7]}
      position={position}
      rotation={rotation}
    >
      <group
        ref={ref_warrior}
        position={[0.2, -position[1], -0.15]}
      >
        <primitive object={nodes._rootJoint} />
        <skinnedMesh
          castShadow={castShadow}
          geometry={nodes.Object_35.geometry}
          material={materials.knight}
          skeleton={nodes.Object_35.skeleton}
        />
      </group>
    </CylinderCollider>
  </RigidBody>
}

export default Warrior