"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const vendor_controller_1 = require("./vendor.controller");
const vendor_service_1 = require("./vendor.service");
const vendor_schema_1 = require("./schemas/vendor.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
const request_schema_1 = require("../request/schemas/request.schema");
const admin_vendor_controller_1 = require("./admin-vendor.controller");
const service_schema_1 = require("../service/schemas/service.schema");
const review_schema_1 = require("../review/schemas/review.schema");
const notification_schema_1 = require("../notification/schemas/notification.schema");
const user_module_1 = require("../user/user.module");
const auth_module_1 = require("../auth/auth.module");
const firebase_guard_1 = require("../auth/firebase.guard");
let VendorModule = class VendorModule {
};
exports.VendorModule = VendorModule;
exports.VendorModule = VendorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const ext = (0, path_1.extname)(file.originalname);
                        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                    },
                }),
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: vendor_schema_1.Vendor.name, schema: vendor_schema_1.VendorSchema },
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
                { name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema },
                { name: service_schema_1.Service.name, schema: service_schema_1.ServiceSchema },
                { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
            ]),
        ],
        controllers: [vendor_controller_1.VendorController, admin_vendor_controller_1.AdminVendorController],
        providers: [vendor_service_1.VendorService, firebase_guard_1.FirebaseAuthGuard],
        exports: [vendor_service_1.VendorService],
    })
], VendorModule);
//# sourceMappingURL=vendor.module.js.map