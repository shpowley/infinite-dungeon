// - randomly generated levels 'pseudo-code'
// - 4x4 grid of blocks as a max constraint
// - rooms may potentially occupy a block
// - not all blocks will be occupied

// - start / end rooms
//   - require 2 doors (entrance and door to next level)
//   - doors to next/previous level will be on along the border of the 4x4 grid
//   - end room leads to next level
//   - end room will require a key found in another room
//   - may be adjacent to each other
//   - end room will have a level boss

// - 'other' rooms
//   - 1-4 doors leading to other rooms
//   - rooms along the 4x4 grid may not have doors on the border

// - monsters
//   - spawned in 'other' rooms only during the initial level generation
//   - pre-determined number of monsters per level
//   - pre-determined monster types per level
//   - pre-determined boss type per level

// - levels and level-state will be saved to local storage
//   - allows resume game or start new game


const DIRECTION = {
  N: 'N',
  E: 'E',
  S: 'S',
  W: 'W'
}

/**
 * LEVEL BLOCKS
 * 0  1  2  3
 * 4  5  6  7
 * 8  9  10 11
 * 12 13 14 15
 */
const BLOCK_TEMPLATE = {
  index: null,
  is_room: false,
  adjacent_blocks: null,
}

const ROOM_TEMPLATE = {
  doors: {
    N: false,
    E: false,
    S: false,
    W: false,
  },

  monster: null,
  item: null,
}

const PERIMETER_ROOMS = [
  { index: 0, walls: [DIRECTION.N, DIRECTION.W] },   // top left corner
  { index: 1, walls: [DIRECTION.N] },                // top row
  { index: 2, walls: [DIRECTION.N] },                // top row
  { index: 3, walls: [DIRECTION.N, DIRECTION.E] },   // top right corner
  { index: 4, walls: [DIRECTION.W] },                // left column
  { index: 7, walls: [DIRECTION.E] },                // right column
  { index: 8, walls: [DIRECTION.W] },                // left column
  { index: 11, walls: [DIRECTION.E] },               // right column
  { index: 12, walls: [DIRECTION.S, DIRECTION.W] },  // bottom left corner
  { index: 13, walls: [DIRECTION.S] },               // bottom row
  { index: 14, walls: [DIRECTION.S] },               // bottom row
  { index: 15, walls: [DIRECTION.S, DIRECTION.E] }   // bottom right corner
]

const LEVEL_TEMPLATE = new Array(16)
  .fill({ ...BLOCK_TEMPLATE })
  .map((block, index) => {
    const new_block = { ...block }

    new_block.index = index

    switch (index) {
      case 0:
        new_block.adjacent_blocks = [
          { index: 1, direction: DIRECTION.E },
          { index: 4, direction: DIRECTION.S }
        ]
        break

      case 1:
        new_block.adjacent_blocks = [
          { index: 0, direction: DIRECTION.W },
          { index: 2, direction: DIRECTION.E },
          { index: 5, direction: DIRECTION.S }
        ]
        break

      case 2:
        new_block.adjacent_blocks = [
          { index: 1, direction: DIRECTION.W },
          { index: 3, direction: DIRECTION.E },
          { index: 6, direction: DIRECTION.S }
        ]
        break

      case 3:
        new_block.adjacent_blocks = [
          { index: 2, direction: DIRECTION.W },
          { index: 7, direction: DIRECTION.S }
        ]
        break

      case 4:
        new_block.adjacent_blocks = [
          { index: 0, direction: DIRECTION.N },
          { index: 5, direction: DIRECTION.E },
          { index: 8, direction: DIRECTION.S }
        ]
        break

      case 5:
        new_block.adjacent_blocks = [
          { index: 1, direction: DIRECTION.N },
          { index: 4, direction: DIRECTION.W },
          { index: 6, direction: DIRECTION.E },
          { index: 9, direction: DIRECTION.S }
        ]
        break

      case 6:
        new_block.adjacent_blocks = [
          { index: 2, direction: DIRECTION.N },
          { index: 5, direction: DIRECTION.W },
          { index: 7, direction: DIRECTION.E },
          { index: 10, direction: DIRECTION.S }
        ]
        break

      case 7:
        new_block.adjacent_blocks = [
          { index: 3, direction: DIRECTION.N },
          { index: 6, direction: DIRECTION.W },
          { index: 11, direction: DIRECTION.S }
        ]
        break

      case 8:
        new_block.adjacent_blocks = [
          { index: 4, direction: DIRECTION.N },
          { index: 9, direction: DIRECTION.E },
          { index: 12, direction: DIRECTION.S }
        ]
        break

      case 9:
        new_block.adjacent_blocks = [
          { index: 5, direction: DIRECTION.N },
          { index: 8, direction: DIRECTION.W },
          { index: 10, direction: DIRECTION.E },
          { index: 13, direction: DIRECTION.S }
        ]
        break

      case 10:
        new_block.adjacent_blocks = [
          { index: 6, direction: DIRECTION.N },
          { index: 9, direction: DIRECTION.W },
          { index: 11, direction: DIRECTION.E },
          { index: 14, direction: DIRECTION.S }
        ]
        break

      case 11:
        new_block.adjacent_blocks = [
          { index: 7, direction: DIRECTION.N },
          { index: 10, direction: DIRECTION.W },
          { index: 15, direction: DIRECTION.S }
        ]
        break

      case 12:
        new_block.adjacent_blocks = [
          { index: 8, direction: DIRECTION.N },
          { index: 13, direction: DIRECTION.E },
        ]
        break

      case 13:
        new_block.adjacent_blocks = [
          { index: 9, direction: DIRECTION.N },
          { index: 12, direction: DIRECTION.W },
          { index: 14, direction: DIRECTION.E },
        ]
        break

      case 14:
        new_block.adjacent_blocks = [
          { index: 10, direction: DIRECTION.N },
          { index: 13, direction: DIRECTION.W },
          { index: 15, direction: DIRECTION.E },
        ]
        break

      case 15:
        new_block.adjacent_blocks = [
          { index: 11, direction: DIRECTION.N },
          { index: 14, direction: DIRECTION.W },
        ]
    }

    return new_block
  })

// BUG - IF BOTH START AND END ROOMS ARE ADJACENT TO EACH OTHER AND HAVE DOORS TO EACH OTHER -- THIS SHOULD NOT BE ALLOWED
// create a random doors for a room based on adjacent blocks and specified number of doors (don't repeat doors)
const generateDoors = (block, num_doors = 1) => {
  const adjacent_blocks = block.adjacent_blocks
  let door_indices

  // STEP 1 - copy the adjacent array indices [0, 1, 2..] -- not the block index position for the 4x4 level
  if (num_doors >= adjacent_blocks.length) {
    door_indices = [...block.adjacent_blocks.keys()]
  }
  else {
    door_indices = []

    while (door_indices.length < num_doors) {
      const random_index = Math.floor(Math.random() * adjacent_blocks.length)

      if (!door_indices.includes(random_index)) {
        door_indices.push(random_index)
      }
    }
  }

  // STEP 2 - create doors for the adjacent blocks based on the previous step
  door_indices.forEach(door_index => {
    const adjacent_block = adjacent_blocks[door_index]
    block.doors[adjacent_block.direction] = true
  })
}

const createStartRoom = (level, index, prior_room) => {
  level[index] = {
    ...level[index],
    ...ROOM_TEMPLATE,
    doors: {...ROOM_TEMPLATE.doors},
    is_room: true,
    start_room: true
  }

  // level door placement from previous level
  if (prior_room) {
    level[index].doors[prior_room.level_door] = true
    level[index].level_door = prior_room.level_door
  }

  // creat a door to a random adjacent block
  generateDoors(level[index], 1)
}

const createEndRoom = (level, index) => {
  level[index] = {
    ...level[index],
    ...ROOM_TEMPLATE,
    doors: {...ROOM_TEMPLATE.doors},
    is_room: true,
    end_room: true,
    locked: true
  }

  // door placement to next level
  const perimeter_walls = PERIMETER_ROOMS.find(room => room.index === index)?.walls

  if (perimeter_walls) {
    let level_door

    // if more than one wall, randomly choose one
    if (perimeter_walls.length > 1) {
      level_door = perimeter_walls[Math.floor(Math.random() * perimeter_walls.length)]
    }

    // if only one wall, use that one
    else {
      level_door = perimeter_walls[0]
    }

    level[index].doors[level_door] = true
    level[index].level_door = level_door
  }

  // creat a door to a random adjacent block
  generateDoors(level[index], 1)
}

const generateLevel = (prior_room) => {

  // copy the level starter template
  const level = [...LEVEL_TEMPLATE]

  // randomly determine the start room, unless it's the first level
  const start_room_index = prior_room
    ? prior_room.index
    : PERIMETER_ROOMS[Math.floor(Math.random() * PERIMETER_ROOMS.length)].index

  // randomly determine the end room
  const blocked_indices = [start_room_index, ...level[start_room_index].adjacent_blocks.map(block => block.index)]
  let end_room_index = PERIMETER_ROOMS[Math.floor(Math.random() * PERIMETER_ROOMS.length)].index

  while (blocked_indices.includes(end_room_index)) {
    end_room_index = PERIMETER_ROOMS[Math.floor(Math.random() * PERIMETER_ROOMS.length)].index
  }

  console.log('start_room_index', start_room_index)
  console.log('end_room_index', end_room_index)

  createStartRoom(level, start_room_index, prior_room)
  createEndRoom(level, end_room_index)

  // iterate over each block
  level.forEach((block, index) => {

    if (index !== start_room_index && index !== end_room_index) {

      // determine if there are any adjacent rooms with doors connected to this block
      // - if so, this block must be a room with a door to that adjacent room
      const adjacent_blocks_info = level[index].adjacent_blocks

      for (let i = 0; i < adjacent_blocks_info.length; i++) {
        const block_info = adjacent_blocks_info[i]
        const adjacent_block = level[block_info.index]

        if (adjacent_block.is_room) {

          const
            self_info = adjacent_block.adjacent_blocks.find(block => block.index === index),
            connected_door = adjacent_block.doors[self_info.direction]

          if (connected_door && !block.is_room) {
            level[index] = {
              ...level[index],
              ...ROOM_TEMPLATE,
              doors: {...ROOM_TEMPLATE.doors},
              is_room: true
            }

            // create a door to the adjacent block
            level[index].doors[block_info.direction] = true
          }
        }
      }
    }
  })

  return level
}


export { generateLevel }