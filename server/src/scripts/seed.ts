import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-orders');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@tastycrave.com',
      phone: '+1-555-123-4567',
      hashedPassword: 'Admin123!',
      roles: ['admin', 'manager'],
      loyaltyPoints: 0,
      isEmailVerified: true
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create kitchen staff user
    const kitchenUser = new User({
      name: 'Kitchen Staff',
      email: 'kitchen@tastycrave.com',
      phone: '+1-555-234-5678',
      hashedPassword: 'Kitchen123!',
      roles: ['kitchen'],
      loyaltyPoints: 0,
      isEmailVerified: true
    });
    await kitchenUser.save();
    console.log('Created kitchen staff user');

    // Create customer user
    const customerUser = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '+1-555-345-6789',
      hashedPassword: 'Customer123!',
      roles: ['customer'],
      loyaltyPoints: 150,
      addresses: [{
        type: 'home',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        isDefault: true
      }],
      isEmailVerified: true
    });
    await customerUser.save();
    console.log('Created customer user');

    // Create rider user
    const riderUser = new User({
      name: 'Delivery Rider',
      email: 'rider@tastycrave.com',
      phone: '+1-555-456-7890',
      hashedPassword: 'Rider123!',
      roles: ['rider'],
      loyaltyPoints: 0,
      isEmailVerified: true,
      addresses: [{
        type: 'home',
        street: '789 Rider Lane',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        isDefault: true
      }]
    });
    await riderUser.save();
    console.log('Created rider user');

    // Create additional customer for testing
    const customerUser2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-567-8901',
      hashedPassword: 'Jane123!',
      roles: ['customer'],
      loyaltyPoints: 75,
      addresses: [{
        type: 'work',
        street: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        isDefault: true
      }],
      isEmailVerified: true
    });
    await customerUser2.save();
    console.log('Created additional customer user');

    // Create main store
    const mainStore = new Store({
      name: 'TastyCrave Downtown',
      slug: 'downtown',
      address: {
        street: '456 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10013'
      },
      phone: '+1-555-123-4567',
      email: 'downtown@tastycrave.com',
      hours: [
        { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Sunday
        { dayOfWeek: 1, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Monday
        { dayOfWeek: 2, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Tuesday
        { dayOfWeek: 3, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Wednesday
        { dayOfWeek: 4, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Thursday
        { dayOfWeek: 5, openTime: '11:00', closeTime: '00:00', isClosed: false }, // Friday
        { dayOfWeek: 6, openTime: '11:00', closeTime: '00:00', isClosed: false }  // Saturday
      ],
      isOpen: true,
      prepTimeMins: 25,
      deliveryZones: [
        {
          name: 'Downtown Zone',
          fee: 2.99,
          minOrder: 15,
          radius: 2,
          center: { lat: 40.7614, lng: -73.9776 }
        },
        {
          name: 'Midtown Zone',
          fee: 3.99,
          minOrder: 20,
          radius: 3,
          center: { lat: 40.7614, lng: -73.9776 }
        }
      ],
      paymentConfig: {
        stripeEnabled: true,
        cashEnabled: false,
        minOrderForDelivery: 15,
        maxOrderValue: 300
      }
    });
    await mainStore.save();
    console.log('Created main store');

    // Create categories
    const categories = [
      { name: 'Pizza', slug: 'pizza', description: 'Hand-tossed pizzas with fresh ingredients', order: 1 },
      { name: 'Burgers', slug: 'burgers', description: 'Gourmet burgers made with premium beef', order: 2 },
      { name: 'Salads', slug: 'salads', description: 'Fresh, healthy salads with seasonal ingredients', order: 3 },
      { name: 'Appetizers', slug: 'appetizers', description: 'Delicious starters to share', order: 4 },
      { name: 'Desserts', slug: 'desserts', description: 'Sweet treats to end your meal', order: 5 },
      { name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks and specialty beverages', order: 6 }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const category = new Category({
        storeId: mainStore._id,
        ...cat,
        isActive: true
      });
      await category.save();
      createdCategories.push(category);
    }
    console.log('Created categories');

    // Create menu items
    const pizzaCategory = createdCategories.find(c => c.slug === 'pizza')!;
    const burgerCategory = createdCategories.find(c => c.slug === 'burgers')!;
    const saladCategory = createdCategories.find(c => c.slug === 'salads')!;
    const appetizerCategory = createdCategories.find(c => c.slug === 'appetizers')!;
    const dessertCategory = createdCategories.find(c => c.slug === 'desserts')!;
    const beverageCategory = createdCategories.find(c => c.slug === 'beverages')!;

    const items = [
      // Pizzas (8 items)
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Margherita Pizza',
        slug: 'margherita-pizza',
        description: 'Classic pizza with fresh mozzarella, basil, and San Marzano tomatoes',
        basePrice: 16.99,
        images: ['https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg'],
        tags: ['classic', 'vegetarian'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Extra Toppings',
            min: 0,
            max: 5,
            isRequired: false,
            addons: [
              { name: 'Pepperoni', priceDelta: 2.50, isAvailable: true },
              { name: 'Mushrooms', priceDelta: 2.00, isAvailable: true },
              { name: 'Bell Peppers', priceDelta: 2.00, isAvailable: true },
              { name: 'Extra Cheese', priceDelta: 2.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 18
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Pepperoni Supreme',
        slug: 'pepperoni-supreme',
        description: 'Loaded with pepperoni, mozzarella cheese, and our signature tomato sauce',
        basePrice: 19.99,
        images: ['https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg'],
        tags: ['popular', 'meat'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Extra Toppings',
            min: 0,
            max: 5,
            isRequired: false,
            addons: [
              { name: 'Extra Pepperoni', priceDelta: 3.00, isAvailable: true },
              { name: 'Sausage', priceDelta: 2.50, isAvailable: true },
              { name: 'Mushrooms', priceDelta: 2.00, isAvailable: true },
              { name: 'Extra Cheese', priceDelta: 2.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 20
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Veggie Deluxe',
        slug: 'veggie-deluxe',
        description: 'Fresh vegetables including bell peppers, mushrooms, onions, and olives',
        basePrice: 18.99,
        images: ['https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg'],
        tags: ['healthy', 'vegetarian'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 18
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Meat Supreme',
        slug: 'meat-supreme',
        description: 'Loaded with pepperoni, sausage, ham, and bacon with mozzarella cheese',
        basePrice: 22.99,
        images: ['https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg'],
        tags: ['popular', 'meat', 'premium'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Extra Toppings',
            min: 0,
            max: 5,
            isRequired: false,
            addons: [
              { name: 'Extra Pepperoni', priceDelta: 3.00, isAvailable: true },
              { name: 'Sausage', priceDelta: 2.50, isAvailable: true },
              { name: 'Mushrooms', priceDelta: 2.00, isAvailable: true },
              { name: 'Extra Cheese', priceDelta: 2.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 22
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Hawaiian Paradise',
        slug: 'hawaiian-paradise',
        description: 'Ham and pineapple with mozzarella cheese on our signature tomato sauce',
        basePrice: 18.99,
        images: ['https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg'],
        tags: ['tropical', 'sweet'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 18
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'BBQ Chicken Ranch',
        slug: 'bbq-chicken-ranch',
        description: 'Grilled chicken with BBQ sauce, red onions, cilantro, and ranch drizzle',
        basePrice: 21.99,
        images: ['https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg'],
        tags: ['bbq', 'chicken', 'premium'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 20
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Mediterranean Delight',
        slug: 'mediterranean-delight',
        description: 'Feta cheese, kalamata olives, sun-dried tomatoes, and fresh herbs',
        basePrice: 20.99,
        images: ['https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg'],
        tags: ['mediterranean', 'vegetarian', 'gourmet'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 18
      },
      {
        storeId: mainStore._id,
        categoryId: pizzaCategory._id,
        name: 'Spicy Italian',
        slug: 'spicy-italian',
        description: 'Spicy salami, hot peppers, onions, and mozzarella with spicy tomato sauce',
        basePrice: 20.99,
        images: ['https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg'],
        tags: ['spicy', 'italian', 'hot'],
        dietary: ['spicy'],
        isAvailable: true,
        variants: [
          { name: 'Small (10")', priceDelta: -4, isDefault: false },
          { name: 'Medium (12")', priceDelta: 0, isDefault: true },
          { name: 'Large (14")', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 18
      },
      
      // Burgers (7 items)
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Classic Cheeseburger',
        slug: 'classic-cheeseburger',
        description: 'Angus beef patty with American cheese, lettuce, tomato, and special sauce',
        basePrice: 14.99,
        images: ['https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'],
        tags: ['classic', 'bestseller'],
        isAvailable: true,
        variants: [
          { name: 'Single Patty', priceDelta: 0, isDefault: true },
          { name: 'Double Patty', priceDelta: 5, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Add-ons',
            min: 0,
            max: 10,
            isRequired: false,
            addons: [
              { name: 'Bacon', priceDelta: 2.50, isAvailable: true },
              { name: 'Avocado', priceDelta: 2.00, isAvailable: true },
              { name: 'Extra Cheese', priceDelta: 1.50, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3.00, isAvailable: true }
            ]
          },
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 15
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Bacon Avocado Burger',
        slug: 'bacon-avocado-burger',
        description: 'Juicy beef patty with crispy bacon, fresh avocado, lettuce, and chipotle mayo',
        basePrice: 17.99,
        images: ['https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg'],
        tags: ['premium', 'bacon', 'avocado'],
        isAvailable: true,
        variants: [
          { name: 'Single Patty', priceDelta: 0, isDefault: true },
          { name: 'Double Patty', priceDelta: 5, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 16
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'BBQ Mushroom Swiss',
        slug: 'bbq-mushroom-swiss',
        description: 'Beef patty with sautéed mushrooms, Swiss cheese, and tangy BBQ sauce',
        basePrice: 16.99,
        images: ['https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg'],
        tags: ['bbq', 'mushroom', 'swiss'],
        isAvailable: true,
        variants: [
          { name: 'Single Patty', priceDelta: 0, isDefault: true },
          { name: 'Double Patty', priceDelta: 5, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 17
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Spicy Jalapeño Burger',
        slug: 'spicy-jalapeno-burger',
        description: 'Spicy beef patty with jalapeños, pepper jack cheese, and sriracha mayo',
        basePrice: 16.99,
        images: ['https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'],
        tags: ['spicy', 'jalapeño', 'hot'],
        dietary: ['spicy'],
        isAvailable: true,
        variants: [
          { name: 'Single Patty', priceDelta: 0, isDefault: true },
          { name: 'Double Patty', priceDelta: 5, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 15
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Turkey Club Burger',
        slug: 'turkey-club-burger',
        description: 'Lean turkey patty with bacon, lettuce, tomato, and herb mayo',
        basePrice: 15.99,
        images: ['https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg'],
        tags: ['turkey', 'lean', 'club'],
        isAvailable: true,
        variants: [
          { name: 'Single Patty', priceDelta: 0, isDefault: true },
          { name: 'Double Patty', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 14
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Veggie Black Bean Burger',
        slug: 'veggie-black-bean-burger',
        description: 'House-made black bean patty with lettuce, tomato, and avocado spread',
        basePrice: 13.99,
        images: ['https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg'],
        tags: ['vegetarian', 'healthy', 'vegan'],
        dietary: ['vegetarian', 'vegan'],
        isAvailable: true,
        variants: [],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'French Fries', priceDelta: 0, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 12
      },
      {
        storeId: mainStore._id,
        categoryId: burgerCategory._id,
        name: 'Gourmet Truffle Burger',
        slug: 'gourmet-truffle-burger',
        description: 'Premium wagyu beef with truffle aioli, arugula, and aged gruyere',
        basePrice: 24.99,
        images: ['https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'],
        tags: ['gourmet', 'premium', 'truffle', 'wagyu'],
        isAvailable: true,
        variants: [],
        addonGroups: [
          {
            name: 'Side',
            min: 1,
            max: 1,
            isRequired: true,
            addons: [
              { name: 'Truffle Fries', priceDelta: 5, isAvailable: true },
              { name: 'Sweet Potato Fries', priceDelta: 2, isAvailable: true },
              { name: 'Onion Rings', priceDelta: 3, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 20
      },

      // Salads (6 items)
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Caesar Salad',
        slug: 'caesar-salad',
        description: 'Crisp romaine lettuce with parmesan cheese, croutons, and caesar dressing',
        basePrice: 12.99,
        images: ['https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg'],
        tags: ['healthy', 'vegetarian'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Protein',
            min: 0,
            max: 2,
            isRequired: false,
            addons: [
              { name: 'Grilled Chicken', priceDelta: 5.00, isAvailable: true },
              { name: 'Grilled Shrimp', priceDelta: 7.00, isAvailable: true },
              { name: 'Salmon', priceDelta: 8.00, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Garden Fresh Salad',
        slug: 'garden-fresh-salad',
        description: 'Mixed greens, cherry tomatoes, cucumbers, carrots, and choice of dressing',
        basePrice: 10.99,
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
        tags: ['fresh', 'healthy', 'vegetarian'],
        dietary: ['vegetarian', 'vegan'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 3, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Protein',
            min: 0,
            max: 2,
            isRequired: false,
            addons: [
              { name: 'Grilled Chicken', priceDelta: 5.00, isAvailable: true },
              { name: 'Hard-boiled Egg', priceDelta: 2.00, isAvailable: true },
              { name: 'Tofu', priceDelta: 3.00, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 6
      },
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Greek Mediterranean Salad',
        slug: 'greek-mediterranean-salad',
        description: 'Feta cheese, kalamata olives, red onions, tomatoes, and olive oil dressing',
        basePrice: 14.99,
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
        tags: ['mediterranean', 'vegetarian', 'feta'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Chicken Cobb Salad',
        slug: 'chicken-cobb-salad',
        description: 'Grilled chicken, bacon, blue cheese, hard-boiled egg, and avocado',
        basePrice: 16.99,
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
        tags: ['protein', 'bacon', 'hearty'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 10
      },
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Asian Sesame Salad',
        slug: 'asian-sesame-salad',
        description: 'Mixed greens with mandarin oranges, almonds, and sesame ginger dressing',
        basePrice: 13.99,
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
        tags: ['asian', 'sesame', 'refreshing'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Protein',
            min: 0,
            max: 2,
            isRequired: false,
            addons: [
              { name: 'Grilled Chicken', priceDelta: 5.00, isAvailable: true },
              { name: 'Teriyaki Salmon', priceDelta: 8.00, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: saladCategory._id,
        name: 'Quinoa Power Salad',
        slug: 'quinoa-power-salad',
        description: 'Superfood quinoa with kale, cranberries, almonds, and lemon vinaigrette',
        basePrice: 15.99,
        images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
        tags: ['superfood', 'quinoa', 'healthy', 'power'],
        dietary: ['vegetarian', 'vegan', 'gluten-free'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 4, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 8
      },

      // Appetizers (8 items)
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Buffalo Wings',
        slug: 'buffalo-wings',
        description: 'Crispy chicken wings tossed in spicy buffalo sauce, served with celery and blue cheese',
        basePrice: 11.99,
        images: ['https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg'],
        tags: ['spicy', 'popular'],
        dietary: ['spicy'],
        isAvailable: true,
        variants: [
          { name: '6 pieces', priceDelta: 0, isDefault: true },
          { name: '12 pieces', priceDelta: 8, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 12
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Mozzarella Sticks',
        slug: 'mozzarella-sticks',
        description: 'Golden fried mozzarella sticks served with marinara sauce',
        basePrice: 8.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['cheesy', 'fried', 'classic'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: '6 pieces', priceDelta: 0, isDefault: true },
          { name: '12 pieces', priceDelta: 6, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Loaded Nachos',
        slug: 'loaded-nachos',
        description: 'Tortilla chips topped with cheese, jalapeños, sour cream, and guacamole',
        basePrice: 12.99,
        images: ['https://images.pexels.com/photos/5966630/pexels-photo-5966630.jpeg'],
        tags: ['nachos', 'loaded', 'sharing'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 5, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Add Protein',
            min: 0,
            max: 2,
            isRequired: false,
            addons: [
              { name: 'Grilled Chicken', priceDelta: 4.00, isAvailable: true },
              { name: 'Ground Beef', priceDelta: 4.00, isAvailable: true },
              { name: 'Pulled Pork', priceDelta: 5.00, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 10
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Spinach Artichoke Dip',
        slug: 'spinach-artichoke-dip',
        description: 'Creamy spinach and artichoke dip served hot with tortilla chips',
        basePrice: 10.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['creamy', 'dip', 'vegetarian'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [],
        prepTimeMinutes: 12
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Calamari Rings',
        slug: 'calamari-rings',
        description: 'Crispy fried calamari rings served with marinara and lemon',
        basePrice: 13.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['seafood', 'crispy', 'rings'],
        isAvailable: true,
        variants: [],
        addonGroups: [],
        prepTimeMinutes: 10
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Jalapeño Poppers',
        slug: 'jalapeno-poppers',
        description: 'Fresh jalapeños stuffed with cream cheese, wrapped in bacon and fried',
        basePrice: 9.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['spicy', 'bacon', 'stuffed'],
        dietary: ['spicy'],
        isAvailable: true,
        variants: [
          { name: '6 pieces', priceDelta: 0, isDefault: true },
          { name: '12 pieces', priceDelta: 7, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 12
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Garlic Bread',
        slug: 'garlic-bread',
        description: 'Fresh baked bread with garlic butter and herbs, served with marinara',
        basePrice: 6.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['bread', 'garlic', 'classic'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Cheesy', priceDelta: 2, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: appetizerCategory._id,
        name: 'Potato Skins',
        slug: 'potato-skins',
        description: 'Crispy potato skins loaded with cheese, bacon, and served with sour cream',
        basePrice: 10.99,
        images: ['https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg'],
        tags: ['potato', 'loaded', 'bacon'],
        isAvailable: true,
        variants: [
          { name: '4 pieces', priceDelta: 0, isDefault: true },
          { name: '8 pieces', priceDelta: 6, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 15
      },

      // Desserts (6 items)
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'Chocolate Brownie',
        slug: 'chocolate-brownie',
        description: 'Rich chocolate brownie served warm with vanilla ice cream',
        basePrice: 7.99,
        images: ['https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg'],
        tags: ['dessert', 'chocolate'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [
          {
            name: 'Extras',
            min: 0,
            max: 3,
            isRequired: false,
            addons: [
              { name: 'Extra Ice Cream', priceDelta: 2.00, isAvailable: true },
              { name: 'Whipped Cream', priceDelta: 1.00, isAvailable: true },
              { name: 'Chocolate Sauce', priceDelta: 1.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 5
      },
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'New York Cheesecake',
        slug: 'new-york-cheesecake',
        description: 'Classic New York style cheesecake with graham cracker crust',
        basePrice: 8.99,
        images: ['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
        tags: ['cheesecake', 'classic', 'new york'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [
          {
            name: 'Toppings',
            min: 0,
            max: 2,
            isRequired: false,
            addons: [
              { name: 'Strawberry Sauce', priceDelta: 1.50, isAvailable: true },
              { name: 'Blueberry Compote', priceDelta: 1.50, isAvailable: true },
              { name: 'Caramel Drizzle', priceDelta: 1.00, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 3
      },
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'Tiramisu',
        slug: 'tiramisu',
        description: 'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone',
        basePrice: 9.99,
        images: ['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
        tags: ['italian', 'coffee', 'classic'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [],
        prepTimeMinutes: 3
      },
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'Apple Pie à la Mode',
        slug: 'apple-pie-a-la-mode',
        description: 'Homemade apple pie served warm with vanilla ice cream',
        basePrice: 8.99,
        images: ['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
        tags: ['pie', 'apple', 'homemade'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [],
        prepTimeMinutes: 8
      },
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'Chocolate Lava Cake',
        slug: 'chocolate-lava-cake',
        description: 'Warm chocolate cake with molten chocolate center and vanilla ice cream',
        basePrice: 9.99,
        images: ['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
        tags: ['chocolate', 'lava', 'warm'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [],
        prepTimeMinutes: 12
      },
      {
        storeId: mainStore._id,
        categoryId: dessertCategory._id,
        name: 'Ice Cream Sundae',
        slug: 'ice-cream-sundae',
        description: 'Three scoops of ice cream with your choice of toppings',
        basePrice: 6.99,
        images: ['https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg'],
        tags: ['ice cream', 'sundae', 'customizable'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [],
        addonGroups: [
          {
            name: 'Ice Cream Flavors',
            min: 1,
            max: 3,
            isRequired: true,
            addons: [
              { name: 'Vanilla', priceDelta: 0, isAvailable: true },
              { name: 'Chocolate', priceDelta: 0, isAvailable: true },
              { name: 'Strawberry', priceDelta: 0, isAvailable: true },
              { name: 'Cookies & Cream', priceDelta: 1, isAvailable: true }
            ]
          },
          {
            name: 'Toppings',
            min: 0,
            max: 5,
            isRequired: false,
            addons: [
              { name: 'Hot Fudge', priceDelta: 1.50, isAvailable: true },
              { name: 'Caramel Sauce', priceDelta: 1.50, isAvailable: true },
              { name: 'Whipped Cream', priceDelta: 1.00, isAvailable: true },
              { name: 'Cherry', priceDelta: 1.00, isAvailable: true },
              { name: 'Nuts', priceDelta: 1.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 5
      },

      // Beverages (8 items)
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Fresh Lemonade',
        slug: 'fresh-lemonade',
        description: 'Freshly squeezed lemonade made with real lemons',
        basePrice: 3.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['fresh', 'refreshing'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 1.50, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 2
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Iced Tea',
        slug: 'iced-tea',
        description: 'Freshly brewed iced tea, sweetened or unsweetened',
        basePrice: 2.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['tea', 'refreshing'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'Sweetened', priceDelta: 0, isDefault: true },
          { name: 'Unsweetened', priceDelta: 0, isDefault: false },
          { name: 'Half & Half', priceDelta: 0, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 1
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Fresh Orange Juice',
        slug: 'fresh-orange-juice',
        description: 'Freshly squeezed orange juice, no pulp or extra pulp',
        basePrice: 4.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['fresh', 'orange', 'juice'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'No Pulp', priceDelta: 0, isDefault: true },
          { name: 'Extra Pulp', priceDelta: 0, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 2
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Craft Root Beer',
        slug: 'craft-root-beer',
        description: 'Locally crafted root beer with a rich, creamy flavor',
        basePrice: 3.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['craft', 'root beer', 'local'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 1, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 1
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Smoothies',
        slug: 'smoothies',
        description: 'Fresh fruit smoothies made with real fruit and yogurt',
        basePrice: 6.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['smoothie', 'fruit', 'healthy'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Strawberry Banana', priceDelta: 0, isDefault: true },
          { name: 'Mango Passion', priceDelta: 0, isDefault: false },
          { name: 'Mixed Berry', priceDelta: 0, isDefault: false },
          { name: 'Green Detox', priceDelta: 1, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Boosts',
            min: 0,
            max: 3,
            isRequired: false,
            addons: [
              { name: 'Protein Powder', priceDelta: 2.00, isAvailable: true },
              { name: 'Chia Seeds', priceDelta: 1.50, isAvailable: true },
              { name: 'Flax Seeds', priceDelta: 1.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 4
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Coffee',
        slug: 'coffee',
        description: 'Freshly brewed premium coffee, hot or iced',
        basePrice: 2.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['coffee', 'caffeine', 'hot'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'Regular', priceDelta: 0, isDefault: true },
          { name: 'Large', priceDelta: 1, isDefault: false },
          { name: 'Iced', priceDelta: 0, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 3
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Milkshakes',
        slug: 'milkshakes',
        description: 'Thick and creamy milkshakes made with premium ice cream',
        basePrice: 5.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['milkshake', 'thick', 'creamy'],
        dietary: ['vegetarian'],
        isAvailable: true,
        variants: [
          { name: 'Vanilla', priceDelta: 0, isDefault: true },
          { name: 'Chocolate', priceDelta: 0, isDefault: false },
          { name: 'Strawberry', priceDelta: 0, isDefault: false },
          { name: 'Cookies & Cream', priceDelta: 1, isDefault: false }
        ],
        addonGroups: [
          {
            name: 'Extras',
            min: 0,
            max: 3,
            isRequired: false,
            addons: [
              { name: 'Whipped Cream', priceDelta: 1.00, isAvailable: true },
              { name: 'Cherry', priceDelta: 0.50, isAvailable: true },
              { name: 'Extra Thick', priceDelta: 0.50, isAvailable: true }
            ]
          }
        ],
        prepTimeMinutes: 5
      },
      {
        storeId: mainStore._id,
        categoryId: beverageCategory._id,
        name: 'Sparkling Water',
        slug: 'sparkling-water',
        description: 'Premium sparkling water with natural flavors',
        basePrice: 2.99,
        images: ['https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'],
        tags: ['sparkling', 'water', 'refreshing'],
        dietary: ['vegan'],
        isAvailable: true,
        variants: [
          { name: 'Plain', priceDelta: 0, isDefault: true },
          { name: 'Lemon', priceDelta: 0, isDefault: false },
          { name: 'Lime', priceDelta: 0, isDefault: false },
          { name: 'Berry', priceDelta: 0.50, isDefault: false }
        ],
        addonGroups: [],
        prepTimeMinutes: 1
      }
    ];

    for (const itemData of items) {
      const item = new Item(itemData);
      await item.save();
    }
    console.log('Created menu items');

    // Create coupons
    const coupons = [
      {
        code: 'WELCOME10',
        type: 'percent' as const,
        value: 10,
        minSubtotal: 25,
        maxDiscount: 5,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUses: 1000,
        perUserLimit: 1,
        isActive: true,
        applicableStores: [mainStore._id]
      },
      {
        code: 'FREESHIP',
        type: 'fixed' as const,
        value: 2.99,
        minSubtotal: 30,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        maxUses: 500,
        isActive: true,
        applicableStores: [mainStore._id]
      }
    ];

    for (const couponData of coupons) {
      const coupon = new Coupon(couponData);
      await coupon.save();
    }
    console.log('Created coupons');

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('👑 Admin: admin@tastycrave.com / Admin123!');
    console.log('👨‍🍳 Kitchen: kitchen@tastycrave.com / Kitchen123!');
    console.log('👤 Customer 1: customer@example.com / Customer123!');
    console.log('👤 Customer 2: jane@example.com / Jane123!');
    console.log('🏍️ Rider: rider@tastycrave.com / Rider123!');
    console.log('');
    console.log('🏪 Store: TastyCrave Downtown (slug: downtown)');
    console.log('🎫 Available coupons: WELCOME10, FREESHIP');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('⚡ Backend: http://localhost:3001');
    console.log('');
    console.log('💡 Note: Real users can register with any email/password combination');
    console.log('📧 All dummy users have verified emails for immediate login');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();