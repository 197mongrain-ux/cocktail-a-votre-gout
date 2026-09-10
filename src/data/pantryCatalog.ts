/** Curated pantry catalogs (fr-CA labels) for « Mon bar ». */

export type PantryGroup = "alcools" | "fruits" | "epices" | "autres";

export interface PantryItem {
  id: string;
  label: string;
  /** Normalized tokens used for matching recipe ingredients. */
  tokens: string[];
  group: PantryGroup;
}

export const PANTRY_ALCOOLS: PantryItem[] = [
  { id: "vodka", label: "Vodka", tokens: ["vodka"], group: "alcools" },
  { id: "gin", label: "Gin", tokens: ["gin"], group: "alcools" },
  { id: "rhum-blanc", label: "Rhum blanc", tokens: ["rhum blanc", "white rum", "rum"], group: "alcools" },
  { id: "rhum-vieux", label: "Rhum vieux", tokens: ["rhum vieux", "aged rum", "dark rum", "rum"], group: "alcools" },
  { id: "tequila", label: "Tequila", tokens: ["tequila", "blanco tequila"], group: "alcools" },
  { id: "mezcal", label: "Mezcal", tokens: ["mezcal"], group: "alcools" },
  { id: "bourbon", label: "Bourbon", tokens: ["bourbon", "whiskey", "whisky"], group: "alcools" },
  { id: "rye", label: "Rye / whisky de seigle", tokens: ["rye", "whiskey", "whisky"], group: "alcools" },
  { id: "scotch", label: "Scotch", tokens: ["scotch", "whiskey", "whisky"], group: "alcools" },
  { id: "cognac", label: "Cognac / brandy", tokens: ["cognac", "brandy"], group: "alcools" },
  { id: "pisco", label: "Pisco", tokens: ["pisco"], group: "alcools" },
  { id: "campari", label: "Campari", tokens: ["campari"], group: "alcools" },
  { id: "aperol", label: "Aperol", tokens: ["aperol"], group: "alcools" },
  { id: "vermouth-doux", label: "Vermouth doux", tokens: ["sweet vermouth", "vermouth doux", "vermouth"], group: "alcools" },
  { id: "vermouth-sec", label: "Vermouth sec", tokens: ["dry vermouth", "vermouth sec", "vermouth"], group: "alcools" },
  { id: "cointreau", label: "Cointreau / triple sec", tokens: ["cointreau", "triple sec", "orange liqueur"], group: "alcools" },
  { id: "amaretto", label: "Amaretto", tokens: ["amaretto"], group: "alcools" },
  { id: "coffee-liqueur", label: "Liqueur de café", tokens: ["coffee liqueur", "kahlua", "liqueur de cafe"], group: "alcools" },
  { id: "champagne", label: "Champagne / mousseux", tokens: ["champagne", "prosecco", "sparkling", "mousseux"], group: "alcools" },
  { id: "amaro", label: "Amaro", tokens: ["amaro"], group: "alcools" },
];

export const PANTRY_FRUITS: PantryItem[] = [
  { id: "citron", label: "Citron", tokens: ["lemon", "citron", "lemon juice", "jus de citron"], group: "fruits" },
  { id: "citron-vert", label: "Citron vert / lime", tokens: ["lime", "citron vert", "lime juice", "jus de citron vert"], group: "fruits" },
  { id: "orange", label: "Orange", tokens: ["orange", "orange juice", "orange peel", "zeste d'orange"], group: "fruits" },
  { id: "pamplemousse", label: "Pamplemousse", tokens: ["grapefruit", "pamplemousse"], group: "fruits" },
  { id: "fraise", label: "Fraise", tokens: ["strawberry", "fraise", "fraises"], group: "fruits" },
  { id: "framboise", label: "Framboise", tokens: ["raspberry", "framboise", "framboises"], group: "fruits" },
  { id: "myrtille", label: "Myrtille", tokens: ["blueberry", "myrtille", "myrtilles"], group: "fruits" },
  { id: "ananas", label: "Ananas", tokens: ["pineapple", "ananas"], group: "fruits" },
  { id: "mangue", label: "Mangue", tokens: ["mango", "mangue"], group: "fruits" },
  { id: "banane", label: "Banane", tokens: ["banana", "banane"], group: "fruits" },
  { id: "cerise", label: "Cerise", tokens: ["cherry", "cerise", "brandied cherry"], group: "fruits" },
  { id: "peche", label: "Pêche", tokens: ["peach", "peche", "pêche"], group: "fruits" },
  { id: "pomme", label: "Pomme", tokens: ["apple", "pomme"], group: "fruits" },
  { id: "concombre", label: "Concombre", tokens: ["cucumber", "concombre"], group: "fruits" },
  { id: "noix-coco", label: "Noix de coco / crème de coco", tokens: ["coconut", "noix de coco", "cream of coconut", "coco"], group: "fruits" },
];

export const PANTRY_EPICES: PantryItem[] = [
  { id: "menthe", label: "Menthe", tokens: ["mint", "menthe"], group: "epices" },
  { id: "basilic", label: "Basilic", tokens: ["basil", "basilic"], group: "epices" },
  { id: "cannelle", label: "Cannelle", tokens: ["cinnamon", "cannelle"], group: "epices" },
  { id: "gingembre", label: "Gingembre", tokens: ["ginger", "gingembre"], group: "epices" },
  { id: "piment", label: "Piment / chili", tokens: ["chili", "piment", "jalapeno", "jalapeño", "pepper"], group: "epices" },
  { id: "poivre", label: "Poivre", tokens: ["black pepper", "poivre", "peppercorn"], group: "epices" },
  { id: "romarin", label: "Romarin", tokens: ["rosemary", "romarin"], group: "epices" },
  { id: "thym", label: "Thym", tokens: ["thyme", "thym"], group: "epices" },
  { id: "vanille", label: "Vanille", tokens: ["vanilla", "vanille"], group: "epices" },
  { id: "anis", label: "Anis / star anise", tokens: ["anise", "anis", "star anise"], group: "epices" },
  { id: "cafe", label: "Café / espresso", tokens: ["coffee", "espresso", "cafe", "café"], group: "epices" },
  { id: "cacao", label: "Cacao / chocolat", tokens: ["cocoa", "chocolate", "cacao", "chocolat"], group: "epices" },
];

export const PANTRY_AUTRES: PantryItem[] = [
  { id: "angostura", label: "Angostura (amers)", tokens: ["angostura", "bitters", "amers"], group: "autres" },
  { id: "orange-bitters", label: "Amers à l'orange", tokens: ["orange bitters", "amers orange"], group: "autres" },
  { id: "sirop-simple", label: "Sirop simple", tokens: ["simple syrup", "sirop simple", "sugar syrup"], group: "autres" },
  { id: "sirop-demerara", label: "Sirop demerara", tokens: ["demerara syrup", "demerara"], group: "autres" },
  { id: "sirop-grenadine", label: "Grenadine", tokens: ["grenadine"], group: "autres" },
  { id: "miel", label: "Miel / miel sirop", tokens: ["honey", "miel"], group: "autres" },
  { id: "tonic", label: "Eau tonique", tokens: ["tonic", "tonic water", "eau tonique"], group: "autres" },
  { id: "ginger-beer", label: "Ginger beer", tokens: ["ginger beer", "ginger ale"], group: "autres" },
  { id: "cola", label: "Cola", tokens: ["cola", "coke"], group: "autres" },
  { id: "jus-cranberry", label: "Jus de canneberge", tokens: ["cranberry", "canneberge"], group: "autres" },
  { id: "blanc-oeuf", label: "Blanc d'œuf", tokens: ["egg white", "blanc d'oeuf", "blanc d'œuf"], group: "autres" },
  { id: "creme", label: "Crème / lait", tokens: ["cream", "creme", "crème", "milk", "lait", "half-and-half"], group: "autres" },
];

export const ALL_PANTRY_ITEMS: PantryItem[] = [
  ...PANTRY_ALCOOLS,
  ...PANTRY_FRUITS,
  ...PANTRY_EPICES,
  ...PANTRY_AUTRES,
];

export const GROUP_LABELS: Record<PantryGroup, string> = {
  alcools: "Alcools",
  fruits: "Fruits",
  epices: "Épices & aromates",
  autres: "Amers, sirops & mixeurs",
};
