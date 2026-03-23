"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const service_service_1 = require("./service/service.service");
async function seedBasicServices() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const serviceService = app.get(service_service_1.ServiceService);
    try {
        console.log('🌱 Starting basic services seeding...');
        const existingServices = await serviceService.findAll(1000, 0);
        if (existingServices.length > 0) {
            console.log(`📋 Found ${existingServices.length} existing services. Skipping seeding.`);
            return;
        }
        const services = [
            { name: "Catering", category: "Food" },
            { name: "Photography", category: "Media" },
            { name: "Videography", category: "Media" },
            { name: "DJ", category: "Entertainment" },
            { name: "Live Band", category: "Entertainment" },
            { name: "Decoration", category: "Setup" },
            { name: "Lighting", category: "Setup" },
            { name: "Makeup Artist", category: "Personal" },
            { name: "Hair Styling", category: "Personal" },
            { name: "Venue Booking", category: "Logistics" },
            { name: "Invitation Design", category: "Planning" },
            { name: "Event Planning", category: "Planning" },
            { name: "Security", category: "Logistics" },
            { name: "Transportation", category: "Logistics" },
            { name: "Cake", category: "Food" },
            { name: "Bartender", category: "Food" },
            { name: "Photo Booth", category: "Media" },
            { name: "Sound System", category: "Setup" },
            { name: "Stage Setup", category: "Setup" },
            { name: "Entertainment Host", category: "Entertainment" }
        ];
        let createdCount = 0;
        for (const service of services) {
            try {
                await serviceService.create(service);
                createdCount++;
                console.log(`✅ Created: ${service.name}`);
            }
            catch (error) {
                console.log(`⚠️  Skipped: ${service.name} (might already exist)`);
            }
        }
        console.log(`🎉 Successfully seeded ${createdCount} basic services!`);
    }
    catch (error) {
        console.error('❌ Error seeding services:', error);
    }
    finally {
        await app.close();
    }
}
seedBasicServices().catch(console.error);
//# sourceMappingURL=seed-services.js.map