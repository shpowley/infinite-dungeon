import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from "@react-three/rapier"

import Door from './Door'

const THICKNESS_EXTENT = 0.3

const ROOM_EXTENTS = {
  width: 7,
  height: 3
}

const ROOM_COLLIDER = {
  wall_extents: [ROOM_EXTENTS.width, ROOM_EXTENTS.height, THICKNESS_EXTENT],
  wall_position_y: ROOM_EXTENTS.height,

  floor_extents: [ROOM_EXTENTS.width, THICKNESS_EXTENT, ROOM_EXTENTS.width],
  floor_position_y: -THICKNESS_EXTENT,

  top_extents: [ROOM_EXTENTS.width, THICKNESS_EXTENT, ROOM_EXTENTS.width],
  top_position_y: ROOM_EXTENTS.height * 2 + THICKNESS_EXTENT,
}

const
  geometry_plane_wall = new THREE.PlaneGeometry(
    ROOM_COLLIDER.wall_extents[0] * 2,
    ROOM_COLLIDER.wall_extents[1] * 2
  ),
  geometry_plane_floor = new THREE.PlaneGeometry(
    ROOM_COLLIDER.floor_extents[0] * 2,
    ROOM_COLLIDER.floor_extents[2] * 2
  )

const
  material_wall = new THREE.MeshStandardMaterial({ color: '#dbd7d2' }),
  material_floor = new THREE.MeshStandardMaterial({ color: '#dbd7d2' })

let room_receive_shadow = false

const Wall = (props) => {
  return <RigidBody
    type='kinematicPosition'
    restitution={0.5}
    friction={0}
    colliders={false}
  >
    <CuboidCollider
      args={ROOM_COLLIDER.wall_extents}
      position={props.position}
      rotation={props.rotation}
    >
      <Door
        position={[0, -ROOM_EXTENTS.height, 0.35]}
        scale={[1.2, 1.2, 1.2]}
      />
      <mesh
        receiveShadow={room_receive_shadow}
        position={[0, 0, THICKNESS_EXTENT]}
        geometry={geometry_plane_wall}
        material={material_wall}
      />
    </CuboidCollider>
  </RigidBody>
}

const Floor = () => {
  return <RigidBody
    type='kinematicPosition'
    restitution={0.5}
    friction={0}
    colliders={false}
  >
    <CuboidCollider
      args={ROOM_COLLIDER.floor_extents}
      position={[0, ROOM_COLLIDER.floor_position_y, 0]}
      restitution={0.4}
      friction={0.3}
    >
      <mesh
        receiveShadow={room_receive_shadow}
        position={[0, THICKNESS_EXTENT, 0]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        geometry={geometry_plane_floor}
        material={material_floor}
      />
    </CuboidCollider>
  </RigidBody>
}

const Ceiling = () => {
  return <RigidBody
    type='kinematicPosition'
    restitution={0.5}
    friction={0}
    colliders={false}
  >
    <CuboidCollider
      args={ROOM_COLLIDER.top_extents}
      position={[0, ROOM_COLLIDER.top_position_y, 0]}
    />
  </RigidBody>
}

const Room = ({ receiveShadow = false, ref_orbit_controls }) => {
  const [camera_angle, setCameraAngle] = useState(0)

  let camera = null

  const dimension = ROOM_EXTENTS.width + THICKNESS_EXTENT

  room_receive_shadow = receiveShadow

  // calculate the camera's angle in degrees (-180 to 0 to 180) based on the camera's position
  const calculateCameraAngle = () => {
    if (camera) {
      const new_camera_angle = THREE.MathUtils.radToDeg(
        Math.atan2(
          camera.position.x,
          camera.position.z
        )
      )

      setCameraAngle(new_camera_angle)
    }
  }

  useEffect(() => {
    camera = ref_orbit_controls.current?.object

    // COMMENT:
    // - note that the camera angle calculation is done here in the room component vs. in the experience component
    //   this is because doing so in the experience component requires storing the camera angle in a state variable
    //   and then passing that state variable to the room component
    //   -- THIS CAUSES A LOT OF UNNECESSARY RE-RENDERS ..ON THE D20 SPECIFICALLY
    ref_orbit_controls.current.addEventListener('change', calculateCameraAngle)

    return () => {
      ref_orbit_controls.current.removeEventListener('change', calculateCameraAngle)
    }
  }, [ref_orbit_controls])

  return <>
    <Wall
      position={[0, ROOM_COLLIDER.wall_position_y, -dimension]}
    />

    <Wall
      position={[0, ROOM_COLLIDER.wall_position_y, dimension]}
      rotation={[0, Math.PI, 0]}
    />

    <Wall
      position={[dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, -Math.PI * 0.5, 0]}
    />

    <Wall
      position={[-dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, Math.PI * 0.5, 0]}
    />

    <Ceiling />
    <Floor />
  </>
}

export default Room