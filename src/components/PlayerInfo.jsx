import { Image, Text } from "@react-three/drei"
import { FILE_FONT_BEBAS_NEUE, GAME_PHASE } from "../common/Constants"
import HUDImages from "../common/HUDImages"
import { memo } from "react"

const PlayerInfo = memo(({ game_phase = GAME_PHASE.START, aspect_ratio = 1, data, inner_refs }) => {
  const
    controls_visible = [GAME_PHASE.STANDBY, GAME_PHASE.MOVEMENT, GAME_PHASE.COMBAT].includes(game_phase),
    text_color = 'black'

  return <group
    scale={0.021}
    position={[-0.407 * aspect_ratio, 0.39, 0]}
    visible={controls_visible}
    anchorX={'left'}
    anchorY={'top'}
  >
    <Text
      ref={inner_refs?.health}
      font={FILE_FONT_BEBAS_NEUE}
      color={text_color}
      anchorX={'left'}
    >
      CARDBOARD WARRIOR
    </Text>

    {/* HEALTH POINTS */}
    <group
      position={[0.7, -1.4, 0]}
    >
      <Image
        url={HUDImages.HEART.path}
        transparent
        scale={HUDImages.HEART.scale}
      />
      <Text
        ref={inner_refs?.health}
        font={FILE_FONT_BEBAS_NEUE}
        color={text_color}
        position={[0.7, -0.1, 0]}
        anchorX={'left'}
      >
        {data?.health ?? 0} HP
      </Text>
    </group>

    {/* ATTACK */}
    <group
      position={[0.7, -2.8, 0]}
    >
      <Image
        url={HUDImages.SWORD.path}
        transparent
        scale={HUDImages.SWORD.scale}
      />
      <Text
        font={FILE_FONT_BEBAS_NEUE}
        color={text_color}
        position={[0.7, -0.1, 0]}
        anchorX={'left'}
      >
        {data?.attack ?? 0} ATTACK
      </Text>
    </group>

    {/* POTIONS */}
    <group
      position={[1, -4.2, 0]}
    >
      <Image
        url={HUDImages.POTIONS.path}
        transparent
        scale={HUDImages.POTIONS.scale}
      />
      <Text
        ref={inner_refs?.potions}
        font={FILE_FONT_BEBAS_NEUE}
        color={text_color}
        position={[0.9, -0.1, 0]}
        anchorX={'left'}
      >
        {data?.potions ?? 0}
      </Text>
    </group>

    {/* GOLD */}
    <group
      position={[1.02, -5.6, 0]}
    >
      <Image
        url={HUDImages.COINS.path}
        transparent
        scale={HUDImages.COINS.scale}
      />
      <Text
        ref={inner_refs?.gold}
        font={FILE_FONT_BEBAS_NEUE}
        color={text_color}
        position={[1.0, -0.05, 0]}
        anchorX={'left'}
      >
        {data?.gold ?? 0}
      </Text>
    </group>

    <Image
      ref={inner_refs?.key}
      visible={data?.key ?? false}
      url={HUDImages.KEY.path}
      transparent
      scale={HUDImages.KEY.scale}
      position={[1.1, -7, 0]}
    />
  </group>
})

export default PlayerInfo