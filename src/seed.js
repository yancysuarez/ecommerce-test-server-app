const { User, Item } = require('./models');

const defaultAdmin = {
  name:     'Admin',
  email:    'admin@example.com',
  password: 'admin123',
  role:     'admin',
};

const defaultItems = [
  { name: 'Wireless Headphones',       description: 'Noise-cancelling over-ear Bluetooth headphones',       price: 49.99, stock: 100, category: 'Electronics',  imageUrl: 'https://placehold.co/400x400?text=Headphones' },
  { name: 'Mechanical Keyboard',       description: 'TKL mechanical keyboard with RGB backlighting',        price: 89.99, stock: 60,  category: 'Electronics',  imageUrl: 'https://placehold.co/400x400?text=Keyboard' },
  { name: 'USB-C Hub',                 description: '7-in-1 USB-C hub with HDMI, SD card, and PD',         price: 34.99, stock: 80,  category: 'Electronics',  imageUrl: 'https://placehold.co/400x400?text=USB-C+Hub' },
  { name: 'Webcam 1080p',              description: 'Full HD webcam with built-in microphone',              price: 59.99, stock: 45,  category: 'Electronics',  imageUrl: 'https://placehold.co/400x400?text=Webcam' },
  { name: 'Portable Charger 20000mAh', description: '20000mAh power bank with dual USB-A and USB-C',       price: 44.99, stock: 85,  category: 'Electronics',  imageUrl: 'https://placehold.co/400x400?text=Power+Bank' },
  { name: 'Running Shoes',             description: 'Lightweight mesh running shoes, unisex',               price: 74.99, stock: 120, category: 'Footwear',     imageUrl: 'https://placehold.co/400x400?text=Running+Shoes' },
  { name: 'Leather Wallet',            description: 'Slim bifold genuine leather wallet, RFID-safe',        price: 24.99, stock: 200, category: 'Accessories',  imageUrl: 'https://placehold.co/400x400?text=Wallet' },
  { name: 'Backpack 30L',              description: 'Water-resistant laptop backpack with USB port',        price: 54.99, stock: 55,  category: 'Accessories',  imageUrl: 'https://placehold.co/400x400?text=Backpack' },
  { name: 'Sunglasses',                description: 'Polarised UV400 aviator sunglasses',                   price: 18.99, stock: 180, category: 'Accessories',  imageUrl: 'https://placehold.co/400x400?text=Sunglasses' },
  { name: 'Stainless Water Bottle',    description: 'Insulated 32oz stainless steel water bottle',          price: 19.99, stock: 150, category: 'Kitchen',      imageUrl: 'https://placehold.co/400x400?text=Water+Bottle' },
  { name: 'Ceramic Coffee Mug',        description: '12oz ceramic mug, microwave and dishwasher safe',      price: 12.99, stock: 300, category: 'Kitchen',      imageUrl: 'https://placehold.co/400x400?text=Coffee+Mug' },
  { name: 'Yoga Mat',                  description: 'Non-slip 6mm thick exercise yoga mat',                 price: 29.99, stock: 90,  category: 'Sports',       imageUrl: 'https://placehold.co/400x400?text=Yoga+Mat' },
  { name: 'Resistance Bands Set',      description: 'Set of 5 latex resistance bands for home workouts',    price: 15.99, stock: 110, category: 'Sports',       imageUrl: 'https://placehold.co/400x400?text=Resistance+Bands' },
  { name: 'Desk Lamp',                 description: 'LED desk lamp with adjustable brightness & color temp', price: 39.99, stock: 70, category: 'Home Office',  imageUrl: 'https://placehold.co/400x400?text=Desk+Lamp' },
  { name: 'Notebook A5',               description: 'Hardcover dot-grid notebook, 200 pages',               price: 9.99,  stock: 250, category: 'Stationery',   imageUrl: 'https://placehold.co/400x400?text=Notebook' },
];

const seed = async () => {
  // Admin user
  const adminExists = await User.findOne({ where: { email: defaultAdmin.email } });
  if (!adminExists) {
    await User.create(defaultAdmin);
    console.log(`[seed] Admin created (${defaultAdmin.email})`);
  }

  // Items
  const itemCount = await Item.count();
  if (itemCount === 0) {
    await Item.bulkCreate(defaultItems);
    console.log(`[seed] ${defaultItems.length} items created`);
  }
};

module.exports = seed;
