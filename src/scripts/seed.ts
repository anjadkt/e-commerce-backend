import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../modules/user/user.model';
import { Category } from '../modules/category/category.model';
import { Product } from '../modules/product/product.model';
import { Order } from '../modules/order/order.model';

const seedDatabase = async () => {
  try {
    await connectDatabase();
    console.log('🌱 Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records');

    // 1. Create Users
    const admin = new User({
      name: 'Rahul Sharma',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      phone: '9847123456',
      address: {
        street: '12 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
    });
    await admin.save();

    const customer = new User({
      name: 'Anjad KT',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      isActive: true,
      phone: '9778175095',
      address: {
        street: 'Green Valley, Calicut Road',
        city: 'Kozhikode',
        state: 'Kerala',
        postalCode: '673001',
        country: 'India',
      },
    });
    await customer.save();
    console.log('✅ Created Admin and Customer accounts');

    // 2. Create Multi-Level Categories
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Consumer electronics and devices',
    });

    const mobiles = await Category.create({
      name: 'Mobiles',
      slug: 'mobiles',
      parent: electronics._id,
      description: 'Smartphones and cellphones',
    });

    const computers = await Category.create({
      name: 'Computers',
      slug: 'computers',
      parent: electronics._id,
      description: 'Personal computers and workstations',
    });

    const androidPhones = await Category.create({
      name: 'Android Phones',
      slug: 'android-phones',
      parent: mobiles._id,
      description: 'Android operating system devices',
    });

    const iphones = await Category.create({
      name: 'iPhones',
      slug: 'iphones',
      parent: mobiles._id,
      description: 'Apple iOS smartphones',
    });

    const samsung = await Category.create({
      name: 'Samsung',
      slug: 'samsung-phones',
      parent: androidPhones._id,
      description: 'Samsung Galaxy smartphones',
    });

    const oneplus = await Category.create({
      name: 'OnePlus',
      slug: 'oneplus-phones',
      parent: androidPhones._id,
      description: 'OnePlus smartphones',
    });

    const laptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      parent: computers._id,
      description: 'Portable laptop computers',
    });

    const desktops = await Category.create({
      name: 'Desktops',
      slug: 'desktops',
      parent: computers._id,
      description: 'Desktop computers and towers',
    });
    console.log('✅ Created nested category tree (4 levels deep)');

    // 3. Create Sample Products
    const productsData = [
      {
        name: 'Samsung Galaxy S24 Ultra',
        sku: 'SAM-S24U-512',
        description: 'Titanium frame, 200MP camera, Snapdragon 8 Gen 3',
        price: 129999,
        salePrice: 119999,
        stock: 25,
        category: samsung._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      },
      {
        name: 'OnePlus 12 5G',
        sku: 'OP-12-256',
        description: 'Snapdragon 8 Gen 3, Hasselblad Camera, 100W SuperVOOC',
        price: 64999,
        salePrice: 59999,
        stock: 15,
        category: oneplus._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'],
      },
      {
        name: 'Apple iPhone 15 Pro Max',
        sku: 'APL-IP15PM-256',
        description: 'A17 Pro chip, Titanium design, 5x telephoto camera',
        price: 159900,
        salePrice: 149900,
        stock: 20,
        category: iphones._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      },
      {
        name: 'MacBook Pro 16" M3 Max',
        sku: 'APL-MBP16-M3M',
        description: '16-core CPU, 40-core GPU, Liquid Retina XDR display',
        price: 349900,
        salePrice: 329900,
        stock: 10,
        category: laptops._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
      },
      {
        name: 'Dell XPS 15 9530',
        sku: 'DELL-XPS15-I9',
        description: '13th Gen Intel Core i9, NVIDIA RTX 4070, 3.5K OLED touch',
        price: 249990,
        salePrice: 229990,
        stock: 8,
        category: laptops._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
      },
      {
        name: 'Custom Gaming Desktop PC',
        sku: 'DESK-GAME-RTX4090',
        description: 'AMD Ryzen 7 7800X3D, RTX 4090, 64GB DDR5 RAM, 2TB NVMe',
        price: 289999,
        salePrice: 269999,
        stock: 5,
        category: desktops._id,
        status: 'active' as const,
        images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'],
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✅ Created ${products.length} sample products across nested categories`);

    // 4. Create Sample Order for Customer
    const sampleProduct1 = products[0];
    const sampleProduct2 = products[1];

    const order = await Order.create({
      user: customer._id,
      items: [
        {
          product: sampleProduct1._id,
          name: sampleProduct1.name,
          sku: sampleProduct1.sku,
          price: sampleProduct1.salePrice || sampleProduct1.price,
          quantity: 1,
          subtotal: sampleProduct1.salePrice || sampleProduct1.price,
        },
        {
          product: sampleProduct2._id,
          name: sampleProduct2.name,
          sku: sampleProduct2.sku,
          price: sampleProduct2.salePrice || sampleProduct2.price,
          quantity: 1,
          subtotal: sampleProduct2.salePrice || sampleProduct2.price,
        },
      ],
      totalAmount: (sampleProduct1.salePrice || sampleProduct1.price) + (sampleProduct2.salePrice || sampleProduct2.price),
      status: 'Confirmed',
      shippingAddress: customer.address!,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
    });
    console.log(`✅ Created sample order: ${order._id}`);

    console.log('\n==========================================');
    console.log('🎉 Seeding successfully completed!');
    console.log('==========================================');
    console.log('🔑 Seeded Credentials:');
    console.log('   Admin:    admin@example.com / admin123');
    console.log('   Customer: customer@example.com / customer123');
    console.log('==========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
