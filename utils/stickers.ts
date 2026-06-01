import { Sticker } from '../types';

const ART = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/** Reward stickers unlockable with earned stars. */
export const ALL_STICKERS: Sticker[] = [
  { id: 'p1', imageUrl: ART(25), name: 'Pikachu', cost: 10, bg: 'bg-yellow-100' },
  { id: 'p2', imageUrl: ART(4), name: 'Charmander', cost: 15, bg: 'bg-orange-100' },
  { id: 'p3', imageUrl: ART(7), name: 'Squirtle', cost: 15, bg: 'bg-blue-100' },
  { id: 'p4', imageUrl: ART(1), name: 'Bulbasaur', cost: 15, bg: 'bg-green-100' },
  { id: 'p5', imageUrl: ART(133), name: 'Eevee', cost: 20, bg: 'bg-amber-100' },
  { id: 'p6', imageUrl: ART(150), name: 'Mewtwo', cost: 50, bg: 'bg-purple-100' },
  { id: 'p7', imageUrl: ART(151), name: 'Mew', cost: 45, bg: 'bg-pink-100' },
  { id: 'p8', imageUrl: ART(52), name: 'Meowth', cost: 12, bg: 'bg-stone-100' },
  { id: 'p9', imageUrl: ART(39), name: 'Jigpuff', cost: 18, bg: 'bg-rose-50' },
  { id: 'p10', imageUrl: ART(143), name: 'Snorlax', cost: 30, bg: 'bg-teal-50' },
  { id: 'p11', imageUrl: ART(6), name: 'Charizard', cost: 60, bg: 'bg-orange-200' },
  { id: 'p12', imageUrl: ART(9), name: 'Blastoise', cost: 55, bg: 'bg-blue-200' },
  { id: 'p13', imageUrl: ART(3), name: 'Venusaur', cost: 55, bg: 'bg-green-200' },
  { id: 'p14', imageUrl: ART(54), name: 'Psyduck', cost: 14, bg: 'bg-yellow-50' },
  { id: 'p15', imageUrl: ART(58), name: 'Growlithe', cost: 22, bg: 'bg-orange-50' },
  { id: 'p16', imageUrl: ART(63), name: 'Abra', cost: 25, bg: 'bg-yellow-100' },
  { id: 'p17', imageUrl: ART(77), name: 'Ponyta', cost: 28, bg: 'bg-red-50' },
  { id: 'p18', imageUrl: ART(92), name: 'Gastly', cost: 30, bg: 'bg-purple-50' },
  { id: 'p19', imageUrl: ART(95), name: 'Onix', cost: 35, bg: 'bg-gray-100' },
  { id: 'p20', imageUrl: ART(131), name: 'Lapras', cost: 40, bg: 'bg-sky-100' },
  { id: 'p21', imageUrl: ART(147), name: 'Dratini', cost: 38, bg: 'bg-blue-50' },
  { id: 'p22', imageUrl: ART(149), name: 'Dragonite', cost: 65, bg: 'bg-orange-100' },
  { id: 'p23', imageUrl: ART(175), name: 'Togepi', cost: 20, bg: 'bg-stone-50' },
  { id: 'p24', imageUrl: ART(196), name: 'Espeon', cost: 45, bg: 'bg-purple-100' },
];
