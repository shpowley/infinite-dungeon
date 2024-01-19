import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useSpring, animated } from '@react-spring/three'
import { button, useControls } from 'leva'
import { MONSTERS } from '../common/Monsters'

const FILE_SIGN = './models/sign-compressed.glb'

useGLTF.preload(FILE_SIGN)

const getCanvasTexture = (texture, x, y, scale) => {
  const larger_dimension = Math.max(texture.image.width, texture.image.height)
  const ctx = document.createElement('canvas').getContext('2d')

  ctx.canvas.width = larger_dimension
  ctx.canvas.height = larger_dimension
  ctx.scale(scale, scale)

  ctx.drawImage(
    texture.image,
    x,
    y,
    texture.image.width,
    texture.image.height
  )

  return new THREE.CanvasTexture(ctx.canvas)
}

const SignMaterial = ({ material, texture_url, x, y, scale }) => {
  let texture, canvas_texture

  if (texture_url) {
    texture = useTexture(texture_url)
    canvas_texture = getCanvasTexture(texture, x, y, scale)
  }

  return <meshStandardMaterial
    map={canvas_texture ? canvas_texture : material.map}
    roughness={material.roughness}
    side={material.side}
  />
}

const Sign = ({ castShadow = false, position, rotation, scale, visible = false }) => {
  const ref_mesh_group = useRef()

  const { nodes, materials } = useGLTF(FILE_SIGN)

  const [is_animating, setIsAnimating] = useState(false)

  // COMMENT:
  //  note the syntax for useControls() here as it's a bit different due to the [controls_image, setControlsImage]
  //  'setControlsImage' allows us to set the values of the controls_image object
  const [controls_image, setControlsImage] = useControls(
    'sign board',

    () => ({
      'show/hide': button(() => {
        if (!is_animating) {
          setIsAnimating(true)
        }
      }),

      image: {
        value: 'NONE',
        options: MONSTERS,
        transient: false,

        onChange: value => {
          if (value.path) {
            setControlsImage({
              pos_x: value.x ?? 0,
              pos_y: value.y ?? 0,
              scale: value.scale ?? 1,
            })
          }
        }
      },

      scale: {
        value: 1,
        min: 0.1,
        max: 10,
        step: 0.01,
      },

      pos_x: {
        label: 'position x',
        value: 0,
        min: -1000,
        max: 1000,
        step: 1,
      },

      pos_y: {
        label: 'position y',
        value: 0,
        min: -1000,
        max: 1000,
        step: 1,
      },
    }),

    { collapsed: true, order: 6 }
  )

  // REACT SPRING - SIGN ANIMATION
  const [{ react_spring_y }, react_spring_api] = useSpring(() => ({
    react_spring_y: visible ? 0 : 1,
    config: { mass: 7, tension: 600, friction: 100, precision: 0.0001 },

    onRest: () => {

      // hide the sign when it's below the ground
      // - there's probably a better way to do this with react-spring..
      if (react_spring_y.get() === 1) {
        ref_mesh_group.current.visible = false
      }

      setIsAnimating(false)
    }
  }))

  const sign_animation = react_spring_y.to([0, 1], [0, -3.0])

  const animateSign = () => {
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

  useEffect(() => {
    if (is_animating) {
      animateSign()
    }
  }, [is_animating])

  // <animated.group> is from react-spring
  // - kept separate from <RigidBody> as I'm only animating the mesh
  // - experimented with animating the rapier <RigidBody> kinematic-type, but react-spring is smoother
  //   and is only really used for the dice physics..
  return <>
    <RigidBody
      type='fixed'
      colliders={false}
    >
      <CuboidCollider
        args={[0.95, position[1], 0.18]}
        position={position}
        rotation={rotation}
      />
    </RigidBody>

    <animated.group
      ref={ref_mesh_group}
      position-x={position[0]}
      position-y={sign_animation}
      position-z={position[2]}
      rotation={rotation}
      scale={scale}
      visible={visible}
    >
      <mesh
        castShadow={castShadow}
        geometry={nodes.post_1.geometry}
        material={materials['sign-post']}
      />

      <mesh
        castShadow={castShadow}
        geometry={nodes.post_2.geometry}
      >
        <SignMaterial
          material={materials['paper-sign']}
          texture_url={controls_image.image?.path}
          x={controls_image.pos_x}
          y={controls_image.pos_y}
          scale={controls_image.scale}
        />
      </mesh>
    </animated.group>
  </>
}

export default Sign