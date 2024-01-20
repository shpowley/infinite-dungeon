import { memo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { useSpring, animated } from '@react-spring/three'

import Door from './Door'
import { button, useControls } from 'leva'
import { ANIMATION_DEFAULTS } from '../common/Constants'

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

const ROOM_ANIMATION_DEFAULTS = {
  ...ANIMATION_DEFAULTS,
  delay: 0,
  friction: 90
}

/**
 * position:
 *  position of the wall physics body and to a large extent the visible wall mesh
 *  the visible wall mesh y-position is also controlled by animation
 *
 * rotation:
 *  position of the wall physics body and the visible wall mesh
 *
 * visible:
 *  whether or not the wall is visible (based on the orbit control camera angle)
 *  this just sets the visibility of the wall mesh (should not affect animation)
 *
 *
 * animation_props:
 *
 *  animate:
 *    triggers wall animation
 *
 *  visible:
 *    true = initial wall position / visibility in view
 *    false = initial wall position / visibility above the ground plane (out of view)
 *
 *  delay:
 *    the delay of the wall animation (react-spring)
 *
 *  friction:
 *    the friction of the wall animation (react-spring)
 */
const Wall = memo(({ position, rotation, visible = true, animation_props = { ...ROOM_ANIMATION_DEFAULTS } }) => {
  const ref_mesh_group = useRef()
  const [is_animating, setIsAnimating] = useState(false)

  const [{ react_spring_y }, react_spring_api] = useSpring(() => ({
    react_spring_y: animation_props.visible ? 0 : 1,
    config: { mass: 6, tension: 400, friction: animation_props.friction },

    onRest: () => {

      // hide the wall when it's above the ground plane
      if (react_spring_y.get() === 1) {
        ref_mesh_group.current.visible = false
      }

      setIsAnimating(false)
    }
  }))

  const wall_animation = react_spring_y.to([0, 1], [position[1], ROOM_EXTENTS.height * 3.5])

  const animateWall = () => {
    setIsAnimating(true)

    if (react_spring_y.get() === 0) {
      react_spring_y.set(0)

      react_spring_api.start({
        to: { react_spring_y: 1 },
        delay: Math.random() * Math.max(animation_props.delay, 800),
      })
    }
    else {
      ref_mesh_group.current.visible = visible
      react_spring_y.set(1)

      react_spring_api.start({
        to: { react_spring_y: 0 },
        delay: Math.random() * Math.max(animation_props.delay, 800),
      })
    }
  }

  const isWallVisible = () => {
    return react_spring_y.get() === 0
  }

  useEffect(() => {
    if (animation_props.animate && animation_props.visible !== isWallVisible() && !is_animating) {
      animateWall()
    }
  }, [animation_props])

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
      visible={visible && isWallVisible()}
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
})

const Floor = memo(() => {
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
})

const Ceiling = memo(() => {
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
})

const Room = ({ receiveShadow = false, ref_orbit_controls, animation_props = { ...ANIMATION_DEFAULTS } }) => {
  let camera = null

  const animation_props_default = {
    ...ROOM_ANIMATION_DEFAULTS,
    ...animation_props
  }

  const

    // wall visibility based on camera angle
    [walls_hidden, setWallsHidden] = useState({
      NORTH: false,
      SOUTH: true,
      EAST: false,
      WEST: false
    }),

    // individual wall animation properties
    [animation_props_north, setAnimationPropsNorth] = useState(animation_props_default),
    [animation_props_south, setAnimationPropsSouth] = useState(animation_props_default),
    [animation_props_east, setAnimationPropsEast] = useState(animation_props_default),
    [animation_props_west, setAnimationPropsWest] = useState(animation_props_default)

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

  // triggered from useEffect()
  const calculateCameraAngle = () => {
    if (camera) {
      let angle_radians = Math.atan2(
        camera.position.x,
        camera.position.z
      )

      const camera_yaw = THREE.MathUtils.radToDeg(angle_radians)

      setWallsHidden(prev => {
        const walls_hidden = {
          SOUTH: calculateRange(0, camera_yaw),
          EAST: calculateRange(90, camera_yaw),
          NORTH: calculateRange(180, camera_yaw),
          WEST: calculateRange(-90, camera_yaw)
        }

        if (walls_hidden.SOUTH !== prev.SOUTH
          || walls_hidden.EAST !== prev.EAST
          || walls_hidden.NORTH !== prev.NORTH
          || walls_hidden.WEST !== prev.WEST) {
          return walls_hidden
        }
        else {
          return prev
        }
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

  useEffect(() => {
    if (animation_props.animate) {
      setAnimationPropsNorth({
        ...animation_props_default,
        ...animation_props
      })

      setAnimationPropsSouth({
        ...animation_props_default,
        ...animation_props
      })

      setAnimationPropsEast({
        ...animation_props_default,
        ...animation_props
      })

      setAnimationPropsWest({
        ...animation_props_default,
        ...animation_props
      })
    }
  }, [animation_props])

  return <>
    <Wall
      id='NORTH'
      position={[0, ROOM_COLLIDER.wall_position_y, -dimension]}
      visible={!walls_hidden.NORTH}
      animation_props={animation_props_north}
    />

    <Wall
      id='SOUTH'
      position={[0, ROOM_COLLIDER.wall_position_y, dimension]}
      rotation={[0, Math.PI, 0]}
      visible={!walls_hidden.SOUTH}
      animation_props={animation_props_south}
    />

    <Wall
      id='EAST'
      position={[dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, -Math.PI * 0.5, 0]}
      visible={!walls_hidden.EAST}
      animation_props={animation_props_east}
    />

    <Wall
      id='WEST'
      position={[-dimension, ROOM_COLLIDER.wall_position_y, 0]}
      rotation={[0, Math.PI * 0.5, 0]}
      visible={!walls_hidden.WEST}
      animation_props={animation_props_west}
    />

    <Ceiling />
    <Floor />
  </>
}

export default Room