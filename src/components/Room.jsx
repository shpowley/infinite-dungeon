import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { useSpring, animated } from '@react-spring/three'

import Door from './Door'
import { button, useControls } from 'leva'
import { DIRECTION } from '../common/Constants'

const THICKNESS_EXTENT = 0.3

const ROOM_EXTENTS = {
  width: 8,
  height: 4
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
    ROOM_COLLIDER.wall_extents[1]
  ),
  geometry_plane_floor = new THREE.PlaneGeometry(
    ROOM_COLLIDER.floor_extents[0] * 2,
    ROOM_COLLIDER.floor_extents[2] * 2
  )

const
  material_wall = new THREE.MeshStandardMaterial({ color: '#dbd7d2' }),
  material_floor = new THREE.MeshStandardMaterial({ color: '#93836c' })

let room_receive_shadow = false
let animate_direction // DIRECTION.UP or DIRECTION.DOWN (for use with react-spring animations)

const Wall = ({ position, rotation, visible = true }) => {
  const ref_mesh_group = useRef()

  const [is_animating, setAnimation] = useState(false)

  useControls(
    'walls',
    {
      'show/hide': button(() => {
        if (!is_animating) {
          setAnimation(true)
        }
      })
    },
    { collapsed: true, order: 4 }
  )

  // REACT-SPRING - WALL ANIMATION
  const [{ react_spring_y }, react_spring_api] = useSpring(() => ({
    react_spring_y: visible ? 1 : 0,
    config: { mass: 7, tension: 600, friction: 100, precision: 0.0001 },

    onRest: () => {
      console.log('onRest')

      animate_direction = animate_direction === DIRECTION.DOWN ? DIRECTION.UP : DIRECTION.DOWN
      setAnimation(false)
    }
  }), [])

  const wall_animation = react_spring_y.to([0, 1], [position[1], 10.0])

  const animateWall = () => {
    if (animate_direction === DIRECTION.DOWN) {
      react_spring_y.set(0)
      react_spring_api.start({ react_spring_y: 1 })
    }
    else {
      react_spring_y.set(1)
      react_spring_api.start({ react_spring_y: 0 })
    }
  }

  useEffect(() => {
    if (is_animating) {
      animateWall()
    }
  }, [is_animating])

  useEffect(() => {
    animate_direction = visible ? DIRECTION.UP : DIRECTION.DOWN
  }, [visible])

  return <>
    <RigidBody
      type='fixed'
      restitution={0.5}
      friction={0}
      colliders={false}
    >
      <CuboidCollider
        args={ROOM_COLLIDER.wall_extents}
        position={position}
        rotation={rotation}
      />
    </RigidBody>

    <animated.group
      ref={ref_mesh_group}
      position-x={position[0]}
      position-y={wall_animation}
      position-z={position[2]}
      rotation={rotation}
      visible={visible}
    >
      <Door
        position={[0, -ROOM_EXTENTS.height, 0.35]}
        scale={[1.5, 1.5, 1.5]}
      />
      <mesh
        receiveShadow={room_receive_shadow}
        position={[0, -ROOM_COLLIDER.wall_extents[1] * 0.5, THICKNESS_EXTENT]}
        geometry={geometry_plane_wall}
        material={material_wall}
      />
    </animated.group>
  </>
}

const Floor = () => {
  return <RigidBody
    type='fixed'
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
    type='fixed'
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
  let camera = null

  const [walls_hidden, setWallsHidden] = useState({
    SOUTH: true,
    WEST: false,
    NORTH: false,
    EAST: false
  })

  const dimension = ROOM_EXTENTS.width + THICKNESS_EXTENT

  room_receive_shadow = receiveShadow

  // COMMENT: REASON FOR THE CAMERA ANGLE CALCULATION LOGIC
  // - WALLS ARE AUTOMATICALLY HIDDEN DUE TO BACKFACE CULLING, BUT DOORS ARE NOT
  // - THIS SAME LOGIC COULD HIDE OTHER MESHES "ATTACHED" TO A WALL (E.G. PAINTINGS, FLAGS, TORCHES, ETC.)

  // calculate the camera's angle in degrees
  const calculateRange = (prime_angle, camera_yaw) => {
    let range = 66.5

    const
      prime_angle_upper = prime_angle === 180 ? -180 : prime_angle,
      lower_range_test = camera_yaw > prime_angle - range && camera_yaw <= prime_angle,
      upper_range_test = camera_yaw >= prime_angle_upper && camera_yaw < prime_angle_upper + range

    return lower_range_test || upper_range_test
  }

  const calculateCameraAngle = () => {
    if (camera) {
      let angle_radians = Math.atan2(
        camera.position.x,
        camera.position.z
      )

      const camera_yaw = THREE.MathUtils.radToDeg(angle_radians)

      setWallsHidden({
        SOUTH: calculateRange(0, camera_yaw),
        EAST: calculateRange(90, camera_yaw),
        NORTH: calculateRange(180, camera_yaw),
        WEST: calculateRange(-90, camera_yaw)
      })
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
      visible={!walls_hidden.NORTH}
    />

    <Wall
      position={[0, ROOM_COLLIDER.wall_position_y, dimension]}
      rotation={[0, Math.PI, 0]}
      visible={!walls_hidden.SOUTH}
    />

    <Wall
      position={[dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, -Math.PI * 0.5, 0]}
      visible={!walls_hidden.EAST}
    />

    <Wall
      position={[-dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, Math.PI * 0.5, 0]}
      visible={!walls_hidden.WEST}
    />

    <Ceiling />
    <Floor />
  </>
}

export default Room