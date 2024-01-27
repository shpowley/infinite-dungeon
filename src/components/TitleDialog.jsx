import { Text } from '@react-three/drei'
import { FILE_FONT_BEBAS_NEUE } from "../common/Constants"

const TitleDialog = ({ onClick }) => {

  return <group
    scale={0.1}
  >
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#b49059'
      position={[0, 2.8, 0]}
      textAlign='center'
      lineHeight={0.9}
      outlineWidth={0.01}
      text={'CARDBOARD\nWARRIOR'}
    />
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#3680ff'
      position={[0, 1.3, 0]}
      scale={0.45}

      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      START NEW GAME
    </Text>
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#000000'
      position={[-1.75, 0.7, 0]}
      scale={0.16}
      anchorY={'top'}
      anchorX={'left'}
      textAlign={'left'}
      text={'KEYBOARD CONTROLS:\n\nMOVE NORTH [W / UP ARROW]\nMOVE WEST [A / LEFT ARROW]\nMOVE SOUTH [S / DOWN ARROW]\nMOVE EAST [D / RIGHT ARROW]\n\nROLL DICE [SPACE]\n\nCONSUME HEALTH POTION [1]'}
    />
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#000000'
      position={[0.2, 0.7, 0]}
      scale={0.16}
      anchorY={'top'}
      textAlign='left'
      anchorX={'left'}
      text={'MOUSE / TOUCH CONTROLS:\n\nTAP FLOOR DIRECTION ARROWS\nOR VISIBLE KEYS CONTROLS\n\nMINIMAP:\nSHOWS WHERE YOU ARE ON\nTHE CURRENT MAP.'}
    />
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#000000'
      position={[0, -1.7, 0]}
      scale={0.16}
      anchorY={'top'}
      textAlign={'left'}
      text={'EXPLORE EACH RANDOMLY GENERATED 4x4 DUNGEON FLOOR, FIND THE KEY\nTO FIGHT FLOOR BOSS AND PROCEED TO THE NEXT FLOOR.\n\n*PLEASE NOTE THAT IT IS RECOMMENDED TO LET THE ANIMATIONS FINISH\nCOMPLETELY BEFORE PERFORMING THE NEXT PLAYER ACTION.\n\nE.G. WAIT FOR THE DICE TO STOP ROLLING\nAND THE ROOM FINISH RE-CONSTRUCTING.'}
    />
    <Text
      font={FILE_FONT_BEBAS_NEUE}
      color='#3680ff'
      position={[0, -3.6, 0]}
      scale={0.23}
      anchorY={'top'}
      textAlign={'left'}
      text={'GITHUB / ASSET ATTRIBUTIONS'}

      onClick={() => window.open('https://github.com/shpowley/cardboard-warrior/blob/master/credits.txt', '_blank')}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    />
  </group>
}

export default TitleDialog