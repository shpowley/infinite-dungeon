import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import { MONSTERS } from '../common/Monsters'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

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

const Sign = ({ castShadow = false, position, rotation, scale }) => {
  const { nodes, materials } = useGLTF(FILE_SIGN)

  const [controls_image, setControlsImage] = useControls(
    'sign board',

    () => ({
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

    { collapsed: true }
  )

  return <RigidBody
    type='kinematicPosition'
    colliders={false}
  >
    <CuboidCollider
      args={[0.95, 2.6, 0.18]}
      position={position}
      rotation={rotation}
    >
      <group
        position={[0, 0, -0.05]}
        scale={scale}
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
      </group>
    </CuboidCollider>
  </RigidBody>
}

export default Sign