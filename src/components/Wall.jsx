import { CuboidCollider, RigidBody } from "@react-three/rapier"

const THICKNESS_EXTENT = 0.3

const ROOM_COLLIDER = {
  wall_extents: [7, 4, THICKNESS_EXTENT],
  wall_position_y: 4,
}

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
      <mesh
        receiveShadow
        position={[0, 0, THICKNESS_EXTENT]}
      >
        <planeGeometry args={[
          ROOM_COLLIDER.wall_extents[0] * 2,
          ROOM_COLLIDER.wall_extents[1] * 2]
        } />
        <meshStandardMaterial color='#dbd7d2' />
      </mesh>
    </CuboidCollider>
  </RigidBody>
}

export { ROOM_COLLIDER }
export default Wall