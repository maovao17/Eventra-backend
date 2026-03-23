import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VendorService } from './vendor/vendor.service';

async function seedVendors() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vendorService = app.get(VendorService);

  try {
    console.log('🌱 Seeding vendors...');

    const existingVendors = await vendorService.findAll();
    if (existingVendors.length > 0) {
      console.log(`📋 Found ${existingVendors.length} existing vendors. Skipping seeding.`);
      return;
    }

    const vendors = [
      {
        name: 'StudioX Photography',
        category: 'Photography',
        price: 20000,
        description: 'Editorial-style event photography and reels.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        responseTime: '1 hour',
      },
      {
        name: 'Royal Caterers',
        category: 'Catering',
        price: 35000,
        description: 'Wedding and large-event catering services.',
        responseTime: '1 hour',
      },
      {
        name: 'Velvet & Vine Decor',
        category: 'Decor',
        price: 28000,
        description: 'Stage styling, florals, and custom decor concepts.',
        responseTime: '1 hour',
      },
      {
        name: 'DJ Nights Goa',
        category: 'DJ',
        price: 15000,
        description: 'High-energy DJ sets for weddings and nightlife events.',
        responseTime: '1 hour',
      },
      {
        name: 'Elite Makeup Studio',
        category: 'Makeup',
        price: 12000,
        description: 'Bridal and party makeup packages for all event sizes.',
        responseTime: '1 hour',
      },
    ];

    for (const vendor of vendors) {
      await vendorService.create(vendor as any);
      console.log(`✅ Created vendor: ${vendor.name}`);
    }

    console.log('🎉 Vendor seeding complete.');
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
  } finally {
    await app.close();
  }
}

seedVendors().catch(console.error);
