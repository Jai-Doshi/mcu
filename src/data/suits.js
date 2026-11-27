// Suit Vault: every hero's suits, each unlocked by watching the film it debuts in.
// Suit art is AI-generated fan art (empty suits on display, no faces), stored in /public/suits.
import { byId } from './movies.js';

export const HEROES = [
  { id: 'iron-man', name: 'Iron Man', color: '#d7263d', emblem: 'reactor' },
  { id: 'captain-america', name: 'Captain America', color: '#3b6fd8', emblem: 'star' },
  { id: 'spider-man', name: 'Spider-Man', color: '#e23b3b', emblem: 'spider' },
  { id: 'thor', name: 'Thor', color: '#8fb7ff', emblem: 'bolt' },
  { id: 'hulk', name: 'Hulk', color: '#4caf50', emblem: 'fist' },
  { id: 'black-widow', name: 'Black Widow', color: '#c0392b', emblem: 'hourglass' },
  { id: 'hawkeye', name: 'Hawkeye', color: '#8e44ad', emblem: 'target' },
  { id: 'black-panther', name: 'Black Panther', color: '#9b6dff', emblem: 'claw' },
  { id: 'doctor-strange', name: 'Doctor Strange', color: '#ff9f40', emblem: 'eye' },
  { id: 'ant-man', name: 'Ant-Man', color: '#e74c3c', emblem: 'helmet' },
  { id: 'wasp', name: 'Wasp', color: '#f1c40f', emblem: 'wing' },
  { id: 'captain-marvel', name: 'Captain Marvel', color: '#e3b04b', emblem: 'star' },
  { id: 'star-lord', name: 'Star-Lord', color: '#d35400', emblem: 'visor' },
  { id: 'falcon', name: 'Falcon / Sam Wilson', color: '#3498db', emblem: 'wing' },
  { id: 'war-machine', name: 'War Machine', color: '#95a5a6', emblem: 'reactor' },
  { id: 'vision', name: 'Vision', color: '#27ae60', emblem: 'gem' },
  { id: 'scarlet-witch', name: 'Scarlet Witch', color: '#e0245e', emblem: 'crown' },
  { id: 'shang-chi', name: 'Shang-Chi', color: '#e67e22', emblem: 'ring' },
  { id: 'deadpool', name: 'Deadpool', color: '#c0392b', emblem: 'blades' },
  { id: 'wolverine', name: 'Wolverine', color: '#f1c40f', emblem: 'blades' },
  { id: 'fantastic-four', name: 'Fantastic Four', color: '#4aa3ff', emblem: 'four' },
  { id: 'yelena', name: 'Yelena Belova', color: '#7f8c8d', emblem: 'hourglass' },
];

// film = movie id that unlocks it; ordered by level within each hero
const S = (hero, id, name, film, blurb) => ({ hero, id, name, film, blurb, img: `/suits/${id}.webp` });

export const SUITS = [
  // Iron Man
  S('iron-man', 'mark-3', 'Mark III', 'iron-man', 'The first red-and-gold armor, built in Malibu after the cave.'),
  S('iron-man', 'mark-6', 'Mark VI', 'iron-man-2', 'Triangular chest reactor powered by a brand-new element.'),
  S('iron-man', 'mark-7', 'Mark VII', 'the-avengers', 'Rapid-deploy armor that flew to meet Tony mid-fall over New York.'),
  S('iron-man', 'mark-42', 'Mark XLII', 'iron-man-3', 'The prehensile suit that assembles piece by piece on command.'),
  S('iron-man', 'hulkbuster', 'Hulkbuster', 'avengers-age-of-ultron', 'Veronica: heavy armor built for one very angry problem.'),
  S('iron-man', 'mark-50', 'Mark L', 'avengers-infinity-war', 'Nanotech armor that flows from the reactor on Tony’s chest.'),
  S('iron-man', 'mark-85', 'Mark LXXXV', 'avengers-endgame', 'The final armor. Built to bring everyone back.'),
  // Captain America
  S('captain-america', 'cap-ww2', 'WWII Uniform', 'captain-america-the-first-avenger', 'Field gear of the First Avenger and his round shield.'),
  S('captain-america', 'cap-avengers', 'Avengers Suit', 'the-avengers', 'A brighter, modern take designed by S.H.I.E.L.D.'),
  S('captain-america', 'cap-stealth', 'Stealth Suit', 'captain-america-the-winter-soldier', 'Dark navy tactical suit for S.H.I.E.L.D. strike missions.'),
  S('captain-america', 'cap-civil-war', 'Civil War Suit', 'captain-america-civil-war', 'Worn on the day the Avengers split in two.'),
  S('captain-america', 'cap-nomad', 'Nomad', 'avengers-infinity-war', 'Star scratched off. A fugitive soldier, still fighting.'),
  // Falcon / Sam
  S('falcon', 'falcon-wings', 'Falcon EXO-7', 'captain-america-the-winter-soldier', 'Military jet-wing pack with a quiet veteran inside.'),
  S('falcon', 'sam-cap', 'Captain America (Sam)', 'captain-america-brave-new-world', 'Vibranium wings and the shield, carried forward.'),
  // Spider-Man
  S('spider-man', 'spidey-homemade', 'Homemade Suit', 'spider-man-homecoming', 'Hoodie, goggles and grit. Where it all started.'),
  S('spider-man', 'spidey-stark', 'Stark Suit', 'captain-america-civil-war', 'Tony’s gift, with a few hundred web combinations.'),
  S('spider-man', 'iron-spider', 'Iron Spider', 'avengers-infinity-war', 'Nanotech armor with four golden waldoes.'),
  S('spider-man', 'spidey-stealth', 'Stealth Suit', 'spider-man-far-from-home', 'All black, for a secret mission across Europe.'),
  S('spider-man', 'spidey-integrated', 'Integrated Suit', 'spider-man-no-way-home', 'Gold-trimmed and magic-touched, for the multiverse.'),
  S('spider-man', 'spidey-new-day', 'Brand New Day Suit', 'spider-man-brand-new-day', 'Hand-made, bold red and blue, and nobody remembers who wears it.'),
  // Thor
  S('thor', 'thor-classic', 'Asgardian Armor', 'thor', 'Silver discs and a red cape, fit for a prince.'),
  S('thor', 'thor-gladiator', 'Gladiator Armor', 'thor-ragnarok', 'Arena gear from Sakaar. No hammer, no problem.'),
  S('thor', 'thor-stormbreaker', 'Stormbreaker Armor', 'avengers-infinity-war', 'Forged in a dying star’s light at Nidavellir.'),
  S('thor', 'thor-love-thunder', 'Love and Thunder Armor', 'thor-love-and-thunder', 'Gold-trimmed blue armor for a cosmic road trip.'),
  // Hulk
  S('hulk', 'hulk-gladiator', 'Gladiator Armor', 'thor-ragnarok', 'Sakaar’s champion, helmet and all.'),
  S('hulk', 'hulk-quantum', 'Quantum Suit', 'avengers-endgame', 'Extra-large time-heist suit for Professor Hulk.'),
  // Black Widow
  S('black-widow', 'widow-avengers', 'Tactical Suit', 'the-avengers', 'Black catsuit and Widow’s Bite gauntlets.'),
  S('black-widow', 'widow-white', 'White Suit', 'black-widow', 'Snow-white field suit for the hunt for the Red Room.'),
  // Hawkeye
  S('hawkeye', 'hawkeye-avengers', 'Avengers Gear', 'the-avengers', 'Sleeveless tactical vest, quiver and recurve bow.'),
  S('hawkeye', 'ronin', 'Ronin', 'avengers-endgame', 'Hooded black armor of five grief-stricken years.'),
  // Black Panther
  S('black-panther', 'panther-civil-war', 'Habit Suit', 'captain-america-civil-war', 'Vibranium-woven armor that absorbs every blow.'),
  S('black-panther', 'panther-kinetic', 'Kinetic Suit', 'black-panther', 'Shuri’s design: stores energy and releases it in purple light.'),
  S('black-panther', 'panther-shuri', 'Shuri’s Panther Suit', 'black-panther-wakanda-forever', 'Gold-lined suit of a new protector.'),
  // Doctor Strange
  S('doctor-strange', 'strange-robes', 'Sorcerer Supreme Robes', 'doctor-strange', 'Blue tunic, the Eye of Agamotto and a very opinionated cloak.'),
  S('doctor-strange', 'strange-mom', 'Multiverse Robes', 'doctor-strange-in-the-multiverse-of-madness', 'Darker robes for a walk between universes.'),
  // Ant-Man & Wasp
  S('ant-man', 'antman-classic', 'Ant-Man Suit', 'ant-man', 'Hank Pym’s original shrinking suit and helmet.'),
  S('ant-man', 'antman-quantum', 'Quantum Suit', 'ant-man-and-the-wasp-quantumania', 'Upgraded for a whole civilization in the Quantum Realm.'),
  S('wasp', 'wasp-suit', 'Wasp Suit', 'ant-man-and-the-wasp', 'Wings, blasters and a sleek gold-and-black finish.'),
  // Captain Marvel
  S('captain-marvel', 'starforce', 'Starforce Uniform', 'captain-marvel', 'Kree green and silver, before she remembered.'),
  S('captain-marvel', 'marvel-suit', 'Captain Marvel Suit', 'the-marvels', 'Red, blue and gold, with a flick of the wrist.'),
  // Guardians
  S('star-lord', 'star-lord-classic', 'Ravager Gear', 'guardians-of-the-galaxy', 'Red leather coat, jet boots and the masked helmet.'),
  S('star-lord', 'star-lord-vol3', 'Guardians Uniform', 'guardians-of-the-galaxy-vol-3', 'Matching team flight suits, finally.'),
  // War Machine
  S('war-machine', 'war-machine', 'War Machine', 'iron-man-2', 'Gunmetal grey armor with a shoulder cannon.'),
  // Vision
  S('vision', 'vision', 'Vision', 'avengers-age-of-ultron', 'Synthetic body, yellow cape, a stone in the forehead.'),
  // Scarlet Witch
  S('scarlet-witch', 'scarlet-witch', 'Scarlet Witch', 'doctor-strange-in-the-multiverse-of-madness', 'Crimson robes and crown of a chaos sorceress.'),
  // Shang-Chi
  S('shang-chi', 'shang-chi', 'Dragon-Scale Suit', 'shang-chi-and-the-legend-of-the-ten-rings', 'Woven from the scales of the Great Protector.'),
  // Deadpool & Wolverine
  S('deadpool', 'deadpool', 'Deadpool Suit', 'deadpool-and-wolverine', 'Red so nobody sees him bleed. Twin katanas.'),
  S('wolverine', 'wolverine', 'Yellow Suit', 'deadpool-and-wolverine', 'The classic yellow and blue, finally on screen.'),
  // Fantastic Four & Thunderbolts
  S('fantastic-four', 'f4-suit', 'First Family Suit', 'the-fantastic-four-first-steps', 'Retro-future blue and white uniforms.'),
  S('yelena', 'yelena', 'Thunderbolts Gear', 'thunderbolts', 'Black tactical vest of a reluctant new team.'),
].map((s) => ({ ...s, level: 0 }));

// assign level numbers per hero, in roster order
const counts = {};
for (const s of SUITS) s.level = counts[s.hero] = (counts[s.hero] || 0) + 1;

export const heroById = Object.fromEntries(HEROES.map((h) => [h.id, h]));
export const suitsFor = (heroId) => SUITS.filter((s) => s.hero === heroId);
export const filmOf = (s) => byId[s.film];

// rank titles by total suits unlocked
export const RANKS = [
  { min: 0, title: 'Civilian' },
  { min: 1, title: 'Recruit' },
  { min: 6, title: 'Agent' },
  { min: 14, title: 'Avenger' },
  { min: 26, title: 'Veteran' },
  { min: 38, title: 'Legend' },
  { min: 50, title: 'Sorcerer Supreme' },
];
