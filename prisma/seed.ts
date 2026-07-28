import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DIRECT_URL ||
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const storeSettings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "nurvishop",
      email: "info@nurvishop.com",
      currency: "EUR",
      taxRate: 21,
      freeShippingMin: 50,
    },
  });
  console.log("Store settings:", storeSettings.name);

  const categories = await Promise.all(
    [
      { name: "Home & Living", slug: "home-living", description: "Cosy, characterful pieces for every room" },
      { name: "Accessories", slug: "accessories", description: "Everyday accessories with personality" },
      { name: "Beauty & Care", slug: "beauty-care", description: "Feel-good self-care essentials" },
      { name: "Tech & Gadgets", slug: "tech-gadgets", description: "Handy tech that just clicks" },
      { name: "Stationery & Gifts", slug: "stationery-gifts", description: "Little joys worth gifting" },
      { name: "Bags & Travel", slug: "bags-travel", description: "Carry it all in style" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { ...cat, isActive: true, sortOrder: 0 },
      })
    )
  );
  console.log(`Created ${categories.length} categories`);

  // Test users
  // test@gmail.com / test123! — Customer with $10,000 budget
  // admin@gmail.com / admin123! — Admin user
  const testPassword = await bcrypt.hash("test123!", 12);
  const adminPassword = await bcrypt.hash("admin123!", 12);

  const testUser = await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: { passwordHash: testPassword },
    create: {
      email: "test@gmail.com",
      passwordHash: testPassword,
      name: "Test Customer",
      role: "CUSTOMER",
    },
  });
  console.log(`Created test user: ${testUser.email} (role: ${testUser.role})`);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: { passwordHash: adminPassword },
    create: {
      email: "admin@gmail.com",
      passwordHash: adminPassword,
      name: "Store Admin",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${adminUser.email} (role: ${adminUser.role})`);

  const page = await prisma.page.upsert({
    where: { slug: "about-us" },
    update: {},
    create: {
      title: "About Us",
      slug: "about-us",
      content:
        "<p>Welcome to nurvishop — fresh finds at friendly prices. We hand-pick lifestyle goods, accessories and everyday favourites that feel good to own.</p><p>Young, optimistic and confident: approachable enough to browse for fun, polished enough to pay with confidence.</p>",
      isActive: true,
    },
  });
  console.log(`Created page: ${page.title}`);

  // ── Products: assorted home goods ────────────────
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  // Deterministic, always-valid placeholder imagery (swap for real photos later).
  const img = (slug: string, n: number) =>
    `https://picsum.photos/seed/nurvi-${slug}-${n}/900/900`;

  type SeedProduct = {
    name: string;
    slug: string;
    sku: string;
    category: string;
    shortDescription: string;
    description: string;
    price: number;
    comparePrice?: number;
    quantity: number;
    brand: string;
    isFeatured?: boolean;
  };

  const products: SeedProduct[] = [
    {
      name: "Marlow Stoneware Mug Set (4)",
      slug: "marlow-stoneware-mug-set",
      sku: "HL-MUG-001",
      category: "home-living",
      shortDescription: "Speckled reactive-glaze mugs in warm neutral tones.",
      description:
        "<p>A set of four hand-finished stoneware mugs with a soft speckled glaze. Comfortable rounded handles, generous 350ml capacity, and no two exactly alike.</p><p>Microwave and dishwasher safe.</p>",
      price: 34,
      comparePrice: 44,
      quantity: 120,
      brand: "Marlow",
      isFeatured: true,
    },
    {
      name: "Halden Linen Throw Blanket",
      slug: "halden-linen-throw-blanket",
      sku: "HL-THR-002",
      category: "home-living",
      shortDescription: "Stonewashed pure-linen throw with fringed edges.",
      description:
        "<p>Woven from 100% European flax linen and stonewashed for an instantly lived-in softness. Breathable year round and only gets better with every wash.</p>",
      price: 79,
      comparePrice: 99,
      quantity: 60,
      brand: "Halden",
      isFeatured: true,
    },
    {
      name: "Ember Soy Scented Candle — Fig & Cedar",
      slug: "ember-soy-candle-fig-cedar",
      sku: "HL-CND-003",
      category: "home-living",
      shortDescription: "45-hour clean-burning soy candle in a reusable tumbler.",
      description:
        "<p>Natural soy wax and a cotton wick for a clean, even burn. Notes of ripe fig, cedarwood and a whisper of vanilla. The frosted glass tumbler is made to be reused.</p>",
      price: 24,
      quantity: 200,
      brand: "Ember",
      isFeatured: true,
    },
    {
      name: "Rattan Woven Storage Basket",
      slug: "rattan-woven-storage-basket",
      sku: "HL-BSK-004",
      category: "home-living",
      shortDescription: "Handwoven basket with cotton-rope handles.",
      description:
        "<p>Handwoven natural rattan basket that tidies away throws, toys or plants. Sturdy braided handles make it easy to move from room to room.</p>",
      price: 39,
      quantity: 85,
      brand: "Nurvi Home",
    },
    {
      name: "Lumen Ribbed Ceramic Table Lamp",
      slug: "lumen-ribbed-ceramic-table-lamp",
      sku: "HL-LMP-005",
      category: "home-living",
      shortDescription: "Warm-glow bedside lamp with a linen drum shade.",
      description:
        "<p>A ribbed ceramic base in soft matte clay pairs with a natural linen shade for a warm, diffused glow. In-line dimmer switch. E27 bulb not included.</p>",
      price: 69,
      comparePrice: 89,
      quantity: 40,
      brand: "Lumen",
      isFeatured: true,
    },
    {
      name: "Nordic Silent Wall Clock",
      slug: "nordic-silent-wall-clock",
      sku: "HL-CLK-006",
      category: "home-living",
      shortDescription: "Minimal 30cm clock with a silent sweep movement.",
      description:
        "<p>Clean Scandinavian face with a genuinely silent sweep movement — no ticking. Slim pale-oak rim and high-contrast hands for effortless reading across the room.</p>",
      price: 32,
      quantity: 150,
      brand: "Nordic",
    },
    {
      name: "Bloom Fluted Ceramic Vase",
      slug: "bloom-fluted-ceramic-vase",
      sku: "HL-VAS-007",
      category: "home-living",
      shortDescription: "Sculptural fluted vase for stems or dried grasses.",
      description:
        "<p>A tactile fluted silhouette in a chalky matte finish. Beautiful with a single stem, a full bouquet, or left bare as a quiet object.</p>",
      price: 28,
      quantity: 95,
      brand: "Bloom",
    },
    {
      name: "Acacia End-Grain Cutting Board",
      slug: "acacia-end-grain-cutting-board",
      sku: "HL-CBD-008",
      category: "home-living",
      shortDescription: "Chunky acacia board with a juice groove.",
      description:
        "<p>Solid end-grain acacia that's kind to knife edges and built to last. Deep juice groove and carved side handles. Oil occasionally to keep it glowing.</p>",
      price: 45,
      comparePrice: 59,
      quantity: 70,
      brand: "Nurvi Home",
    },
    {
      name: "Cloudsoft Washed Cotton Duvet Set",
      slug: "cloudsoft-washed-cotton-duvet-set",
      sku: "HL-BED-009",
      category: "home-living",
      shortDescription: "Breathable washed-cotton duvet cover + 2 shams.",
      description:
        "<p>Garment-washed pure cotton with a lightly lived-in handfeel and a hidden button closure. Includes one duvet cover and two pillow shams.</p>",
      price: 89,
      comparePrice: 119,
      quantity: 55,
      brand: "Cloudsoft",
      isFeatured: true,
    },
    {
      name: "Terra Ribbed Bath Towel Bundle",
      slug: "terra-ribbed-bath-towel-bundle",
      sku: "HL-TWL-010",
      category: "home-living",
      shortDescription: "Quick-dry ribbed towels — 2 bath, 2 hand.",
      description:
        "<p>Plush yet quick-drying combed cotton with a subtle ribbed border. Highly absorbent and softer after every wash. Bundle of two bath and two hand towels.</p>",
      price: 52,
      quantity: 110,
      brand: "Terra",
    },
    {
      name: "Brew Co. Glass French Press",
      slug: "brew-co-glass-french-press",
      sku: "HL-FRP-011",
      category: "home-living",
      shortDescription: "1L borosilicate press with a cork collar.",
      description:
        "<p>Heat-resistant borosilicate glass carafe wrapped in a natural cork collar. Four-level stainless filter for a rich, sediment-light cup. 1 litre / 8 cups.</p>",
      price: 38,
      quantity: 90,
      brand: "Brew Co.",
    },
    {
      name: "Pantry Glass Storage Jar Trio",
      slug: "pantry-glass-storage-jar-trio",
      sku: "HL-JAR-012",
      category: "home-living",
      shortDescription: "Airtight bamboo-lid jars in three sizes.",
      description:
        "<p>Keep the pantry tidy with three stackable glass jars and airtight bamboo lids with silicone seals. Perfect for grains, coffee and baking staples.</p>",
      price: 29,
      comparePrice: 36,
      quantity: 130,
      brand: "Pantry",
    },
    {
      name: "Hearth Chunky Knit Wool Blanket",
      slug: "hearth-chunky-knit-wool-blanket",
      sku: "HL-BLK-013",
      category: "home-living",
      shortDescription: "Oversized chunky-knit throw in oat marl.",
      description:
        "<p>Cosy chunky-knit blanket in a soft wool blend. Drapes generously over a sofa or the end of a bed and adds instant texture to a room.</p>",
      price: 74,
      quantity: 8,
      brand: "Hearth",
    },
    {
      name: "Sprout Speckled Planter Pot",
      slug: "sprout-speckled-planter-pot",
      sku: "HL-PLT-014",
      category: "home-living",
      shortDescription: "Indoor planter with a matching drip tray.",
      description:
        "<p>A speckled stoneware planter with a drainage hole and matching saucer, sized for a 15cm nursery pot. Lets your leafy friends drink without the mess.</p>",
      price: 26,
      quantity: 140,
      brand: "Sprout",
    },
    {
      name: "Saveur Stoneware Dinner Plate Set (4)",
      slug: "saveur-stoneware-dinner-plate-set",
      sku: "HL-PLS-015",
      category: "home-living",
      shortDescription: "Reactive-glaze dinner plates with organic edges.",
      description:
        "<p>Four 27cm dinner plates with a reactive glaze that pools beautifully at the rim. Slightly organic edges give a relaxed, handmade table.</p>",
      price: 58,
      comparePrice: 72,
      quantity: 65,
      brand: "Saveur",
      isFeatured: true,
    },
    {
      name: "Mette Velvet Cushion Cover Pair",
      slug: "mette-velvet-cushion-cover-pair",
      sku: "HL-CSH-016",
      category: "home-living",
      shortDescription: "Two 45cm velvet covers with hidden zips.",
      description:
        "<p>Plush cotton-velvet cushion covers with a subtle sheen and invisible zip. Sold as a pair to layer up a sofa or bed. Inserts not included.</p>",
      price: 34,
      quantity: 100,
      brand: "Mette",
    },
    {
      name: "Loom Hand-Tufted Area Rug 120×170",
      slug: "loom-hand-tufted-area-rug",
      sku: "HL-RUG-017",
      category: "home-living",
      shortDescription: "Low-pile tufted rug with a tonal arch motif.",
      description:
        "<p>Hand-tufted low-pile rug in a soft wool-blend with a quiet tonal arch pattern. Anti-slip backing keeps it planted. 120 × 170 cm.</p>",
      price: 129,
      comparePrice: 169,
      quantity: 30,
      brand: "Loom",
      isFeatured: true,
    },
    {
      name: "Glow Warm LED String Lights 10m",
      slug: "glow-warm-led-string-lights",
      sku: "TG-STR-018",
      category: "tech-gadgets",
      shortDescription: "USB-powered warm-white lights with 8 modes.",
      description:
        "<p>Ten metres of delicate copper-wire string lights with 100 warm-white LEDs, a remote and a timer. USB powered — drape them anywhere.</p>",
      price: 19,
      quantity: 220,
      brand: "Glow",
    },
    {
      name: "Aura Ultrasonic Essential-Oil Diffuser",
      slug: "aura-ultrasonic-oil-diffuser",
      sku: "TG-DIF-019",
      category: "tech-gadgets",
      shortDescription: "300ml diffuser with soft colour-cycle light.",
      description:
        "<p>Whisper-quiet ultrasonic diffuser with a 300ml tank, auto shut-off and an optional soft colour-cycling nightlight. Fills a room with calm.</p>",
      price: 33,
      comparePrice: 42,
      quantity: 75,
      brand: "Aura",
    },
    {
      name: "Fold Bamboo Desk Organiser",
      slug: "fold-bamboo-desk-organiser",
      sku: "SG-ORG-020",
      category: "stationery-gifts",
      shortDescription: "Modular bamboo caddy for pens, phone and notes.",
      description:
        "<p>A warm bamboo organiser with compartments for pens, sticky notes and a slot that props up your phone. Keeps a desk calm and clutter-free.</p>",
      price: 27,
      quantity: 160,
      brand: "Fold",
    },
    {
      name: "Grace Reed Room-Fragrance Diffuser",
      slug: "grace-reed-room-fragrance-diffuser",
      sku: "BC-RFD-021",
      category: "beauty-care",
      shortDescription: "Flameless reed diffuser — Neroli & White Tea.",
      description:
        "<p>A flameless reed diffuser that scents a room for up to twelve weeks. Bright neroli lifted by soft white tea. Natural rattan reeds included.</p>",
      price: 22,
      quantity: 180,
      brand: "Grace",
    },
    {
      name: "Cove Cotton Woven Storage Bin",
      slug: "cove-cotton-woven-storage-bin",
      sku: "BT-BIN-022",
      category: "bags-travel",
      shortDescription: "Collapsible rope bin with reinforced handles.",
      description:
        "<p>A soft cotton-rope bin that collapses flat when not in use and springs back into shape when you need it. Great for laundry, blankets or toys.</p>",
      price: 31,
      quantity: 105,
      brand: "Cove",
    },
  ];

  let created = 0;
  for (const p of products) {
    const category = categoryBySlug.get(p.category);
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        quantity: p.quantity,
        status: "ACTIVE",
        isFeatured: p.isFeatured ?? false,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        quantity: p.quantity,
        brand: p.brand,
        status: "ACTIVE",
        isFeatured: p.isFeatured ?? false,
        categories: { create: { categoryId: category.id } },
        images: {
          create: [1, 2, 3].map((n) => ({
            url: img(p.slug, n),
            alt: p.name,
            sortOrder: n - 1,
          })),
        },
      },
    });
    created += 1;
  }
  console.log(`Created ${created} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
