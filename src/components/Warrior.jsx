import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { useAnimations, useGLTF } from "@react-three/drei"
import { CylinderCollider, RigidBody } from "@react-three/rapier"
import { useSpring, animated } from '@react-spring/three'
import { button, useControls } from 'leva'
import { ANIMATION_DEFAULTS, LEVA_SORT_ORDER } from "../common/Constants"

const FILE_WARRIOR = './models/warrior-compressed.glb'

useGLTF.preload(FILE_WARRIOR)

/**
 * BUILT-IN MESH ANIMATIONS
 *   idle, idle_block, slash, walk.f, run.f
 */
const MESH_ANIMATIONS = {
  NONE: 'none',
  IDLE: 'idle',
  BLOCK: 'idle_block',
  SLASH: 'slash',
  WALK: 'walk.f',
  RUN: 'run.f',
}

const Warrior = ({ castShadow = false, position, rotation, scale, animation_props = { ...ANIMATION_DEFAULTS }, onConstructComplete }) => {
  const ref_mesh_group = useRef()

  const
    [mesh_animation, setMeshAnimation] = useState(MESH_ANIMATIONS.NONE),
    [is_animating, setIsAnimating] = useState(false) // react-spring animation

  const { nodes, materials, animations } = useGLTF(FILE_WARRIOR)

  // https://github.com/pmndrs/drei?tab=readme-ov-file#useanimations
  const { actions } = useAnimations(animations, nodes._rootJoint)

  // REACT-SPRING ANIMATION
  const [{ react_spring_y }, react_spring_api] = useSpring(() => ({
    react_spring_y: animation_props.visible ? 0 : 1,
    config: { mass: 10, tension: 300, friction: 100, precision: 0.001 },

    onRest: () => {

      // hide the warrior when it's above the ground plane
      if (react_spring_y.get() === 1) {
        ref_mesh_group.current.visible = false
      }

      setIsAnimating(false)

      if (onConstructComplete) {
        onConstructComplete()
      }
    }
  }))

  const warrior_animation = react_spring_y.to([0, 1], [0, 14.0])

  const animateWarrior = () => {
    setIsAnimating(true)

    if (react_spring_y.get() === 0) {
      react_spring_y.set(0)
      react_spring_api.start({ react_spring_y: 1 })
    }
    else {
      ref_mesh_group.current.visible = true
      react_spring_y.set(1)
      react_spring_api.start({ react_spring_y: 0 })
    }
  }

  // LEVA CONTROLS
  const { selected_animation } = useControls(
    'warrior',

    {
      selected_animation: {
        label: 'animation',
        options: MESH_ANIMATIONS,
      }
    },

    { collapsed: true, order: LEVA_SORT_ORDER.WARRIOR }
  )

  const handleMeshAnimation = (animation) => {
    if (mesh_animation !== MESH_ANIMATIONS.NONE) {
      actions[mesh_animation]?.fadeOut(0.5).stop()
      actions[mesh_animation]?.reset()
    }

    switch (animation) {
      case MESH_ANIMATIONS.SLASH:
        actions[animation]?.setLoop(THREE.LoopRepeat, 3)
        break

      case MESH_ANIMATIONS.WALK:
      case MESH_ANIMATIONS.RUN:
        actions[animation]?.setLoop(THREE.LoopOnce)
        break
    }

    if (animation !== MESH_ANIMATIONS.NONE) {
      actions[animation]?.fadeIn(0.2).play()
    }

    setMeshAnimation(animation)
  }

  const isWarriorVisible = () => {
    return react_spring_y.get() === 0
  }

  useEffect(() => {
    handleMeshAnimation(selected_animation)
  }, [selected_animation])

  useEffect(() => {
    if (animation_props.animate && animation_props.visible !== isWarriorVisible() && !is_animating) {
      animateWarrior()
    }
  }, [animation_props])

  return <>
    <RigidBody
      type='fixed'
      colliders={false}
    >
      <CylinderCollider
        args={[1.1, 0.9]}
        position={[position[0], position[1] + 0.3, position[2]]}
        rotation={rotation}
      />
    </RigidBody>

    <animated.group
      ref={ref_mesh_group}

      scale={scale}
      position-x={position[0]}
      position-y={warrior_animation}
      position-z={position[2] + 0.2}
      rotation={rotation}
      visible={isWarriorVisible()}
    >
      <primitive object={nodes._rootJoint} />
      <skinnedMesh
        castShadow={castShadow}
        geometry={nodes.Object_35.geometry}
        material={materials.knight}
        skeleton={nodes.Object_35.skeleton}
      />
    </animated.group>
  </>
}

export default Warrior