import { CuboidCollider, RigidBody } from "@react-three/rapier"

const THICKNESS_EXTENT = 0.3

const FLOOR_COLLIDER = {
  floor_extents: [7, THICKNESS_EXTENT, 7],
  floor_position_y: -THICKNESS_EXTENT,
}

const Floor = (props) => {
  return <RigidBody
    type='kinematicPosition'
    restitution={0.5}
    friction={0}
    colliders={false}
  >
    <CuboidCollider
      args={FLOOR_COLLIDER.floor_extents}
      position={[0, FLOOR_COLLIDER.floor_position_y, 0]}
      restitution={0.4}
      friction={0.3}
    >
      <mesh
        receiveShadow
        position={[0, THICKNESS_EXTENT, 0]}
        rotation={[-Math.PI * 0.5, 0, 0]}
      >
        <planeGeometry args={[
          FLOOR_COLLIDER.floor_extents[0] * 2,
          FLOOR_COLLIDER.floor_extents[2] * 2
        ]} />
        <meshStandardMaterial color='#dbd7d2' />
      </mesh>
    </CuboidCollider>
  </RigidBody>
}

export default Floor