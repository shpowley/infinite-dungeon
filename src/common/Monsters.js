const MONSTER_IMAGE_PATH = './images/monsters/'

const MONSTERS = {
  BLUE_SLIME: {
    key: 'BLUE_SLIME',
    label: 'Blue Slime',
    path: MONSTER_IMAGE_PATH + 'blue-slime.webp',
    scale: 1.15,
    x: -90,
    y: -7,
    health: 5,
    attack: 2,
  },

  DEATH_KNIGHT: {
    key: 'DEATH_KNIGHT',
    label: 'Death Knight',
    path: MONSTER_IMAGE_PATH + 'death-knight.webp',
    scale: 1.5,
    x: -22,
    y: -4,
    health: 250,
    attack: 30,
  },

  GIANT_RAT: {
    key: 'GIANT_RAT',
    label: 'Giant Rat',
    path: MONSTER_IMAGE_PATH + 'giant-rat.webp',
    x: -80,
    y: -11,
    health: 50,
    attack: 10,
  },

  GOBLIN: {
    key: 'GOBLIN',
    label: 'Goblin',
    path: MONSTER_IMAGE_PATH + 'goblin.webp',
    scale: 1.1,
    x: -14,
    y: -33,
    health: 20,
    attack: 5,
  },

  GREEN_SLIME: {
    key: 'GREEN_SLIME',
    label: 'Green Slime',
    path: MONSTER_IMAGE_PATH + 'green-slime.webp',
    scale: 1.2,
    x: -17,
    y: -18,
    health: 10,
    attack: 3,
  },

  GRIM_REAPER: {
    key: 'GRIM_REAPER',
    label: 'Grim Reaper',
    path: MONSTER_IMAGE_PATH + 'grim-reaper.webp',
    scale: 1.2,
    x: -14,
    y: -25,
    health: 150,
    attack: 40,
  },

  HOBGOBLIN: {
    key: 'HOBGOBLIN',
    label: 'Hobgoblin',
    path: MONSTER_IMAGE_PATH + 'hobgoblin.webp',
    scale: 1.1,
    x: -73,
    y: -20,
    health: 80,
    attack: 15,
  },

  KOBOLD: {
    key: 'KOBOLD',
    label: 'Kobold',
    path: MONSTER_IMAGE_PATH + 'kobold.webp',
    scale: 1.4,
    x: -30,
    y: -30,
    health: 25,
    attack: 5,
  },

  LIZARDMAN: {
    key: 'LIZARDMAN',
    label: 'Lizardman',
    path: MONSTER_IMAGE_PATH + 'lizard-man.webp',
    scale: 1.05,
    x: -20,
    y: -14,
    health: 40,
    attack: 10,
  },

  MIMIC: {
    key: 'MIMIC',
    label: 'Mimic',
    path: MONSTER_IMAGE_PATH + 'mimic.webp',
    scale: 1.25,
    x: -65,
    y: 4,
    health: 50,
    attack: 12,
  },

  MINOTAUR: {
    key: 'MINOTAUR',
    label: 'Minotaur',
    path: MONSTER_IMAGE_PATH + 'minotaur.webp',
    scale: 1.35,
    x: -56,
    y: -2,
    health: 150,
    attack: 20,
  },

  ORC: {
    key: 'ORC',
    label: 'Orc',
    path: MONSTER_IMAGE_PATH + 'orc.webp',
    scale: 1.1,
    x: -27,
    y: -27,
    health: 60,
    attack: 15,
  },

  PYTHON: {
    key: 'PYTHON',
    label: 'Python',
    path: MONSTER_IMAGE_PATH + 'python.webp',
    scale: 1.2,
    x: -99,
    y: 82,
    health: 30,
    attack: 8,
  },

  RAT: {
    key: 'RAT',
    label: 'Rat',
    path: MONSTER_IMAGE_PATH + 'rat.webp',
    x: -80,
    y: 3,
    health: 10,
    attack: 3,
  },

  SKELETON: {
    key: 'SKELETON',
    label: 'Skeleton',
    path: MONSTER_IMAGE_PATH + 'skeleton.webp',
    scale: 1.05,
    x: -130,
    y: -26,
    health: 30,
    attack: 5,
  },

  SLIME_SKULL: {
    key: 'SLIME_SKULL',
    label: 'Slime Skull',
    path: MONSTER_IMAGE_PATH + 'slime-skull.webp',
    scale: 1.2,
    x: -65,
    y: 0,
    health: 20,
    attack: 5,
  },

  SLIME_ZOMBIE: {
    key: 'SLIME_ZOMBIE',
    label: 'Slime Zombie',
    path: MONSTER_IMAGE_PATH + 'slime-zombie.webp',
    scale: 1.15,
    x: 5,
    y: -7,
    health: 40,
    attack: 10,
  },

  SPIDER: {
    key: 'SPIDER',
    label: 'Spider',
    path: MONSTER_IMAGE_PATH + 'spider.webp',
    scale: 1.2,
    x: -119,
    y: -24,
    health: 8,
    attack: 2,
  },

  TIGER_SPIDER: {
    key: 'TIGER_SPIDER',
    label: 'Tiger Spider',
    path: MONSTER_IMAGE_PATH + 'tiger-spider.webp',
    scale: 1.2,
    x: -128,
    y: -25,
    health: 30,
    attack: 8,
  },

  WERERAT: {
    key: 'WERERAT',
    label: 'Wererat',
    path: MONSTER_IMAGE_PATH + 'were-rat.webp',
    scale: 1.1,
    x: -95,
    y: 2,
    health: 80,
    attack: 15,
  },
}

export { MONSTERS }