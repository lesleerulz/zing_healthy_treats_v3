import { images } from '../images.js'

export const NAV_HOME = [
  { label: 'PHILOSOPHY', hash: '#philosophy' },
  { label: 'BLENDS', hash: '#blends' },
  { label: 'KITCHEN', hash: '#kitchen' },
  { label: 'PANTRY', to: '/pantry' },
  { label: 'ABOUT', to: '/about' },
  { label: 'ACCOUNT', to: '/account' },
]

export const NAV_PAGE = [
  { label: 'HOME', to: '/' },
  { label: 'PANTRY', to: '/pantry' },
  { label: 'ABOUT', to: '/about' },
  { label: 'ACCOUNT', to: '/account' },
]

export const MANIFESTO = [
  { text: 'We do not make snacks. We make' },
  { text: 'what remains', em: true },
  { text: 'after the roasting pan has cooled — the crunch, the warmth, the' },
  { text: 'memory of a morning.', em: true },
  { text: 'Slow roasting is not delay. Slow roasting is the nut revealing itself, and this collection is our' },
  { text: 'open jar.', em: true },
]

export const LOOKS = [
  {
    num: '01',
    src: images.look1,
    alt: 'Granola with honey dipper on marble surface',
    caption: 'BLEND 01',
    fabric: 'OATS / HONEY / ALMOND',
    name: '"Golden Hour Granola"',
  },
  {
    num: '02',
    src: images.look2,
    alt: 'Glass jar spilling granola mix with nuts and seeds',
    caption: 'BLEND 02',
    fabric: 'CASHEW / PECAN / MAPLE',
    name: '"The Morning Jar"',
  },
  {
    num: '03',
    src: images.look3,
    alt: 'Greek yogurt with strawberries nuts and honey',
    caption: 'BLEND 03',
    fabric: 'WALNUT / BERRY / YOGURT',
    name: '"Sunrise Bowl"',
  },
]

export const STATS = [
  { value: 72, label: 'HOURS / BATCH' },
  { value: 12, label: 'SOURCING TRIPS' },
  { value: 1, label: 'ROAST, NEVER TWICE' },
]

export const PRINCIPLES = [
  {
    numeral: 'I',
    title: 'SLOW IS THE RECIPE',
    body: 'Before a nut is roasted, it rests. We source from small orchards where the trees have been growing for decades. What the soil gives us is the flavor. We honor the roast curve, we listen for the crack, we pull the pan when the aroma says stop.',
  },
  {
    numeral: 'II',
    title: 'ONE ROAST, NEVER REPEATED',
    body: 'A blend that can be mass-produced is a blend that can be forgotten. Every Zing batch is a single roast — when it leaves the kitchen, the recipe card is pinned to the wall and the next batch begins from scratch.',
  },
  {
    numeral: 'III',
    title: 'THE EATER COMPLETES THE WORK',
    body: 'Our nuts arrive warm in the bag. The first morning you open the jar, the aroma finishes what the roaster started. We do not sell snacks; we sell the opening line of your day.',
  },
]

const PLATES = ['look1', 'look2', 'look3', 'hero', 'detail', 'finale']

const CATALOG_NAMES = [
  ['Golden Hour Granola', 'oats / honey / almond'],
  ['The Morning Jar', 'cashew / pecan / maple'],
  ['Sunrise Bowl', 'walnut / berry / yogurt'],
  ['Midnight Almond', 'marcona / smoked salt'],
  ['Honeycrisp Cashew', 'cashew / raw honey / cinnamon'],
  ['Orchard Pecan', 'pecan / brown butter / sea salt'],
  ['Cocoa Hazelnut', 'hazelnut / dark cocoa / vanilla'],
  ['Maple Walnut', 'walnut / grade-a maple / nutmeg'],
  ['Spiced Pistachio', 'pistachio / cardamom / orange zest'],
  ['Rosemary Almond', 'almond / rosemary / olive oil'],
  ['Ginger Cashew', 'cashew / crystallized ginger / turmeric'],
  ['Espresso Pecan', 'pecan / espresso / brown sugar'],
  ['Coconut Macadamia', 'macadamia / toasted coconut / lime'],
  ['Chili Lime Peanut', 'peanut / lime / ancho chili'],
  ['Vanilla Hazelnut', 'hazelnut / bourbon vanilla / sea salt'],
  ['Cinnamon Pecan', 'pecan / ceylon cinnamon / maple'],
  ['Smoked Almond', 'almond / applewood smoke / paprika'],
  ['Caramel Cashew', 'cashew / salted caramel / fleur de sel'],
  ['Cocoa Almond', 'almond / dutch cocoa / coconut sugar'],
  ['Toasted Coconut Walnut', 'walnut / coconut / brown butter'],
  ['Spiced Maple Pecan', 'pecan / maple / clove / nutmeg'],
  ['Salted Honey Almond', 'almond / wildflower honey / maldon'],
  ['Brown Butter Cashew', 'cashew / brown butter / thyme'],
  ['Orange Cardamom Pistachio', 'pistachio / cardamom / blood orange'],
  ['Pumpkin Spice Walnut', 'walnut / pumpkin spice / maple'],
  ['Black Sesame Cashew', 'cashew / black sesame / miso'],
  ['Cinnamon Roll Pecan', 'pecan / cinnamon / vanilla glaze'],
  ['The Last Roast', 'everything that survived the morning'],
]

export const ARCHIVE = CATALOG_NAMES.map(([name, blend], i) => ({
  id: i + 1,
  number: String(i + 1).padStart(2, '0'),
  name,
  fabric: blend.toUpperCase(),
  plate: PLATES[i % PLATES.length],
}))

export const PLATE_KEYS = PLATES
