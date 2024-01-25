import { Text } from "@react-three/drei"
import { FILE_FONT_BEBAS_NEUE, GAME_PHASE } from "../common/Constants"

const StatInfo = ({ game_phase = GAME_PHASE.START, aspect_ratio = 1, data, inner_refs }) => {
  const
    controls_visible = [GAME_PHASE.STANDBY, GAME_PHASE.MOVEMENT, GAME_PHASE.COMBAT].includes(game_phase),
    text_color = 'black'

  return <group
    scale={0.021}
    position={[-0.407 * aspect_ratio, -0.39, 0]}
    visible={controls_visible}
    anchorX={'left'}
    anchorY={'bottom'}
  >
    <Text
      ref={inner_refs?.floor}
      font={FILE_FONT_BEBAS_NEUE}
      color={text_color}
      anchorX={'left'}
      position={[0, 1.4, 0]}
    >
      FLOOR: {data?.floor_index ?? 1}
    </Text>
    <Text
      ref={inner_refs?.kills}
      font={FILE_FONT_BEBAS_NEUE}
      color={text_color}
      anchorX={'left'}
    >
      KILL COUNT: {data?.kill_count ?? 0}
    </Text>
  </group>
}

export default StatInfo