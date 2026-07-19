import { SpellingWord, BackgroundTint, TextSize, LetterSpacing, SelectedFont, UserSettings } from './types';

export const WORD_DATABASE: SpellingWord[] = [
  {
    id: 'w1',
    word: 'rabbit',
    chunks: ['rab', 'bit'],
    level: 'easy',
    category: 'Animals 🐾',
    sentence: 'The fluffy rabbit hopped across the green grass.',
    hint: 'A soft, long-eared animal that loves eating carrots.',
    emoji: '🐰'
  },
  {
    id: 'w2',
    word: 'garden',
    chunks: ['gar', 'den'],
    level: 'easy',
    category: 'Nature 🌱',
    sentence: 'We planted red tomatoes in the garden.',
    hint: 'An outdoor place where beautiful flowers and veggies grow.',
    emoji: '🏡'
  },
  {
    id: 'w3',
    word: 'sunshine',
    chunks: ['sun', 'shine'],
    level: 'medium',
    category: 'Nature 🌱',
    sentence: 'Warm sunshine filled the whole bedroom.',
    hint: 'The bright, yellow light that comes from the sun.',
    emoji: '☀️'
  },
  {
    id: 'w4',
    word: 'puppy',
    chunks: ['pup', 'py'],
    level: 'easy',
    category: 'Animals 🐾',
    sentence: 'The playful puppy wagged its tail when it saw us.',
    hint: 'A cute, friendly baby dog.',
    emoji: '🐶'
  },
  {
    id: 'w5',
    word: 'kitten',
    chunks: ['kit', 'ten'],
    level: 'easy',
    category: 'Animals 🐾',
    sentence: 'A tiny kitten was sleeping soundly in the laundry basket.',
    hint: 'A sweet baby cat that goes meow.',
    emoji: '🐱'
  },
  {
    id: 'w6',
    word: 'banana',
    chunks: ['ba', 'nan', 'a'],
    level: 'easy',
    category: 'Food 🍌',
    sentence: 'I peeled a yellow banana for my afternoon snack.',
    hint: 'A sweet, yellow fruit that monkeys love to peel.',
    emoji: '🍌'
  },
  {
    id: 'w7',
    word: 'apple',
    chunks: ['ap', 'ple'],
    level: 'easy',
    category: 'Food 🍌',
    sentence: 'She took a crunchy bite of the sweet red apple.',
    hint: 'A round fruit that can be red, green, or yellow.',
    emoji: '🍎'
  },
  {
    id: 'w8',
    word: 'water',
    chunks: ['wa', 'ter'],
    level: 'easy',
    category: 'Nature 🌱',
    sentence: 'Always drink plenty of cool water on a hot day.',
    hint: 'The clear liquid we drink and swim in.',
    emoji: '💧'
  },
  {
    id: 'w9',
    word: 'pencil',
    chunks: ['pen', 'cil'],
    level: 'medium',
    category: 'School 🎒',
    sentence: 'Use a sharp pencil to draw your picture carefully.',
    hint: 'Something wooden with graphite that you use to write or sketch.',
    emoji: '✏️'
  },
  {
    id: 'w10',
    word: 'teacher',
    chunks: ['teach', 'er'],
    level: 'medium',
    category: 'School 🎒',
    sentence: 'The friendly teacher read us a very funny book.',
    hint: 'An amazing helper who guides you to learn at school.',
    emoji: '👩‍🏫'
  },
  {
    id: 'w11',
    word: 'school',
    chunks: ['schoo', 'l'],
    level: 'easy',
    category: 'School 🎒',
    sentence: 'We ride the big yellow bus to school every morning.',
    hint: 'The exciting building where you go to learn and play with friends.',
    emoji: '🏫'
  },
  {
    id: 'w12',
    word: 'rainbow',
    chunks: ['rain', 'bow'],
    level: 'medium',
    category: 'Nature 🌱',
    sentence: 'A beautiful rainbow appeared right after the storm passed.',
    hint: 'A colorful arc of red, orange, yellow, green, blue, and purple in the sky.',
    emoji: '🌈'
  },
  {
    id: 'w13',
    word: 'rocket',
    chunks: ['rock', 'et'],
    level: 'easy',
    category: 'Space 🚀',
    sentence: 'The silver rocket blasted off toward the stars.',
    hint: 'A super fast vehicle that travels into outer space.',
    emoji: '🚀'
  },
  {
    id: 'w14',
    word: 'dinosaur',
    chunks: ['di', 'no', 'saur'],
    level: 'hard',
    category: 'Animals 🐾',
    sentence: 'The huge dinosaur stomped loudly on the muddy ground.',
    hint: 'A giant prehistoric creature that lived millions of years ago.',
    emoji: '🦕'
  },
  {
    id: 'w15',
    word: 'happy',
    chunks: ['hap', 'py'],
    level: 'easy',
    category: 'Feelings 😊',
    sentence: 'A big, bright smile showed that he was very happy.',
    hint: 'The warm feeling of joy, smiles, and laughter.',
    emoji: '😊'
  },
  {
    id: 'w16',
    word: 'family',
    chunks: ['fam', 'i', 'ly'],
    level: 'medium',
    category: 'Family 🏡',
    sentence: 'We love to play board games together with our family.',
    hint: 'The wonderful people who love you and care for you.',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    id: 'w17',
    word: 'summer',
    chunks: ['sum', 'mer'],
    level: 'easy',
    category: 'Nature 🌱',
    sentence: 'I love building giant sandcastles during the summer.',
    hint: 'The warmest season of the year with long, sunny days.',
    emoji: '☀️'
  },
  {
    id: 'w18',
    word: 'winter',
    chunks: ['win', 'ter'],
    level: 'easy',
    category: 'Nature 🌱',
    sentence: 'We rolled a giant snowball to make a snowman in the winter.',
    hint: 'The coldest, snowy season of the year when you wear cozy coats.',
    emoji: '❄️'
  },
  {
    id: 'w19',
    word: 'friend',
    chunks: ['fri', 'end'],
    level: 'medium',
    category: 'Family 🏡',
    sentence: 'My best friend loves to swing with me on the playground.',
    hint: 'A special pal you enjoy playing and sharing with.',
    emoji: '🤗'
  },
  {
    id: 'w20',
    word: 'planet',
    chunks: ['plan', 'et'],
    level: 'medium',
    category: 'Space 🚀',
    sentence: 'Earth is the beautiful blue planet we live on.',
    hint: 'A large, round body in space that travels around a star.',
    emoji: '🪐'
  },
  {
    id: 'w21',
    word: 'window',
    chunks: ['win', 'dow'],
    level: 'easy',
    category: 'School 🎒',
    sentence: 'I peeked out the window to watch the busy squirrels.',
    hint: 'An opening in a wall filled with clear glass to let light in.',
    emoji: '🪟'
  },
  {
    id: 'w22',
    word: 'forest',
    chunks: ['for', 'est'],
    level: 'easy',
    category: 'Nature 🌱',
    sentence: 'Tall, green trees grow close together in the deep forest.',
    hint: 'A large area covered in trees, bushes, and wild animals.',
    emoji: '🌲'
  },
  {
    id: 'w23',
    word: 'doctor',
    chunks: ['doc', 'tor'],
    level: 'easy',
    category: 'School 🎒',
    sentence: 'The kind doctor listened to my heartbeat with a stethoscope.',
    hint: 'A medical helper who heals you when you feel sick.',
    emoji: '🩺'
  },
  {
    id: 'w24',
    word: 'purple',
    chunks: ['pur', 'ple'],
    level: 'medium',
    category: 'Art 🎨',
    sentence: 'Grapes can be green or a beautiful bright purple.',
    hint: 'A color you get by mixing red paint and blue paint together.',
    emoji: '🍇'
  },
  {
    id: 'w25',
    word: 'bubble',
    chunks: ['bub', 'ble'],
    level: 'easy',
    category: 'Action Words 🏃',
    sentence: 'The soapy bubble popped right when it touched my nose.',
    hint: 'A thin sphere of liquid enclosing air, floating and shiny.',
    emoji: '🫧'
  },
  {
    id: 'w26',
    word: 'monkey',
    chunks: ['mon', 'key'],
    level: 'medium',
    category: 'Animals 🐾',
    sentence: 'The silly monkey swung from one green vine to another.',
    hint: 'An active, long-tailed animal that loves swinging and eating bananas.',
    emoji: '🐒'
  },
  {
    id: 'w27',
    word: 'cookie',
    chunks: ['coo', 'kie'],
    level: 'easy',
    category: 'Food 🍌',
    sentence: 'He dipped his sweet chocolate chip cookie in cold milk.',
    hint: 'A round, baked sweet treat with chocolate chips or raisins.',
    emoji: '🍪'
  },
  {
    id: 'w28',
    word: 'nature',
    chunks: ['na', 'ture'],
    level: 'hard',
    category: 'Nature 🌱',
    sentence: 'We went for a quiet walk to enjoy the beauty of nature.',
    hint: 'The outdoor world of plants, animals, rivers, and mountains.',
    emoji: '🍃'
  },
  {
    id: 'w29',
    word: 'feather',
    chunks: ['feath', 'er'],
    level: 'hard',
    category: 'Animals 🐾',
    sentence: 'A soft gray feather floated down from the flying bird.',
    hint: 'One of the light, soft things that cover a bird\'s skin.',
    emoji: '🪶'
  },
  {
    id: 'w30',
    word: 'pocket',
    chunks: ['pock', 'et'],
    level: 'easy',
    category: 'Action Words 🏃',
    sentence: 'She tucked a smooth shiny pebble deep into her jeans pocket.',
    hint: 'A small bag sewn into your clothing for holding small treasures.',
    emoji: '👖'
  }
];

export const TINT_PRESETS: Record<BackgroundTint, {
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  buttonClass: string;
  primaryHex: string;
  secondaryHex: string;
}> = {
  cream: {
    name: 'Peach Cream 🍑',
    bgClass: 'bg-[#FCF7ED]',
    cardClass: 'bg-white border-[#E6D4BE]',
    textClass: 'text-[#4A3B32]',
    accentClass: 'text-[#B45309]',
    buttonClass: 'bg-[#F59E0B] hover:bg-[#D97706] text-white',
    primaryHex: '#FCF7ED',
    secondaryHex: '#B45309'
  },
  mint: {
    name: 'Clean Minimalism 🌿',
    bgClass: 'bg-[#F4F7F2]',
    cardClass: 'bg-white border-[#e1e8db]',
    textClass: 'text-[#343a40]',
    accentClass: 'text-[#2d4a22]',
    buttonClass: 'bg-[#7fb069] hover:bg-[#5c7a4e] text-white shadow-sm',
    primaryHex: '#F4F7F2',
    secondaryHex: '#7fb069'
  },
  sky: {
    name: 'Sky Blue ☁️',
    bgClass: 'bg-[#F0F7FD]',
    cardClass: 'bg-white border-[#C6DDF4]',
    textClass: 'text-[#233A52]',
    accentClass: 'text-[#1D4ED8]',
    buttonClass: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white',
    primaryHex: '#F0F7FD',
    secondaryHex: '#1D4ED8'
  },
  lavender: {
    name: 'Lavender Mist 🌸',
    bgClass: 'bg-[#F6F2FC]',
    cardClass: 'bg-white border-[#E0D3F5]',
    textClass: 'text-[#412E5C]',
    accentClass: 'text-[#6D28D9]',
    buttonClass: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white',
    primaryHex: '#F6F2FC',
    secondaryHex: '#6D28D9'
  },
  buttercup: {
    name: 'Buttercup Yellow 🍯',
    bgClass: 'bg-[#FCFAF0]',
    cardClass: 'bg-white border-[#EAE3B9]',
    textClass: 'text-[#524B28]',
    accentClass: 'text-[#A16207]',
    buttonClass: 'bg-[#EAB308] hover:bg-[#CA8A04] text-white',
    primaryHex: '#FCFAF0',
    secondaryHex: '#A16207'
  }
};

export const TEXT_SIZE_PRESETS: Record<TextSize, {
  name: string;
  body: string;
  title: string;
  input: string;
}> = {
  md: {
    name: 'Medium',
    body: 'text-base leading-relaxed',
    title: 'text-xl md:text-2xl font-bold',
    input: 'text-lg md:text-xl p-3'
  },
  lg: {
    name: 'Large',
    body: 'text-lg md:text-xl leading-relaxed',
    title: 'text-2xl md:text-3xl font-bold',
    input: 'text-xl md:text-2xl p-4'
  },
  xl: {
    name: 'Extra Large',
    body: 'text-xl md:text-2xl leading-relaxed',
    title: 'text-3xl md:text-4xl font-bold',
    input: 'text-2xl md:text-3xl p-5'
  },
  huge: {
    name: 'Super Huge! 🎉',
    body: 'text-2xl md:text-3xl leading-relaxed',
    title: 'text-4xl md:text-5xl font-extrabold',
    input: 'text-3xl md:text-4xl p-6 font-semibold'
  }
};

export const SPACING_PRESETS: Record<LetterSpacing, {
  name: string;
  trackingClass: string;
}> = {
  normal: {
    name: 'Normal',
    trackingClass: 'tracking-normal'
  },
  wide: {
    name: 'Wide Space',
    trackingClass: 'tracking-wide'
  },
  extra: {
    name: 'Extra Wide Space ⭐',
    trackingClass: 'tracking-widest'
  }
};

export const FONT_PRESETS: Record<SelectedFont, {
  name: string;
  fontClass: string;
  description: string;
}> = {
  lexend: {
    name: 'Lexend',
    fontClass: 'font-lexend',
    description: 'Designed to improve reading fluency and reduce visual clutter.'
  },
  atkinson: {
    name: 'Atkinson Hyperlegible',
    fontClass: 'font-atkinson',
    description: 'Focuses on letterform distinction to increase readability.'
  },
  fredoka: {
    name: 'Fredoka Rounded',
    fontClass: 'font-fredoka',
    description: 'A super friendly, rounded, easy-to-read font.'
  }
};

export const DEFAULT_SETTINGS: UserSettings = {
  tint: 'mint',
  textSize: 'lg',
  spacing: 'wide',
  font: 'lexend',
  pronunciationSpeed: 0.7, // Slowed down for kids
  speakAutomatically: true
};
