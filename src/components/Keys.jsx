import { Image } from "@react-three/drei"
import HUDImages from "../common/HUDImages"
import { GAME_PHASE } from "../common/Constants"

const Keys = ({ game_phase = GAME_PHASE.START, pos_x = -0.065, pos_y = -0.33, scale = 0.04 }) => {
  const
    controls_visible = [GAME_PHASE.STANDBY, GAME_PHASE.MOVEMENT, GAME_PHASE.COMBAT].includes(game_phase),
    in_combat = game_phase === GAME_PHASE.COMBAT

  return <group
    scale={scale}
    position={[pos_x, pos_y, 0]}
    visible={controls_visible}
  >
    <Image
      url={in_combat ? HUDImages.DISABLED_BUTTON_NORTH.path : HUDImages.KEY_NORTH.path}
      transparent
    />
    <Image
      url={in_combat ? HUDImages.DISABLED_BUTTON_SOUTH.path : HUDImages.KEY_SOUTH.path}
      transparent
      position={[0, -1.2, 0]}
    />
    <Image
      url={in_combat ? HUDImages.DISABLED_BUTTON_EAST.path : HUDImages.KEY_EAST.path}
      transparent
      position={[1.2, -1.2, 0]}
    />
    <Image
      url={in_combat ? HUDImages.DISABLED_BUTTON_WEST.path : HUDImages.KEY_WEST.path}
      transparent
      position={[-1.2, -1.2, 0]}
    />
    <Image
      url={in_combat ? HUDImages.KEY_ROLL.path : HUDImages.DISABLED_ROLL.path}
      transparent
      position={[3.5, -1.2, 0]}
      scale={HUDImages.KEY_ROLL.scale}
    />
    <Image
      url={HUDImages.KEY_POTION.path}
      transparent
      position={[2.48, 0, 0]}
      scale={HUDImages.KEY_POTION.scale}
    />
  </group>
}

export default Keys