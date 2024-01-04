import { CuboidCollider, RigidBody } from "@react-three/rapier"

const THICKNESS_EXTENT = 0.3

const CEILING_COLLIDER = {
  top_extents: [7, THICKNESS_EXTENT, 7],
  top_position_y: 8 + THICKNESS_EXTENT,
}

const Ceiling = () => {
  return <RigidBody
    type='kinematicPosition'
    restitution={0.5}
    friction={0}
    colliders={false}
  >
    <CuboidCollider
      args={CEILING_COLLIDER.top_extents}
      position={[0, CEILING_COLLIDER.top_position_y, 0]}
    />
  </RigidBody>
}

export default Ceiling