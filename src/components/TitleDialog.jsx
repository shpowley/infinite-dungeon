import { Text } from '@react-three/drei'
import { FILE_FONT_BEBAS_NEUE } from "../common/Constants"

const TitleDialog = ({ visible = false, onClick }) => {

  return (
    visible
      ? <group
        scale={0.1}
        visible={visible}
      >
        <Text
          font={FILE_FONT_BEBAS_NEUE}
          color='#b49059'
          position={[0, 0.8, 0]}
          textAlign='center'
          lineHeight={0.9}
          outlineWidth={0.01}
          text={'CARDBOARD\nWARRIOR'}
        />
        <Text
          font={FILE_FONT_BEBAS_NEUE}
          color='#000000'
          position={[0, -0.5, 0]}
          scale={0.45}

          onClick={onClick}
        >
          NEW GAME
        </Text>
      </group>
      : null
  )
}

export default TitleDialog