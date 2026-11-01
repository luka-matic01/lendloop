import type { Doc } from "../_generated/dataModel";

type Category = Doc<"tools">["category"];
type Condition = Doc<"tools">["condition"];

export const SEED_USER_TOKEN_PREFIX = "seed|neighbor|";

export type SeedNeighbor = {
  slug: string;
  name: string;
  email: string;
  isTrustedLender?: boolean;
  tools: Array<{
    name: string;
    category: Category;
    condition: Condition;
    description: string;
    isAvailable?: boolean;
  }>;
};

/** Personal listings inserted for the signed-in reviewer (matched by email). */
export const personalDemoTools: SeedNeighbor["tools"] = [
  {
    name: "Cordless drill",
    category: "power_tools",
    condition: "good",
    description: "18V, two batteries, charger included. Fine for shelves and fence boards.",
  },
  {
    name: "6 ft step ladder",
    category: "other",
    condition: "excellent",
    description: "Fiberglass, stable on uneven driveway pavers.",
  },
  {
    name: "Socket set",
    category: "other",
    condition: "good",
    description: "Metric + SAE, missing one 10 mm deep socket.",
  },
];

export const seedNeighbors: SeedNeighbor[] = [
  {
    slug: "maria-s",
    name: "Maria S.",
    email: "maria.demo@lendloop.local",
    isTrustedLender: true,
    tools: [
      {
        name: "Circular saw",
        category: "power_tools",
        condition: "good",
        description: "15-amp sidewinder, sharp blade, bag included.",
      },
      {
        name: "Pressure washer",
        category: "garden",
        condition: "fair",
        description: "Electric 1800 PSI. Good for patio and siding.",
      },
      {
        name: "Camp stove",
        category: "camping",
        condition: "excellent",
        description: "Two-burner propane, hoses and regulator.",
      },
      {
        name: "Hand pruners",
        category: "garden",
        condition: "good",
        description: "Bypass style, recently sharpened.",
      },
      {
        name: "Jigsaw",
        category: "power_tools",
        condition: "good",
        description: "Variable speed, wood and metal blades.",
      },
    ],
  },
  {
    slug: "james-k",
    name: "James K.",
    email: "james.demo@lendloop.local",
    tools: [
      {
        name: "Lawn aerator",
        category: "garden",
        condition: "good",
        description: "Push spike aerator for small yards.",
      },
      {
        name: "Leaf blower",
        category: "garden",
        condition: "excellent",
        description: "Battery unit, two packs charged.",
      },
      {
        name: "Cooler",
        category: "camping",
        condition: "good",
        description: "45 qt rotomolded, holds ice all weekend.",
      },
      {
        name: "Stand mixer",
        category: "kitchen",
        condition: "excellent",
        description: "Bowl and three attachments.",
      },
    ],
  },
  {
    slug: "priya-n",
    name: "Priya N.",
    email: "priya.demo@lendloop.local",
    tools: [
      {
        name: "Tile wet saw",
        category: "power_tools",
        condition: "good",
        description: "Rent-quality saw, tray and guide included.",
      },
      {
        name: "Food dehydrator",
        category: "kitchen",
        condition: "good",
        description: "Nine trays, fruit and jerky settings.",
      },
      {
        name: "Canopy tent",
        category: "camping",
        condition: "fair",
        description: "10x10, one leg strap needs replacing.",
        isAvailable: false,
      },
      {
        name: "Extension ladder",
        category: "other",
        condition: "good",
        description: "24 ft aluminum, rope intact.",
      },
      {
        name: "Hedge trimmer",
        category: "garden",
        condition: "good",
        description: "Corded, long reach handle.",
      },
    ],
  },
  {
    slug: "omar-h",
    name: "Omar H.",
    email: "omar.demo@lendloop.local",
    tools: [
      {
        name: "Angle grinder",
        category: "power_tools",
        condition: "fair",
        description: "Works fine, guard is scratched.",
      },
      {
        name: "Wheelbarrow",
        category: "garden",
        condition: "needs_care",
        description: "Flat tire but tub is solid.",
      },
      {
        name: "Dutch oven",
        category: "kitchen",
        condition: "excellent",
        description: "Enameled 6 qt, seasoned.",
      },
      {
        name: "Sleeping bags (2)",
        category: "camping",
        condition: "good",
        description: "20°F rated, stored clean and dry.",
      },
    ],
  },
  {
    slug: "lena-v",
    name: "Lena V.",
    email: "lena.demo@lendloop.local",
    tools: [
      {
        name: "Router table",
        category: "power_tools",
        condition: "good",
        description: "Benchtop, fence and bits in box.",
      },
      {
        name: "Espresso machine",
        category: "kitchen",
        condition: "excellent",
        description: "Semi-auto, milk frother, descaled monthly.",
      },
      {
        name: "Camp chairs (4)",
        category: "camping",
        condition: "good",
        description: "Low-profile, bagged.",
      },
      {
        name: "Post hole digger",
        category: "garden",
        condition: "good",
        description: "Manual clamshell, sharp edges.",
      },
      {
        name: "Shop vac",
        category: "other",
        condition: "good",
        description: "6 gal wet/dry, new filter.",
      },
    ],
  },
  {
    slug: "theo-b",
    name: "Theo B.",
    email: "theo.demo@lendloop.local",
    tools: [
      {
        name: "Chainsaw",
        category: "power_tools",
        condition: "good",
        description: "Battery saw, bar cover, two chains.",
      },
      {
        name: "Smoker",
        category: "kitchen",
        condition: "fair",
        description: "Offset barrel, needs ash scrape.",
      },
      {
        name: "Hammock",
        category: "camping",
        condition: "excellent",
        description: "Tree straps rated 400 lb.",
      },
      {
        name: "Roto-tiller",
        category: "garden",
        condition: "good",
        description: "Front-tine, starts on second pull.",
      },
    ],
  },
  {
    slug: "yuki-t",
    name: "Yuki T.",
    email: "yuki.demo@lendloop.local",
    tools: [
      {
        name: "Laser level",
        category: "other",
        condition: "excellent",
        description: "Self-leveling cross-line, tripod.",
      },
      {
        name: "Pasta maker",
        category: "kitchen",
        condition: "good",
        description: "Manual crank, cutter attachments.",
      },
      {
        name: "Climbing harness",
        category: "camping",
        condition: "good",
        description: "UIAA tagged, medium size.",
      },
      {
        name: "Impact driver",
        category: "power_tools",
        condition: "excellent",
        description: "Brushless, bit set included.",
      },
      {
        name: "Garden cart",
        category: "garden",
        condition: "good",
        description: "Four-wheel, dump bed.",
      },
      {
        name: "Ice auger",
        category: "other",
        condition: "fair",
        description: "Hand crank, 6 inch blade.",
      },
    ],
  },
];
