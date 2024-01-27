import { memo } from "react"
import * as THREE from 'three'
import { Text } from "@react-three/drei"
import { FILE_FONT_BEBAS_NEUE, GAME_PHASE } from "../common/Constants"

const
  CTX = document.createElement('canvas').getContext('2d'),

  CANVAS_SIZE = {
    width: 256,
    height: 256
  },

  MAP_START = {
    x: 13,
    y: 13
  },

  ROOM_DRAW_SIZE = {
    width: 50,
    height: 50
  },

  PLAYER_DRAW_SIZE = {
    width: 30,
    height: 30
  },

  DRAW_SPACING = 10

const drawMap = (rooms, current_room) => {

  // clear the canvas with white
  CTX.fillStyle = 'white'
  CTX.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)

  // draw the visited rooms (4 x 4 grid of rooms)
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i]

    if (room.is_room && room.visited) {
      const
        room_x = MAP_START.x + (i % 4) * (ROOM_DRAW_SIZE.width + DRAW_SPACING),
        room_y = MAP_START.y + Math.floor(i / 4) * (ROOM_DRAW_SIZE.height + DRAW_SPACING)

      CTX.fillStyle = '#89a8e1'
      CTX.fillRect(room_x, room_y, ROOM_DRAW_SIZE.width, ROOM_DRAW_SIZE.height)

      // draw the player
      if (current_room && current_room.index === i) {
        CTX.fillStyle = '#e18989'
        CTX.fillRect(
          room_x + (ROOM_DRAW_SIZE.width - PLAYER_DRAW_SIZE.width) / 2,
          room_y + (ROOM_DRAW_SIZE.height - PLAYER_DRAW_SIZE.height) / 2,
          PLAYER_DRAW_SIZE.width,
          PLAYER_DRAW_SIZE.height
        )
      }
    }
  }

  // draw the current room

}

CTX.canvas.width = 256
CTX.canvas.height = 256

const StatInfo = memo(({
  game_phase = GAME_PHASE.START,
  aspect_ratio = 1,
  minimap = true,
  data,
  level_data,
  current_room,
  inner_refs
}) => {
  let canvas_texture

  const
    controls_visible = [GAME_PHASE.STANDBY, GAME_PHASE.MOVEMENT].includes(game_phase),
    text_color = 'black'

  if (level_data) {
    drawMap(level_data.rooms, current_room)
    canvas_texture = new THREE.CanvasTexture(CTX.canvas)
  }

  return <group
    scale={0.021}
    position={[0.405 * aspect_ratio, 0.39, 0]}
    visible={controls_visible}
    anchorX={'right'}
    anchorY={'top'}
  >
    {/* FLOOR NUMBER */}
    <Text
      ref={inner_refs?.floor}
      font={FILE_FONT_BEBAS_NEUE}
      color={text_color}
      anchorX={'right'}
    >
      FLOOR: {data?.floor_index ?? 1}
    </Text>

    {/* MINIMAP */}
    <mesh
      visible={minimap}
      position={[-2, -2.8, 0]}
    >
      <planeGeometry
        args={[4, 4]}
      />
      <meshBasicMaterial
        color={'white'}
        map={canvas_texture}
      />
    </mesh>
  </group>
})

export default StatInfo