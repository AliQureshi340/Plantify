import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:5000/api";

const plantCategories = ["All", "Trees", "Shrubs", "Herbs", "Flowers", "Vegetables", "Succulents"];

const mockPlants = [
  // ───── FRUITS ─────
  { _id: "1", name: "Mango", scientificName: "Mangifera indica", family: "Anacardiaceae", category: "Trees", description: "King of fruits. Large tropical tree producing sweet, juicy fruits. National tree of Pakistan and India.", image: "https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Deep well-drained", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 500–2000", availability: "Seasonal", health: "Rich in vitamins A, C, B6. Boosts immunity and digestion.", diseases: ["Anthracnose", "Powdery Mildew", "Mango Malformation"], tags: ["fruit", "tropical", "shade", "national-tree"] },
  { _id: "2", name: "Banana", scientificName: "Musa acuminata", family: "Musaceae", category: "Trees", description: "Fast-growing tropical plant producing energy-rich fruits. One of the world's most consumed fruits.", image: "https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "High", sunlight: "Full Sun", soil: "Rich, moist loam", difficulty: "Easy" }, climate: "Tropical", price: "PKR 100–300", availability: "Year-round", health: "High in potassium, vitamin B6, fiber. Great energy source.", diseases: ["Panama Disease", "Black Sigatoka", "Bunchy Top"], tags: ["fruit", "tropical", "indoor-pot"] },
  { _id: "3", name: "Apple", scientificName: "Malus domestica", family: "Rosaceae", category: "Trees", description: "Deciduous fruit tree producing crisp, sweet-tart fruits. Thrives in cool temperate climates.", image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 300–800", availability: "Seasonal", health: "Rich in fiber, vitamin C. Reduces risk of heart disease.", diseases: ["Apple Scab", "Fire Blight", "Powdery Mildew"], tags: ["fruit", "temperate", "orchard"] },
  { _id: "4", name: "Guava", scientificName: "Psidium guajava", family: "Myrtaceae", category: "Trees", description: "Tropical fruit tree with fragrant white flowers and vitamin-rich fruits. Very hardy and productive.", image: "https://images.pexels.com/photos/5945559/pexels-photo-5945559.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 100–400", availability: "Common", health: "Highest vitamin C of any fruit. Antibacterial, antioxidant.", diseases: ["Anthracnose", "Fruit Fly", "Wilt"], tags: ["fruit", "tropical", "medicinal"] },
  { _id: "5", name: "Papaya", scientificName: "Carica papaya", family: "Caricaceae", category: "Trees", description: "Fast-growing tropical tree bearing large orange fruits rich in digestive enzymes.", image: "https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Sandy loam", difficulty: "Easy" }, climate: "Tropical", price: "PKR 80–250", availability: "Year-round", health: "Contains papain enzyme. Aids digestion, anti-inflammatory.", diseases: ["Papaya Ringspot Virus", "Powdery Mildew", "Root Rot"], tags: ["fruit", "tropical", "medicinal"] },
  { _id: "6", name: "Lemon", scientificName: "Citrus limon", family: "Rutaceae", category: "Trees", description: "Evergreen citrus tree producing tart yellow fruits packed with vitamin C.", image: "https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained sandy loam", difficulty: "Easy" }, climate: "Subtropical", price: "PKR 200–600", availability: "Year-round", health: "High vitamin C. Antibacterial, aids digestion, kidney stone prevention.", diseases: ["Citrus Canker", "Greasy Spot", "Aphids"], tags: ["fruit", "citrus", "container-friendly"] },
  { _id: "7", name: "Pomegranate", scientificName: "Punica granatum", family: "Lythraceae", category: "Shrubs", description: "Drought-tolerant shrub producing ruby-red fruits rich in antioxidants.", image: "https://images.pexels.com/photos/65882/pomegranate-red-fruit-sweet-65882.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Easy" }, climate: "Arid & Mediterranean", price: "PKR 300–900", availability: "Seasonal", health: "Powerful antioxidants. Reduces inflammation, heart disease risk.", diseases: ["Fruit Rot", "Leaf Spot", "Aphids"], tags: ["fruit", "drought-tolerant", "ornamental"] },
  { _id: "8", name: "Strawberry", scientificName: "Fragaria × ananassa", family: "Rosaceae", category: "Flowers", description: "Low-growing plant producing sweet red berries. Popular in home gardens and containers.", image: "https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Easy" }, climate: "Temperate", price: "PKR 400–1200", availability: "Seasonal", health: "High in vitamin C, manganese, folate. Anti-inflammatory.", diseases: ["Gray Mold", "Powdery Mildew", "Spider Mites"], tags: ["fruit", "container", "berry"] },
  { _id: "9", name: "Watermelon", scientificName: "Citrullus lanatus", family: "Cucurbitaceae", category: "Vegetables", description: "Vine crop producing large, juicy fruits — perfect for hot climates.", image: "https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate–High", sunlight: "Full Sun", soil: "Sandy loam", difficulty: "Moderate" }, climate: "Tropical & Subtropical", price: "PKR 50–200", availability: "Seasonal", health: "92% water, lycopene, vitamin A. Hydrating and anti-oxidant rich.", diseases: ["Fusarium Wilt", "Anthracnose", "Downy Mildew"], tags: ["fruit", "vine", "summer"] },
  { _id: "10", name: "Grapes", scientificName: "Vitis vinifera", family: "Vitaceae", category: "Shrubs", description: "Climbing vine producing clusters of sweet or tart fruits. Used for eating, juice and raisins.", image: "https://images.pexels.com/photos/760281/pexels-photo-760281.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Moderate" }, climate: "Mediterranean & Temperate", price: "PKR 300–1000", availability: "Seasonal", health: "Resveratrol antioxidant. Heart health, anti-aging properties.", diseases: ["Powdery Mildew", "Downy Mildew", "Botrytis"], tags: ["fruit", "vine", "ornamental"] },

  // ───── VEGETABLES ─────
  { _id: "11", name: "Tomato", scientificName: "Solanum lycopersicum", family: "Solanaceae", category: "Vegetables", description: "Most popular home garden vegetable. Produces red fruits rich in lycopene and vitamins.", image: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Easy" }, climate: "Temperate to Tropical", price: "PKR 50–200", availability: "Year-round", health: "High lycopene, vitamin C, K. Reduces cancer risk.", diseases: ["Early Blight", "Late Blight", "Blossom End Rot"], tags: ["vegetable", "container", "kitchen-garden"] },
  { _id: "12", name: "Spinach", scientificName: "Spinacia oleracea", family: "Amaranthaceae", category: "Vegetables", description: "Fast-growing leafy green packed with iron and nutrients. Ideal for cool seasons.", image: "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Partial to Full Sun", soil: "Rich, moist", difficulty: "Very Easy" }, climate: "Cool Temperate", price: "PKR 30–100", availability: "Seasonal", health: "Rich in iron, folate, vitamin K. Bone health, energy booster.", diseases: ["Downy Mildew", "Leaf Spot", "Aphids"], tags: ["vegetable", "leafy", "fast-growing", "kitchen-garden"] },
  { _id: "13", name: "Potato", scientificName: "Solanum tuberosum", family: "Solanaceae", category: "Vegetables", description: "Starchy underground tuber. One of the world's most important food crops.", image: "https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Loose, well-drained", difficulty: "Easy" }, climate: "Cool Temperate", price: "PKR 40–120", availability: "Year-round", health: "High in potassium, vitamin C, B6. Energy-dense.", diseases: ["Late Blight", "Scab", "Blackleg"], tags: ["vegetable", "root", "staple-crop"] },
  { _id: "14", name: "Onion", scientificName: "Allium cepa", family: "Amaryllidaceae", category: "Vegetables", description: "Bulb vegetable essential in cooking worldwide. Strong flavor and medicinal properties.", image: "https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Easy" }, climate: "Temperate", price: "PKR 30–100", availability: "Year-round", health: "Quercetin antioxidant. Anti-inflammatory, heart health, antibacterial.", diseases: ["Purple Blotch", "Botrytis", "Downy Mildew"], tags: ["vegetable", "bulb", "kitchen-staple"] },
  { _id: "15", name: "Garlic", scientificName: "Allium sativum", family: "Amaryllidaceae", category: "Herbs", description: "Pungent bulb used globally in cooking and traditional medicine. Powerful natural antibiotic.", image: "https://images.pexels.com/photos/1254364/pexels-photo-1254364.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Loose, well-drained", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 100–300", availability: "Year-round", health: "Allicin compound. Antifungal, antibacterial, heart health, immunity.", diseases: ["White Rot", "Rust", "Downy Mildew"], tags: ["vegetable", "herb", "medicinal", "kitchen-staple"] },
  { _id: "16", name: "Chili Pepper", scientificName: "Capsicum annuum", family: "Solanaceae", category: "Vegetables", description: "Hot or mild peppers used in cuisines worldwide. Easy to grow in pots or garden.", image: "https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained rich soil", difficulty: "Easy" }, climate: "Tropical to Temperate", price: "PKR 50–200", availability: "Year-round", health: "Capsaicin boosts metabolism, pain relief, anti-inflammatory.", diseases: ["Bacterial Wilt", "Anthracnose", "Aphids"], tags: ["vegetable", "container", "spice", "kitchen-garden"] },
  { _id: "17", name: "Bitter Gourd (Karela)", scientificName: "Momordica charantia", family: "Cucurbitaceae", category: "Vegetables", description: "Tropical vine vegetable famous for its bitter taste and powerful medicinal properties.", image: "https://images.pexels.com/photos/7543772/pexels-photo-7543772.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Rich loam", difficulty: "Easy" }, climate: "Tropical", price: "PKR 60–180", availability: "Seasonal", health: "Controls blood sugar. Antidiabetic, liver tonic, antiviral.", diseases: ["Powdery Mildew", "Downy Mildew", "Fruit Fly"], tags: ["vegetable", "medicinal", "vine", "diabetic-friendly"] },
  { _id: "18", name: "Pumpkin", scientificName: "Cucurbita pepo", family: "Cucurbitaceae", category: "Vegetables", description: "Large vine plant producing orange squash. Nutritious and easy to grow in warm seasons.", image: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "High", sunlight: "Full Sun", soil: "Rich, moist", difficulty: "Easy" }, climate: "Temperate to Tropical", price: "PKR 80–300", availability: "Seasonal", health: "Beta-carotene rich. Eye health, immune booster, low calorie.", diseases: ["Powdery Mildew", "Squash Vine Borer", "Bacterial Wilt"], tags: ["vegetable", "vine", "nutrition-rich"] },
  { _id: "19", name: "Carrot", scientificName: "Daucus carota", family: "Apiaceae", category: "Vegetables", description: "Root vegetable with sweet orange taproots rich in beta-carotene. Ideal for cool seasons.", image: "https://images.pexels.com/photos/1447175/pexels-photo-1447175.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Loose, deep sandy loam", difficulty: "Easy" }, climate: "Cool Temperate", price: "PKR 40–120", availability: "Seasonal", health: "High beta-carotene, vitamin A. Eye health, antioxidant.", diseases: ["Alternaria Blight", "Carrot Fly", "Root Knot Nematode"], tags: ["vegetable", "root", "kitchen-garden"] },
  { _id: "20", name: "Eggplant (Brinjal)", scientificName: "Solanum melongena", family: "Solanaceae", category: "Vegetables", description: "Tropical vegetable with glossy purple fruits. Staple in South Asian and Mediterranean cuisine.", image: "https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Easy" }, climate: "Tropical to Subtropical", price: "PKR 40–150", availability: "Year-round", health: "High fiber, antioxidants. Heart health, blood sugar control.", diseases: ["Phomopsis Blight", "Bacterial Wilt", "Aphids"], tags: ["vegetable", "container", "kitchen-staple"] },

  // ───── HERBS ─────
  { _id: "21", name: "Tulsi (Holy Basil)", scientificName: "Ocimum tenuiflorum", family: "Lamiaceae", category: "Herbs", description: "Sacred herb with exceptional medicinal value. Used in Ayurvedic medicine for centuries.", image: "https://images.pexels.com/photos/5946083/pexels-photo-5946083.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich moist loam", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 80–200", availability: "Widely Available", health: "Antibacterial, stress relief, respiratory benefits, immunity booster.", diseases: ["Fusarium Wilt", "Leaf Blight", "Aphids"], tags: ["herb", "medicinal", "indoor", "sacred"] },
  { _id: "22", name: "Mint", scientificName: "Mentha spicata", family: "Lamiaceae", category: "Herbs", description: "Aromatic herb that spreads rapidly. Used in teas, cooking, and traditional medicine.", image: "https://images.pexels.com/photos/2892476/pexels-photo-2892476.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Partial Sun", soil: "Moist, rich", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 50–150", availability: "Common", health: "Relieves indigestion, nausea, headaches. Antibacterial, cooling.", diseases: ["Rust", "Powdery Mildew", "Verticillium Wilt"], tags: ["herb", "indoor", "container", "medicinal", "culinary"] },
  { _id: "23", name: "Coriander (Dhaniya)", scientificName: "Coriandrum sativum", family: "Apiaceae", category: "Herbs", description: "Fast-growing herb used in cooking across Asia and the Middle East. Both leaves and seeds are used.", image: "https://images.pexels.com/photos/4198929/pexels-photo-4198929.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full to Partial Sun", soil: "Well-drained loam", difficulty: "Very Easy" }, climate: "Cool Temperate", price: "PKR 20–80", availability: "Widely Available", health: "Anti-inflammatory, lowers blood sugar and cholesterol.", diseases: ["Powdery Mildew", "Leaf Spot", "Aphids"], tags: ["herb", "culinary", "fast-growing", "container"] },
  { _id: "24", name: "Aloe Vera", scientificName: "Aloe barbadensis miller", family: "Asphodelaceae", category: "Succulents", description: "Succulent plant famous for its gel used in skincare and burn treatment. Extremely low maintenance.", image: "https://images.pexels.com/photos/1736233/pexels-photo-1736233.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Indirect to Full Sun", soil: "Sandy, well-drained", difficulty: "Very Easy" }, climate: "Arid & Semi-Arid", price: "PKR 100–300", availability: "Widely Available", health: "Skin healing, digestive aid, anti-inflammatory, burn treatment.", diseases: ["Root Rot", "Mealybugs", "Soft Rot"], tags: ["medicinal", "indoor", "low-water", "succulent"] },
  { _id: "25", name: "Fenugreek (Methi)", scientificName: "Trigonella foenum-graecum", family: "Fabaceae", category: "Herbs", description: "Multi-purpose herb used in South Asian cuisine. Both leaves and seeds are highly nutritious.", image: "https://images.pexels.com/photos/9214854/pexels-photo-9214854.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Very Easy" }, climate: "Cool Temperate", price: "PKR 30–80", availability: "Widely Available", health: "Controls blood sugar, boosts testosterone, anti-inflammatory.", diseases: ["Powdery Mildew", "Root Rot", "Charcoal Rot"], tags: ["herb", "culinary", "medicinal", "fast-growing"] },
  { _id: "26", name: "Ginger", scientificName: "Zingiber officinale", family: "Zingiberaceae", category: "Herbs", description: "Tropical rhizome used as spice and medicine. One of the most widely used medicinal plants.", image: "https://images.pexels.com/photos/1191576/pexels-photo-1191576.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Partial Shade", soil: "Rich, moist", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 100–350", availability: "Year-round", health: "Anti-nausea, anti-inflammatory, aids digestion, immune support.", diseases: ["Soft Rot", "Bacterial Wilt", "Rhizome Rot"], tags: ["herb", "spice", "medicinal", "container"] },
  { _id: "27", name: "Turmeric", scientificName: "Curcuma longa", family: "Zingiberaceae", category: "Herbs", description: "Tropical rhizome producing golden spice. One of nature's most powerful anti-inflammatory agents.", image: "https://images.pexels.com/photos/2460842/pexels-photo-2460842.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Partial to Full Sun", soil: "Rich, well-drained", difficulty: "Easy" }, climate: "Tropical", price: "PKR 150–400", availability: "Common", health: "Curcumin compound. Powerful anti-inflammatory, antioxidant, brain health.", diseases: ["Rhizome Rot", "Leaf Blotch", "Leaf Spot"], tags: ["herb", "spice", "medicinal", "ayurvedic"] },
  { _id: "28", name: "Curry Leaf", scientificName: "Murraya koenigii", family: "Rutaceae", category: "Trees", description: "Aromatic shrub/tree native to South Asia. Leaves are essential in Indian and Pakistani cooking.", image: "https://images.pexels.com/photos/9774133/pexels-photo-9774133.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained sandy loam", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 100–400", availability: "Common", health: "Antidiabetic, antioxidant, reduces cholesterol.", diseases: ["Leaf Spot", "Scale Insects", "Psyllids"], tags: ["herb", "culinary", "container", "aromatic"] },

  // ───── INDOOR PLANTS ─────
  { _id: "29", name: "Money Plant", scientificName: "Epipremnum aureum", family: "Araceae", category: "Shrubs", description: "Popular indoor vine known for air purification and easy propagation. Thrives in low light.", image: "https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Low to Indirect", soil: "Any potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 100–500", availability: "Very Common", health: "Removes formaldehyde, benzene from air. Reduces stress.", diseases: ["Root Rot", "Bacterial Wilt", "Mealybugs"], tags: ["indoor", "air-purifier", "low-light", "vine"] },
  { _id: "30", name: "Peace Lily", scientificName: "Spathiphyllum wallisii", family: "Araceae", category: "Flowers", description: "Elegant indoor plant with white flowers. One of NASA's top air-purifying plants.", image: "https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Low to Indirect", soil: "Peat-based potting mix", difficulty: "Easy" }, climate: "Tropical", price: "PKR 300–800", availability: "Common", health: "Removes benzene, formaldehyde, ammonia from air.", diseases: ["Root Rot", "Leaf Blight", "Mealybugs"], tags: ["indoor", "air-purifier", "flowering", "low-light"] },
  { _id: "31", name: "Snake Plant", scientificName: "Sansevieria trifasciata", family: "Asparagaceae", category: "Succulents", description: "Nearly indestructible indoor plant that purifies air even at night. Perfect for beginners.", image: "https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Very Low", sunlight: "Any light", soil: "Well-drained sandy", difficulty: "Very Easy" }, climate: "Tropical & Arid", price: "PKR 150–500", availability: "Very Common", health: "Produces oxygen at night. Removes toxins from air.", diseases: ["Root Rot", "Southern Blight", "Red Leaf Spot"], tags: ["indoor", "air-purifier", "low-maintenance", "beginner"] },
  { _id: "32", name: "Rubber Plant", scientificName: "Ficus elastica", family: "Moraceae", category: "Trees", description: "Bold indoor tree with large glossy leaves. Excellent air purifier and statement plant.", image: "https://images.pexels.com/photos/6297424/pexels-photo-6297424.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Bright Indirect", soil: "Well-drained potting mix", difficulty: "Easy" }, climate: "Tropical", price: "PKR 400–1500", availability: "Common", health: "Purifies indoor air, absorbs carbon dioxide.", diseases: ["Root Rot", "Leaf Drop", "Mealybugs"], tags: ["indoor", "air-purifier", "statement-plant"] },
  { _id: "33", name: "Spider Plant", scientificName: "Chlorophytum comosum", family: "Asparagaceae", category: "Flowers", description: "Hardy hanging plant with arching green and white striped leaves. Easy to propagate.", image: "https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Indirect", soil: "Any well-drained", difficulty: "Very Easy" }, climate: "Temperate to Tropical", price: "PKR 150–400", availability: "Very Common", health: "Removes CO, formaldehyde. Safe for pets.", diseases: ["Root Rot", "Tip Burn", "Scale"], tags: ["indoor", "hanging", "pet-safe", "beginner"] },
  { _id: "34", name: "ZZ Plant", scientificName: "Zamioculcas zamiifolia", family: "Araceae", category: "Shrubs", description: "Extremely drought-tolerant indoor plant with glossy dark green leaves. Nearly impossible to kill.", image: "https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Very Low", sunlight: "Low to Bright Indirect", soil: "Well-drained potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 300–900", availability: "Common", health: "Air purifier. Tolerates neglect.", diseases: ["Root Rot", "Stem Rot"], tags: ["indoor", "low-maintenance", "low-light", "drought-tolerant"] },
  { _id: "35", name: "Jade Plant", scientificName: "Crassula ovata", family: "Crassulaceae", category: "Succulents", description: "Succulent with thick oval leaves. Long-lived indoor plant considered lucky in many cultures.", image: "https://images.pexels.com/photos/7728853/pexels-photo-7728853.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Bright Indirect to Full Sun", soil: "Succulent mix", difficulty: "Very Easy" }, climate: "Arid", price: "PKR 200–600", availability: "Common", health: "Air purifier. Symbolic of good luck and prosperity.", diseases: ["Root Rot", "Powdery Mildew", "Mealybugs"], tags: ["indoor", "succulent", "lucky-plant", "low-water"] },
  { _id: "36", name: "Bamboo Palm", scientificName: "Dypsis lutescens", family: "Arecaceae", category: "Trees", description: "Elegant indoor palm with feathery fronds. Excellent air purifier and humidity regulator.", image: "https://images.pexels.com/photos/5632377/pexels-photo-5632377.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Indirect to Bright", soil: "Well-drained potting mix", difficulty: "Easy" }, climate: "Tropical", price: "PKR 500–2000", availability: "Common", health: "Removes benzene, trichloroethylene. Adds humidity.", diseases: ["Root Rot", "Spider Mites", "Scale"], tags: ["indoor", "air-purifier", "tropical", "statement-plant"] },

  // ───── FLOWERS ─────
  { _id: "37", name: "Rose", scientificName: "Rosa hybrid", family: "Rosaceae", category: "Flowers", description: "Classic flowering shrub prized for its beautiful blooms and fragrance. Available in hundreds of cultivars.", image: "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, moist well-drained", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 200–1200", availability: "Common", health: "Aromatherapy benefits. Vitamin C in rose hips. Stress relief.", diseases: ["Black Spot", "Aphids", "Rust", "Powdery Mildew"], tags: ["flower", "ornamental", "fragrant", "garden"] },
  { _id: "38", name: "Marigold", scientificName: "Tagetes erecta", family: "Asteraceae", category: "Flowers", description: "Vibrant orange and yellow flowers. Natural pest repellent and used in religious ceremonies across South Asia.", image: "https://images.pexels.com/photos/46235/marigold-flower-bloom-blossom-46235.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Very Easy" }, climate: "Tropical to Temperate", price: "PKR 50–200", availability: "Widely Available", health: "Antiseptic, anti-inflammatory. Used in wound healing.", diseases: ["Powdery Mildew", "Botrytis", "Root Rot"], tags: ["flower", "pest-repellent", "ornamental", "religious"] },
  { _id: "39", name: "Sunflower", scientificName: "Helianthus annuus", family: "Asteraceae", category: "Flowers", description: "Tall annual flower with large golden heads that track the sun. Seeds are edible and oil-rich.", image: "https://images.pexels.com/photos/33044/sunflower-sun-summer-yellow.jpg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 50–150", availability: "Seasonal", health: "Seeds rich in vitamin E, selenium. Heart health.", diseases: ["Downy Mildew", "Rust", "Sclerotinia"], tags: ["flower", "edible-seeds", "ornamental", "annual"] },
  { _id: "40", name: "Jasmine", scientificName: "Jasminum officinale", family: "Oleaceae", category: "Shrubs", description: "Climbing shrub with intensely fragrant white flowers. Used in perfumery and herbal teas.", image: "https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun to Partial Shade", soil: "Well-drained loam", difficulty: "Easy" }, climate: "Tropical to Temperate", price: "PKR 150–500", availability: "Common", health: "Reduces anxiety, improves sleep. Antioxidant properties.", diseases: ["Root Rot", "Blight", "Scale Insects"], tags: ["flower", "fragrant", "ornamental", "tea"] },
  { _id: "41", name: "Hibiscus", scientificName: "Hibiscus rosa-sinensis", family: "Malvaceae", category: "Shrubs", description: "Tropical shrub with large, showy flowers. Used in herbal teas and traditional medicine.", image: "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 200–700", availability: "Common", health: "Lowers blood pressure, rich in vitamin C, antioxidants.", diseases: ["Leaf Spot", "Root Rot", "Aphids", "Whitefly"], tags: ["flower", "ornamental", "medicinal", "tea"] },
  { _id: "42", name: "Dahlia", scientificName: "Dahlia pinnata", family: "Asteraceae", category: "Flowers", description: "Spectacular flowering plant with blooms in every color except blue. Tuber-based perennial.", image: "https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 300–1000", availability: "Seasonal", health: "Ornamental. Edible tubers in some varieties.", diseases: ["Powdery Mildew", "Botrytis", "Dahlia Mosaic Virus"], tags: ["flower", "ornamental", "garden", "colorful"] },
  { _id: "43", name: "Bougainvillea", scientificName: "Bougainvillea spectabilis", family: "Nyctaginaceae", category: "Shrubs", description: "Vigorous climbing shrub with stunning papery bracts in pink, purple, red, or orange.", image: "https://images.pexels.com/photos/2063713/pexels-photo-2063713.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Well-drained", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 200–800", availability: "Common", health: "Traditional use for cough, skin conditions.", diseases: ["Root Rot", "Leaf Spot", "Scale"], tags: ["flower", "ornamental", "drought-tolerant", "climber"] },
  { _id: "44", name: "Lavender", scientificName: "Lavandula angustifolia", family: "Lamiaceae", category: "Herbs", description: "Fragrant purple flowering herb used in aromatherapy, perfumery, and culinary applications.", image: "https://images.pexels.com/photos/1843717/pexels-photo-1843717.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Easy" }, climate: "Mediterranean", price: "PKR 300–900", availability: "Moderate", health: "Reduces anxiety, insomnia. Antifungal, antibacterial.", diseases: ["Root Rot", "Shab", "Septoria Leaf Spot"], tags: ["flower", "herb", "fragrant", "medicinal", "aromatherapy"] },

  // ───── TREES ─────
  { _id: "45", name: "Neem Tree", scientificName: "Azadirachta indica", family: "Meliaceae", category: "Trees", description: "Fast-growing tree known for its medicinal properties. Used as natural pesticide and in traditional medicine.", image: "https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Well-drained loamy", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 150–400", availability: "Widely Available", health: "Antibacterial, antifungal. Purifies air. Dental health.", diseases: ["Powdery Mildew", "Leaf Spot", "Sooty Mold"], tags: ["medicinal", "shade", "fast-growing", "plantation"] },
  { _id: "46", name: "Eucalyptus", scientificName: "Eucalyptus globulus", family: "Myrtaceae", category: "Trees", description: "Fast-growing plantation tree with aromatic leaves. Used for timber, essential oils, and paper.", image: "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Well-drained", difficulty: "Easy" }, climate: "Mediterranean to Tropical", price: "PKR 100–300", availability: "Common", health: "Decongestant, antibacterial, anti-inflammatory oil.", diseases: ["Leaf Scorch", "Canker", "Psyllids"], tags: ["plantation", "timber", "medicinal", "fast-growing"] },
  { _id: "47", name: "Banyan Tree", scientificName: "Ficus benghalensis", family: "Moraceae", category: "Trees", description: "Sacred tree of India with aerial roots that form additional trunks. Can cover massive areas.", image: "https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Easy" }, climate: "Tropical", price: "PKR 200–600", availability: "Common", health: "Bark used in diabetes treatment. Antioxidant.", diseases: ["Leaf Spot", "Blight", "Scale"], tags: ["shade", "sacred", "ornamental", "plantation"] },
  { _id: "48", name: "Coconut Palm", scientificName: "Cocos nucifera", family: "Arecaceae", category: "Trees", description: "The tree of life. Every part is useful — fruit, oil, shell, fiber, and timber.", image: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate–High", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Moderate" }, climate: "Tropical Coastal", price: "PKR 500–2000", availability: "Common", health: "Electrolytes in water, MCTs in oil. Antiviral, antimicrobial.", diseases: ["Bud Rot", "Coconut Mite", "Root Wilt"], tags: ["fruit", "plantation", "coastal", "multi-purpose"] },
  { _id: "49", name: "Date Palm", scientificName: "Phoenix dactylifera", family: "Arecaceae", category: "Trees", description: "Ancient desert tree producing nutrient-rich dates. Culturally significant in the Middle East and South Asia.", image: "https://images.pexels.com/photos/3669638/pexels-photo-3669638.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Moderate" }, climate: "Arid & Desert", price: "PKR 1000–5000", availability: "Moderate", health: "High in fiber, potassium, magnesium. Natural energy booster.", diseases: ["Bayoud Disease", "Black Scorch", "Bud Rot"], tags: ["fruit", "desert", "sacred", "plantation"] },
  { _id: "50", name: "Mulberry", scientificName: "Morus alba", family: "Moraceae", category: "Trees", description: "Fast-growing tree producing sweet berries. Also used for silkworm cultivation.", image: "https://images.pexels.com/photos/1174932/pexels-photo-1174932.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Easy" }, climate: "Temperate to Subtropical", price: "PKR 200–600", availability: "Common", health: "Antioxidant anthocyanins. Blood sugar control.", diseases: ["Leaf Spot", "Canker", "Root Rot"], tags: ["fruit", "shade", "fast-growing", "plantation"] },
  { _id: "51", name: "Peepal Tree", scientificName: "Ficus religiosa", family: "Moraceae", category: "Trees", description: "Sacred fig tree revered in Buddhism and Hinduism. Excellent oxygen producer.", image: "https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 100–400", availability: "Common", health: "Produces oxygen 24/7. Bark used in traditional medicine.", diseases: ["Leaf Spot", "Root Rot"], tags: ["sacred", "shade", "plantation", "medicinal"] },

  // ───── SUCCULENTS & CACTI ─────
  { _id: "52", name: "Cactus (Barrel)", scientificName: "Ferocactus cylindraceus", family: "Cactaceae", category: "Succulents", description: "Iconic barrel-shaped desert cactus. Stores water in its body. Near-zero maintenance.", image: "https://images.pexels.com/photos/1298395/pexels-photo-1298395.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Very Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Very Easy" }, climate: "Desert & Arid", price: "PKR 200–800", availability: "Common", health: "Decorative. Reduces indoor stress.", diseases: ["Root Rot", "Scale Insects", "Bacterial Rot"], tags: ["indoor", "succulent", "low-water", "desert"] },
  { _id: "53", name: "Echeveria", scientificName: "Echeveria elegans", family: "Crassulaceae", category: "Succulents", description: "Beautiful rosette-forming succulent in stunning colors. Perfect for windowsills and containers.", image: "https://images.pexels.com/photos/1438190/pexels-photo-1438190.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Bright Indirect to Full Sun", soil: "Succulent mix", difficulty: "Very Easy" }, climate: "Arid", price: "PKR 150–500", availability: "Common", health: "Air purifier. Aesthetic mental health benefits.", diseases: ["Root Rot", "Mealybugs", "Leaf Drop"], tags: ["indoor", "succulent", "decorative", "container"] },

  // ───── PLANTATION TREES ─────
  { _id: "54", name: "Sheesham (Rosewood)", scientificName: "Dalbergia sissoo", family: "Fabaceae", category: "Trees", description: "Fast-growing nitrogen-fixing timber tree. National tree of Pakistan. Excellent shade provider.", image: "https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Easy" }, climate: "Tropical & Subtropical", price: "PKR 150–500", availability: "Widely Available", health: "Nitrogen fixer. Wood used medicinally in Ayurveda.", diseases: ["Die Back", "Root Rot", "Leaf Rust"], tags: ["timber", "plantation", "shade", "nitrogen-fixing"] },
  { _id: "55", name: "Poplar", scientificName: "Populus deltoides", family: "Salicaceae", category: "Trees", description: "Extremely fast-growing plantation tree. Used for paper, plywood, and agroforestry in Pakistan.", image: "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "High", sunlight: "Full Sun", soil: "Moist, fertile", difficulty: "Easy" }, climate: "Temperate", price: "PKR 100–400", availability: "Widely Available", health: "Bark has analgesic properties.", diseases: ["Leaf Rust", "Canker", "Leaf Spot"], tags: ["timber", "plantation", "fast-growing", "agroforestry"] },
  { _id: "56", name: "Chikoo (Sapodilla)", scientificName: "Manilkara zapota", family: "Sapotaceae", category: "Trees", description: "Tropical fruit tree bearing brown oval fruits with caramel-like sweet flesh.", image: "https://images.pexels.com/photos/4194862/pexels-photo-4194862.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Sandy loam", difficulty: "Easy" }, climate: "Tropical", price: "PKR 300–800", availability: "Seasonal", health: "High tannins, anti-diarrheal. Rich in vitamins A, C.", diseases: ["Leaf Spot", "Fruit Fly", "Sooty Mold"], tags: ["fruit", "tropical", "shade"] },
  { _id: "57", name: "Jackfruit", scientificName: "Artocarpus heterophyllus", family: "Moraceae", category: "Trees", description: "World's largest tree-borne fruit. Young fruit used as meat substitute; ripe fruit is sweet.", image: "https://images.pexels.com/photos/5945595/pexels-photo-5945595.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Deep, well-drained loam", difficulty: "Easy" }, climate: "Tropical", price: "PKR 400–1500", availability: "Seasonal", health: "High in fiber, vitamins A, C, B6. Antioxidant.", diseases: ["Fruit Rot", "Rhizopus Rot", "Bark Borer"], tags: ["fruit", "tropical", "shade", "vegan-meat"] },
  { _id: "58", name: "Lychee", scientificName: "Litchi chinensis", family: "Sapindaceae", category: "Trees", description: "Subtropical fruit tree producing sweet, juicy fruits with bumpy red skin.", image: "https://images.pexels.com/photos/3696175/pexels-photo-3696175.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Well-drained acidic", difficulty: "Moderate" }, climate: "Subtropical", price: "PKR 500–1800", availability: "Seasonal", health: "High in vitamin C, potassium. Anti-inflammatory.", diseases: ["Anthracnose", "Root Rot", "Erinose Mite"], tags: ["fruit", "subtropical", "premium"] },
  { _id: "59", name: "Peach", scientificName: "Prunus persica", family: "Rosaceae", category: "Trees", description: "Deciduous fruit tree producing fragrant, fuzzy-skinned stone fruits.", image: "https://images.pexels.com/photos/1414790/pexels-photo-1414790.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained sandy loam", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 400–1200", availability: "Seasonal", health: "Rich in antioxidants, vitamins A, C. Good for skin.", diseases: ["Leaf Curl", "Brown Rot", "Powdery Mildew"], tags: ["fruit", "temperate", "orchard"] },
  { _id: "60", name: "Apricot", scientificName: "Prunus armeniaca", family: "Rosaceae", category: "Trees", description: "Small deciduous tree growing orange stone fruits. Widely cultivated in Gilgit-Baltistan.", image: "https://images.pexels.com/photos/5945594/pexels-photo-5945594.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Easy" }, climate: "Cold Temperate", price: "PKR 300–1000", availability: "Seasonal", health: "High in beta-carotene, vitamin A. Eye health.", diseases: ["Bacterial Canker", "Brown Rot", "Cytospora Canker"], tags: ["fruit", "mountain", "orchard", "pakistan"] },
  { _id: "61", name: "Fig", scientificName: "Ficus carica", family: "Moraceae", category: "Trees", description: "Ancient fruit tree producing sweet, seed-filled fruits. Drought tolerant once established.", image: "https://images.pexels.com/photos/3850660/pexels-photo-3850660.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Easy" }, climate: "Mediterranean to Subtropical", price: "PKR 300–900", availability: "Seasonal", health: "High in fiber, calcium, potassium. Digestive health.", diseases: ["Fig Mosaic Virus", "Root Knot", "Canker"], tags: ["fruit", "drought-tolerant", "orchard", "sacred"] },

  // ───── SHRUBS ─────
  { _id: "62", name: "Henna (Mehndi)", scientificName: "Lawsonia inermis", family: "Lythraceae", category: "Shrubs", description: "Shrub whose leaves produce natural orange-red dye used in body art and hair coloring.", image: "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Well-drained sandy", difficulty: "Easy" }, climate: "Tropical & Arid", price: "PKR 100–400", availability: "Common", health: "Antifungal, antibacterial. Cools body temperature.", diseases: ["Leaf Spot", "Root Rot"], tags: ["medicinal", "cosmetic", "cultural", "drought-tolerant"] },
  { _id: "63", name: "Oleander", scientificName: "Nerium oleander", family: "Apocynaceae", category: "Shrubs", description: "Ornamental shrub with showy pink or white flowers. Extremely drought tolerant.", image: "https://images.pexels.com/photos/4041056/pexels-photo-4041056.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Very Easy" }, climate: "Mediterranean & Subtropical", price: "PKR 100–400", availability: "Common", health: "Ornamental. Note: Toxic if ingested.", diseases: ["Leaf Scorch", "Bacterial Gall", "Scale"], tags: ["ornamental", "drought-tolerant", "roadside", "toxic"] },
  { _id: "64", name: "Croton", scientificName: "Codiaeum variegatum", family: "Euphorbiaceae", category: "Shrubs", description: "Vibrant tropical shrub with multicolored leaves in red, yellow, orange, and green.", image: "https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Bright Indirect to Full Sun", soil: "Well-drained rich", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 200–600", availability: "Common", health: "Air purifier. Traditional medicinal uses.", diseases: ["Root Rot", "Mealybugs", "Spider Mites"], tags: ["indoor", "ornamental", "colorful", "tropical"] },
  { _id: "65", name: "Pothos (Devil's Ivy)", scientificName: "Epipremnum pinnatum", family: "Araceae", category: "Shrubs", description: "Trailing vine with heart-shaped leaves. Virtually indestructible and thrives in any condition.", image: "https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Any", soil: "Any potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 100–400", availability: "Very Common", health: "Air purifier. Removes xylene, benzene.", diseases: ["Root Rot", "Bacterial Wilt"], tags: ["indoor", "low-light", "hanging", "beginner"] },
  { _id: "66", name: "Philodendron", scientificName: "Philodendron hederaceum", family: "Araceae", category: "Shrubs", description: "Classic trailing or climbing indoor plant with heart-shaped glossy leaves.", image: "https://images.pexels.com/photos/6913545/pexels-photo-6913545.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Indirect", soil: "Well-drained potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 200–700", availability: "Common", health: "Air purifier. Removes formaldehyde.", diseases: ["Root Rot", "Bacterial Blight", "Mealybugs"], tags: ["indoor", "tropical", "low-light", "hanging"] },
  { _id: "67", name: "Dracaena", scientificName: "Dracaena marginata", family: "Asparagaceae", category: "Trees", description: "Striking indoor tree with long thin leaves edged in red. Excellent air purifier.", image: "https://images.pexels.com/photos/4503751/pexels-photo-4503751.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Indirect", soil: "Well-drained potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 400–1500", availability: "Common", health: "Removes benzene, formaldehyde, trichloroethylene.", diseases: ["Root Rot", "Fluoride Toxicity", "Scale"], tags: ["indoor", "air-purifier", "statement-plant"] },
  { _id: "68", name: "Chinese Evergreen", scientificName: "Aglaonema commutatum", family: "Araceae", category: "Shrubs", description: "Low-maintenance indoor plant with beautiful patterned leaves. Extremely tolerant of neglect.", image: "https://images.pexels.com/photos/6913537/pexels-photo-6913537.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Low to Indirect", soil: "Well-drained potting mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 300–800", availability: "Common", health: "Air purifier. One of easiest plants to keep alive.", diseases: ["Root Rot", "Bacterial Blight", "Mealybugs"], tags: ["indoor", "low-light", "beginner", "ornamental"] },
  { _id: "69", name: "Boston Fern", scientificName: "Nephrolepis exaltata", family: "Nephrolepidaceae", category: "Flowers", description: "Lush hanging fern with feathery fronds. Excellent humidity regulator and air purifier.", image: "https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Indirect", soil: "Peat-based moist mix", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 300–900", availability: "Common", health: "Removes formaldehyde, xylene. Adds humidity.", diseases: ["Root Rot", "Scale", "Fusarium Wilt"], tags: ["indoor", "hanging", "air-purifier", "humidity"] },
  { _id: "70", name: "Adenium (Desert Rose)", scientificName: "Adenium obesum", family: "Apocynaceae", category: "Succulents", description: "Stunning succulent with a swollen trunk and brilliant pink or red flowers.", image: "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Easy" }, climate: "Arid & Tropical", price: "PKR 500–2000", availability: "Moderate", health: "Ornamental. Traditional wound healing uses.", diseases: ["Root Rot", "Stem Rot", "Scale"], tags: ["indoor", "succulent", "flowering", "ornamental"] },
  { _id: "71", name: "Chrysanthemum", scientificName: "Chrysanthemum morifolium", family: "Asteraceae", category: "Flowers", description: "Beloved flowering plant with dense, colorful blooms. Used in teas and traditional medicine.", image: "https://images.pexels.com/photos/889839/pexels-photo-889839.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 200–600", availability: "Seasonal", health: "Anti-inflammatory, antioxidant tea. Reduces fever.", diseases: ["Powdery Mildew", "Leaf Spot", "Aphids"], tags: ["flower", "ornamental", "medicinal", "tea"] },
  { _id: "72", name: "Portulaca (Moss Rose)", scientificName: "Portulaca grandiflora", family: "Portulacaceae", category: "Flowers", description: "Vibrant low-growing succulent flower perfect for hot, dry conditions. Blooms all summer.", image: "https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Very Low", sunlight: "Full Sun", soil: "Sandy, poor soil", difficulty: "Very Easy" }, climate: "Tropical to Temperate", price: "PKR 50–200", availability: "Common", health: "Ornamental. Edible in some cultures.", diseases: ["Root Rot", "Aphids"], tags: ["flower", "drought-tolerant", "container", "colorful"] },
  { _id: "73", name: "Impatiens", scientificName: "Impatiens walleriana", family: "Balsaminaceae", category: "Flowers", description: "Prolific flowering annual perfect for shaded gardens. Blooms in vivid colors continuously.", image: "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Shade to Partial Sun", soil: "Rich, moist", difficulty: "Easy" }, climate: "Tropical", price: "PKR 100–300", availability: "Common", health: "Ornamental.", diseases: ["Downy Mildew", "Botrytis", "Root Rot"], tags: ["flower", "shade", "container", "colorful"] },
  { _id: "74", name: "Anthurium", scientificName: "Anthurium andraeanum", family: "Araceae", category: "Flowers", description: "Exotic indoor plant with waxy heart-shaped spathes in red, pink, or white. Long-lasting blooms.", image: "https://images.pexels.com/photos/4751969/pexels-photo-4751969.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Indirect", soil: "Well-drained orchid mix", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 500–2000", availability: "Moderate", health: "Air purifier. Removes ammonia, formaldehyde.", diseases: ["Root Rot", "Bacterial Blight", "Mealybugs"], tags: ["indoor", "flowering", "ornamental", "air-purifier"] },
  { _id: "75", name: "Kalanchoe", scientificName: "Kalanchoe blossfeldiana", family: "Crassulaceae", category: "Succulents", description: "Popular succulent with clusters of cheerful flowers in red, orange, yellow, or pink.", image: "https://images.pexels.com/photos/1438190/pexels-photo-1438190.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Bright Indirect", soil: "Well-drained succulent mix", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 200–600", availability: "Common", health: "Ornamental. Traditional wound healing in Madagascar.", diseases: ["Root Rot", "Powdery Mildew", "Mealybugs"], tags: ["indoor", "succulent", "flowering", "beginner"] },
  { _id: "76", name: "Moringa (Drumstick Tree)", scientificName: "Moringa oleifera", family: "Moringaceae", category: "Trees", description: "Miracle tree with highly nutritious leaves, pods, and seeds. Fastest growing food-producing tree.", image: "https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Very Easy" }, climate: "Tropical & Subtropical", price: "PKR 100–350", availability: "Common", health: "Highest protein of any plant leaf. 90+ nutrients, anti-inflammatory.", diseases: ["Root Rot", "Powdery Mildew", "Aphids"], tags: ["medicinal", "nutrition-rich", "fast-growing", "edible"] },
  { _id: "77", name: "Sugarcane", scientificName: "Saccharum officinarum", family: "Poaceae", category: "Vegetables", description: "Tall grass crop that is the world's largest source of sugar. Widely grown in Pakistan.", image: "https://images.pexels.com/photos/2280551/pexels-photo-2280551.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "High", sunlight: "Full Sun", soil: "Rich loam", difficulty: "Moderate" }, climate: "Tropical & Subtropical", price: "PKR 50–150", availability: "Widely Available", health: "Quick energy. Iron-rich juice. Liver tonic.", diseases: ["Red Rot", "Smut", "Ratoon Stunting"], tags: ["crop", "staple", "commercial", "juice"] },
  { _id: "78", name: "Cotton", scientificName: "Gossypium hirsutum", family: "Malvaceae", category: "Shrubs", description: "Major cash crop of Pakistan. Produces fiber used in textiles and oil from seeds.", image: "https://images.pexels.com/photos/5945758/pexels-photo-5945758.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Deep clay loam", difficulty: "Moderate" }, climate: "Subtropical", price: "PKR 200–800", availability: "Seasonal", health: "Seed oil used for cooking. Antimicrobial properties.", diseases: ["Cotton Leaf Curl Virus", "Boll Weevil", "Fusarium Wilt"], tags: ["cash-crop", "fiber", "commercial", "pakistan"] },
  { _id: "79", name: "Wheat", scientificName: "Triticum aestivum", family: "Poaceae", category: "Vegetables", description: "Most important grain crop in Pakistan. Staple food of billions worldwide.", image: "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained clay loam", difficulty: "Moderate" }, climate: "Cool Temperate", price: "PKR 40–100", availability: "Seasonal", health: "High in fiber, B vitamins, iron. Digestive health.", diseases: ["Rust", "Smut", "Karnal Bunt"], tags: ["grain", "staple-crop", "commercial", "pakistan"] },
  { _id: "80", name: "Chamomile", scientificName: "Matricaria chamomilla", family: "Asteraceae", category: "Herbs", description: "Delicate daisy-like flowering herb famous for its calming tea. Easy to grow in containers.", image: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 100–300", availability: "Moderate", health: "Powerful sleep aid, anxiety relief, digestive comfort.", diseases: ["Powdery Mildew", "Aphids", "Leaf Blight"], tags: ["herb", "medicinal", "tea", "container", "calming"] },
  { _id: "81", name: "Tulip", scientificName: "Tulipa gesneriana", family: "Liliaceae", category: "Flowers", description: "Elegant spring bulb flower in vivid colors. One of the world's most popular ornamental plants.", image: "https://images.pexels.com/photos/37838/pexels-photo-37838.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained sandy", difficulty: "Easy" }, climate: "Temperate", price: "PKR 300–900", availability: "Seasonal", health: "Ornamental. Petals edible in salads.", diseases: ["Tulip Fire", "Botrytis", "Aphids"], tags: ["flower", "bulb", "ornamental", "spring"] },
  { _id: "82", name: "Basil", scientificName: "Ocimum basilicum", family: "Lamiaceae", category: "Herbs", description: "Aromatic culinary herb essential in Italian and Asian cuisine. Easy to grow in pots.", image: "https://images.pexels.com/photos/2611897/pexels-photo-2611897.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Rich, moist", difficulty: "Very Easy" }, climate: "Tropical to Temperate", price: "PKR 50–150", availability: "Common", health: "Anti-inflammatory, antibacterial. Rich in vitamin K.", diseases: ["Fusarium Wilt", "Downy Mildew", "Aphids"], tags: ["herb", "culinary", "container", "aromatic"] },
  { _id: "83", name: "Rosemary", scientificName: "Salvia rosmarinus", family: "Lamiaceae", category: "Herbs", description: "Woody aromatic herb with needle-like leaves. Used in cooking and traditional medicine.", image: "https://images.pexels.com/photos/1599797/pexels-photo-1599797.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Easy" }, climate: "Mediterranean", price: "PKR 150–400", availability: "Moderate", health: "Improves memory, antioxidant, anti-inflammatory.", diseases: ["Root Rot", "Powdery Mildew", "Scale"], tags: ["herb", "culinary", "medicinal", "aromatic"] },
  { _id: "84", name: "Lemongrass", scientificName: "Cymbopogon citratus", family: "Poaceae", category: "Herbs", description: "Tropical grass with strong lemon scent. Used in cooking, teas, and mosquito repellent.", image: "https://images.pexels.com/photos/3511102/pexels-photo-3511102.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Very Easy" }, climate: "Tropical", price: "PKR 80–200", availability: "Common", health: "Antifungal, digestive aid, reduces fever, insect repellent.", diseases: ["Rust", "Leaf Blight", "Root Rot"], tags: ["herb", "culinary", "medicinal", "mosquito-repellent"] },
  { _id: "85", name: "Peppermint", scientificName: "Mentha × piperita", family: "Lamiaceae", category: "Herbs", description: "Strong-scented hybrid mint used in teas, medicines, and flavoring worldwide.", image: "https://images.pexels.com/photos/2892476/pexels-photo-2892476.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Partial Sun", soil: "Moist, rich", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 60–180", availability: "Common", health: "Relieves IBS, headaches, nausea. Antibacterial.", diseases: ["Rust", "Verticillium Wilt", "Powdery Mildew"], tags: ["herb", "medicinal", "tea", "container"] },
  { _id: "86", name: "Plum", scientificName: "Prunus domestica", family: "Rosaceae", category: "Trees", description: "Deciduous fruit tree producing sweet-tart stone fruits. Grows well in cool climates.", image: "https://images.pexels.com/photos/1414790/pexels-photo-1414790.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 400–1200", availability: "Seasonal", health: "High in antioxidants, vitamin C, fiber. Digestive health.", diseases: ["Brown Rot", "Plum Pox", "Aphids"], tags: ["fruit", "temperate", "orchard"] },
  { _id: "87", name: "Kiwi", scientificName: "Actinidia deliciosa", family: "Actinidiaceae", category: "Shrubs", description: "Vigorous climbing vine producing fuzzy brown fruits with bright green flesh.", image: "https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Moderate" }, climate: "Temperate", price: "PKR 600–2000", availability: "Seasonal", health: "Highest vitamin C per gram. Digestive enzymes, heart health.", diseases: ["Bacterial Canker", "Root Rot", "Armillaria"], tags: ["fruit", "vine", "temperate", "premium"] },
  { _id: "88", name: "Pineapple", scientificName: "Ananas comosus", family: "Bromeliaceae", category: "Flowers", description: "Tropical bromeliad producing sweet, tangy fruits. Can be grown in large containers.", image: "https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low–Moderate", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Moderate" }, climate: "Tropical", price: "PKR 200–600", availability: "Common", health: "Bromelain enzyme aids digestion. Anti-inflammatory, vitamin C.", diseases: ["Root Rot", "Mealybug Wilt", "Fruitlet Core Rot"], tags: ["fruit", "tropical", "container"] },
  { _id: "89", name: "Drumstick (Shanaj)", scientificName: "Moringa stenopetala", family: "Moringaceae", category: "Trees", description: "Nutritious tree whose pods, leaves and flowers are all edible. Drought resistant.", image: "https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Any well-drained", difficulty: "Very Easy" }, climate: "Tropical & Subtropical", price: "PKR 100–300", availability: "Common", health: "Iron, calcium, vitamin A rich. Anti-inflammatory, antidiabetic.", diseases: ["Root Rot", "Leaf Spot", "Aphids"], tags: ["edible", "medicinal", "drought-tolerant", "nutrition-rich"] },
  { _id: "90", name: "Bitter Orange", scientificName: "Citrus aurantium", family: "Rutaceae", category: "Trees", description: "Citrus tree with aromatic bitter fruits used in jams, perfumery, and herbal medicine.", image: "https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained sandy loam", difficulty: "Easy" }, climate: "Subtropical", price: "PKR 300–800", availability: "Moderate", health: "Metabolism booster, digestive aid, anti-anxiety.", diseases: ["Citrus Canker", "Greasy Spot", "Scale"], tags: ["citrus", "medicinal", "ornamental", "aromatic"] },
  { _id: "91", name: "Noni", scientificName: "Morinda citrifolia", family: "Rubiaceae", category: "Trees", description: "Tropical tree famous for its pungent medicinal fruit. Used in traditional Pacific medicine.", image: "https://images.pexels.com/photos/5945559/pexels-photo-5945559.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Any, very tolerant", difficulty: "Easy" }, climate: "Tropical", price: "PKR 500–1500", availability: "Rare", health: "Powerful antioxidant. Immune booster, anti-cancer properties.", diseases: ["Root Rot", "Scale", "Leaf Spot"], tags: ["medicinal", "fruit", "tropical", "superfood"] },
  { _id: "92", name: "Stevia", scientificName: "Stevia rebaudiana", family: "Asteraceae", category: "Herbs", description: "Natural sweetener plant 300x sweeter than sugar. Zero calories, ideal for diabetics.", image: "https://images.pexels.com/photos/4198929/pexels-photo-4198929.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Regular", sunlight: "Full Sun", soil: "Well-drained sandy", difficulty: "Easy" }, climate: "Subtropical", price: "PKR 150–400", availability: "Moderate", health: "Zero calorie sweetener. Blood sugar control, antioxidant.", diseases: ["Root Rot", "Septoria Leaf Spot", "Aphids"], tags: ["herb", "diabetic-friendly", "sweetener", "medicinal"] },
  { _id: "93", name: "Ashwagandha", scientificName: "Withania somnifera", family: "Solanaceae", category: "Herbs", description: "Ancient Ayurvedic adaptogen herb. Roots used to manage stress and boost vitality.", image: "https://images.pexels.com/photos/9214854/pexels-photo-9214854.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Easy" }, climate: "Arid & Subtropical", price: "PKR 200–600", availability: "Moderate", health: "Reduces stress/cortisol, boosts testosterone, anti-inflammatory.", diseases: ["Root Rot", "Leaf Spot", "Aphids"], tags: ["herb", "ayurvedic", "medicinal", "adaptogen"] },
  { _id: "94", name: "Catnip", scientificName: "Nepeta cataria", family: "Lamiaceae", category: "Herbs", description: "Aromatic herb related to mint. Famous for its effect on cats. Also used as herbal tea.", image: "https://images.pexels.com/photos/2892476/pexels-photo-2892476.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Well-drained", difficulty: "Very Easy" }, climate: "Temperate", price: "PKR 100–300", availability: "Rare", health: "Mild sedative, relieves anxiety and insomnia. Insect repellent.", diseases: ["Root Rot", "Powdery Mildew", "Aphids"], tags: ["herb", "medicinal", "pet-friendly", "tea"] },
  { _id: "95", name: "Curry Plant", scientificName: "Helichrysum italicum", family: "Asteraceae", category: "Herbs", description: "Silver-leafed aromatic herb with a strong curry-like fragrance. Used in Mediterranean cooking.", image: "https://images.pexels.com/photos/9774133/pexels-photo-9774133.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Low", sunlight: "Full Sun", soil: "Sandy, well-drained", difficulty: "Easy" }, climate: "Mediterranean", price: "PKR 150–400", availability: "Rare", health: "Anti-inflammatory, antimicrobial. Skin healing properties.", diseases: ["Root Rot", "Powdery Mildew"], tags: ["herb", "culinary", "aromatic", "medicinal"] },
  { _id: "96", name: "Areca Palm", scientificName: "Dypsis lutescens", family: "Arecaceae", category: "Trees", description: "Most popular indoor palm. Adds tropical elegance and purifies indoor air effectively.", image: "https://images.pexels.com/photos/5632377/pexels-photo-5632377.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Indirect", soil: "Well-drained potting mix", difficulty: "Easy" }, climate: "Tropical", price: "PKR 500–2500", availability: "Common", health: "Top NASA air purifier. Removes xylene, toluene.", diseases: ["Root Rot", "Spider Mites", "Scale"], tags: ["indoor", "air-purifier", "tropical", "statement-plant"] },
  { _id: "97", name: "Monstera", scientificName: "Monstera deliciosa", family: "Araceae", category: "Shrubs", description: "Iconic tropical plant with large split leaves. One of the most popular indoor plants worldwide.", image: "https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Bright Indirect", soil: "Well-drained potting mix", difficulty: "Easy" }, climate: "Tropical", price: "PKR 500–3000", availability: "Common", health: "Air purifier. Fruit edible when ripe.", diseases: ["Root Rot", "Scale", "Spider Mites"], tags: ["indoor", "tropical", "statement-plant", "air-purifier"] },
  { _id: "98", name: "Bird of Paradise", scientificName: "Strelitzia reginae", family: "Strelitziaceae", category: "Flowers", description: "Stunning tropical plant with orange and blue flowers resembling a bird in flight.", image: "https://images.pexels.com/photos/4751969/pexels-photo-4751969.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun to Bright Indirect", soil: "Rich, well-drained", difficulty: "Moderate" }, climate: "Tropical & Subtropical", price: "PKR 800–3000", availability: "Moderate", health: "Ornamental. Stress-reducing indoor plant.", diseases: ["Root Rot", "Scale", "Bacterial Wilt"], tags: ["flower", "indoor", "tropical", "statement-plant"] },
  { _id: "99", name: "Loquat", scientificName: "Eriobotrya japonica", family: "Rosaceae", category: "Trees", description: "Evergreen fruit tree producing clusters of orange-yellow fruits with sweet-tart flavor.", image: "https://images.pexels.com/photos/5945594/pexels-photo-5945594.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Well-drained loam", difficulty: "Easy" }, climate: "Subtropical", price: "PKR 300–1000", availability: "Seasonal", health: "Rich in vitamin A, potassium. Respiratory health, antioxidant.", diseases: ["Fire Blight", "Leaf Spot", "Scale"], tags: ["fruit", "subtropical", "ornamental", "pakistan"] },
  { _id: "100", name: "Passion Fruit", scientificName: "Passiflora edulis", family: "Passifloraceae", category: "Shrubs", description: "Vigorous climbing vine with exotic flowers and tangy aromatic fruits.", image: "https://images.pexels.com/photos/5945595/pexels-photo-5945595.jpeg?auto=compress&cs=tinysrgb&w=320", careGuide: { water: "Moderate", sunlight: "Full Sun", soil: "Rich, well-drained", difficulty: "Moderate" }, climate: "Tropical & Subtropical", price: "PKR 400–1500", availability: "Moderate", health: "Rich in vitamin C, antioxidants. Reduces anxiety, aids sleep.", diseases: ["Fusarium Wilt", "Root Rot", "Woodiness Virus"], tags: ["fruit", "vine", "tropical", "ornamental"] },
];




// ─── Chatbot Component ────────────────────────────────────────────────────────
function PlantChatbot({ searchQuery, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (searchQuery) {
      const autoMsg = `Tell me everything about the plant: "${searchQuery}" — include scientific name, family, care guide (water, sunlight, soil, difficulty), climate, price range (PKR), health benefits, common diseases, and usage tags.`;
      handleSend(autoMsg, searchQuery);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText, displayText) => {
    const userMsg = messageText || input.trim();
    const display = displayText || input.trim();
    if (!userMsg) return;

    setMessages(prev => [...prev, { role: "user", content: display || userMsg }]);
    setInput("");
    setLoading(true);

    try {
     const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
"Authorization": "Bearer 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",
},
  body: JSON.stringify({
model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
content: "You are Plantify AI, an expert botanist assistant. You ONLY answer questions about plants, gardening, and botany. If asked anything unrelated to plants, politely refuse and ask the user to ask about plants instead. When asked about a plant, provide: common & scientific name, family, category, description, care guide (water, sunlight, soil, difficulty), climate, PKR price range, availability in Pakistan, health benefits, common diseases, and tags. Use emojis for sections. Be concise but complete."
    },
      { role: "user", content: userMsg }
    ],
    max_tokens: 1000,
  }),
});

const data = await response.json();
const reply = data.choices[0]?.message?.content || "Sorry, I couldn't find info on that plant.";
setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.9)",
      backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(145deg, #0d2416, #0a1a0f)",
        border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: 20,
        width: "100%",
       maxWidth: 860,
height: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(74,222,128,0.08)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(74,222,128,0.12)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #4ade80, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 0 16px rgba(74,222,128,0.4)",
}}>
<img src="https://img.icons8.com/?size=100&id=MTnnE7FNiELB&format=png&color=000000" width="22" height="22" style={{filter: "brightness(0) invert(0)"}} />
</div>
              <div>
<div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>Plantify AI</div>
              <div style={{ fontSize: 11, color: "#6b9a72" }}>

                {searchQuery ? `Searching: "${searchQuery}"` : "Ask about any plant"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#9dc49f",
            width: 32, height: 32, cursor: "pointer",
            fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#4a6a4e" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
<div style={{ fontSize: 20, color: "#6b9a72" }}>Ask me about any plant!</div>
<div style={{ fontSize: 15, marginTop: 6, color: "#4a6a4e" }}>I know thousands of plants worldwide</div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(22,163,74,0.15))"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${msg.role === "user" ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.06)"}`,
              fontSize: 15,
lineHeight: 1.8,
                color: msg.role === "user" ? "#4ade80" : "#c8e6c9",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 6, padding: "8px 16px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#4ade80",
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  opacity: 0.7,
                }} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(74,222,128,0.1)",
          display: "flex", gap: 10,
          flexShrink: 0,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about any plant..."
            style={{
              flex: 1, padding: "10px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: 10, color: "#e8f5e9",
fontSize: 15, outline: "none",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 16px",
              background: loading || !input.trim() ? "rgba(74,222,128,0.1)" : "linear-gradient(135deg, #4ade80, #16a34a)",
              border: "none", borderRadius: 10,
              color: loading || !input.trim() ? "#4a6a4e" : "#0a1a0f",
              fontWeight: 700, fontSize: 14,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >➤</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
const difficultyColor = {
  "Very Easy": "#4ade80",
  "Easy": "#86efac",
  "Moderate": "#fbbf24",
  "Hard": "#f87171",
};
// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlantDatabase() {
  const [plants, setPlants] = useState(mockPlants);
  const [filtered, setFiltered] = useState(mockPlants);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState("");



  // Filter logic + chatbot trigger
  useEffect(() => {
    let result = plants;
    if (category !== "All") result = result.filter(p => p.category === category);
    if (query.trim()) result = result.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.scientificName?.toLowerCase().includes(query.toLowerCase()) ||
      p.tags?.some(t => t.includes(query.toLowerCase()))
    );
    setFiltered(result);
  }, [query, category, plants]);

  useEffect(() => {
    if (selected) setActiveTab("overview");
  }, [selected]);

  // Auto-trigger chatbot when no results found and query is non-empty
  const handleSearch = (value) => {
    setQuery(value);
  };

  const triggerChatbot = () => {
    setChatbotQuery(query);
    setShowChatbot(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1a0f 0%, #0d2416 40%, #0a1a0f 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e8f5e9",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0d2416 0%, #1a3a24 50%, #0d2416 100%)",
        borderBottom: "1px solid rgba(74,222,128,0.15)",
        padding: "24px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
         display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
}}><img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="30" height="30" /></div>
<div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "#4ade80" }}>PlantsDatabase</div>
            <div style={{ fontSize: 11, color: "#6b9a72", letterSpacing: "0.1em", textTransform: "uppercase" }}>Plant Encyclopedia</div>
          </div>
        </div>
     <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            fontSize: 12, color: "#4ade80", fontWeight: 600,
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.15)",
            padding: "6px 14px", borderRadius: 20,
            letterSpacing: "0.05em"
          }}>{filtered.length} plants</div>
          <button
            onClick={() => { setChatbotQuery(""); setShowChatbot(true); }}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4ade80, #16a34a)",
              border: "none",
              borderRadius: 12, color: "#0a1a0f",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 0 20px rgba(74,222,128,0.3)",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(74,222,128,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(74,222,128,0.3)"}
          >
            <img src="https://img.icons8.com/?size=100&id=MTnnE7FNiELB&format=png&color=000000" width="18" height="18" />
            AI Assistant
          </button>
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Search */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{
              position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
              fontSize: 18, opacity: 0.5,
}}><img src="https://img.icons8.com/?size=100&id=W0xu6u7K9A0F&format=png&color=000000" width="20" height="20" style={{filter: "brightness(0) invert(1)", opacity: 0.6}} /></span>
              <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search plants by name, species, or use..."
              style={{
                width: "100%",
                padding: "14px 18px 14px 50px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: 14,
                color: "#e8f5e9",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(74,222,128,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(74,222,128,0.2)"}
            />
          </div>

          {/* Categories */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {plantCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: category === cat ? "#4ade80" : "rgba(74,222,128,0.2)",
                  background: category === cat ? "rgba(74,222,128,0.15)" : "transparent",
                  color: category === cat ? "#4ade80" : "#6b9a72",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Grid or No Results */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b9a72" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No plants found for "{query}"</div>
            <div style={{ fontSize: 13, marginBottom: 28, color: "#4a6a4e" }}>
              This plant isn't in our database yet — ask our AI assistant!
            </div>
            <button
              onClick={triggerChatbot}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #4ade80, #16a34a)",
                border: "none", borderRadius: 12,
                color: "#0a1a0f", fontSize: 14, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(74,222,128,0.3)",
              }}
            >🤖 Ask AI About "{query}"</button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {filtered.map(plant => (
              <div
                key={plant._id}
                onClick={() => setSelected(plant)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(74,222,128,0.12)",
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = "1px solid rgba(74,222,128,0.4)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(74,222,128,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = "1px solid rgba(74,222,128,0.12)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                  <img
                    src={plant.image}
                    alt={plant.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
onError={e => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(plant.name)}/320/180`; }}
/>
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 10px",
                    borderRadius: 20, fontSize: 11,
                    color: "#4ade80",
                    border: "1px solid rgba(74,222,128,0.3)"
                  }}>{plant.category}</div>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{plant.name}</div>
                  <div style={{ fontSize: 12, color: "#6b9a72", fontStyle: "italic", marginBottom: 10 }}>{plant.scientificName}</div>
                  <div style={{
                    fontSize: 13, color: "#9dc49f", lineHeight: 1.5, marginBottom: 12,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>{plant.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{plant.price}</span>
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 8,
                      background: "rgba(74,222,128,0.1)",
                      color: difficultyColor[plant.careGuide?.difficulty] || "#4ade80"
                    }}>{plant.careGuide?.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plant Detail Modal */}
      {selected && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{
            background: "linear-gradient(145deg, #0d2416 0%, #0a1a0f 100%)",
            border: "1px solid rgba(74,222,128,0.25)",
            borderRadius: 20,
            width: "100%", maxWidth: 760,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(74,222,128,0.05)",
          }}>
            {/* Modal Image Header */}
            <div style={{ position: "relative", height: 220, flexShrink: 0 }}>
              <img src={selected.image} alt={selected.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
onError={e => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(selected.name)}/760/220`; }}
/>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, #0d2416 0%, transparent 60%)"
              }} />
              <button onClick={() => setSelected(null)} style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10, color: "#fff", width: 34, height: 34,
                cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
              <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: "#9dc49f", fontStyle: "italic" }}>{selected.scientificName}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, padding: "12px 20px 0",
              borderBottom: "1px solid rgba(74,222,128,0.1)",
              flexShrink: 0,
            }}>
              {["overview", "care", "health", "diseases"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 18px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  background: activeTab === tab ? "rgba(74,222,128,0.15)" : "transparent",
                  color: activeTab === tab ? "#4ade80" : "#6b9a72",
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: "pointer", fontSize: 13,
                  textTransform: "capitalize",
                  borderBottom: activeTab === tab ? "2px solid #4ade80" : "2px solid transparent",
                  transition: "all 0.2s",
                }}>{tab}</button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: "20px", overflowY: "auto", flexGrow: 1 }}>
              {activeTab === "overview" && (
                <div>
                  <p style={{ color: "#9dc49f", lineHeight: 1.7, marginBottom: 20 }}>{selected.description}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      ["🌍 Climate", selected.climate],
                      ["💰 Price", selected.price],
                      ["🏪 Availability", selected.availability],
                      ["🌿 Family", selected.family],
                    ].map(([label, value]) => (
                      <div key={label} style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(74,222,128,0.1)",
                        borderRadius: 10, padding: "12px 16px"
                      }}>
                        <div style={{ fontSize: 11, color: "#6b9a72", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selected.tags?.map(tag => (
                      <span key={tag} style={{
                        padding: "4px 12px", borderRadius: 20,
                        background: "rgba(74,222,128,0.08)",
                        border: "1px solid rgba(74,222,128,0.2)",
                        fontSize: 12, color: "#4ade80"
                      }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "care" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    ["💧 Water", selected.careGuide?.water],
                    ["☀️ Sunlight", selected.careGuide?.sunlight],
                    ["🪨 Soil", selected.careGuide?.soil],
                    ["📊 Difficulty", selected.careGuide?.difficulty],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(74,222,128,0.1)",
                      borderRadius: 12, padding: "16px"
                    }}>
                      <div style={{ fontSize: 11, color: "#6b9a72", marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "health" && (
                <div style={{
                  background: "rgba(74,222,128,0.05)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  borderRadius: 12, padding: 20
                }}>
                  <div style={{ fontSize: 14, color: "#9dc49f", lineHeight: 1.8 }}>
                    🩺 {selected.health}
                  </div>
                </div>
              )}

              {activeTab === "diseases" && (
                <div>
                  {selected.diseases?.map(d => (
                    <div key={d} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", marginBottom: 8,
                      background: "rgba(248,113,113,0.05)",
                      border: "1px solid rgba(248,113,113,0.15)",
                      borderRadius: 10
                    }}>
                      <span>⚠️</span>
                      <span style={{ fontSize: 14, color: "#fca5a5" }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      {showChatbot && (
        <PlantChatbot
          searchQuery={chatbotQuery}
          onClose={() => { setShowChatbot(false); setChatbotQuery(""); }}
        />
      )}
    </div>
  );
}