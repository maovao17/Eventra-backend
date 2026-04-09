"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const vendor_module_1 = require("./vendor/vendor.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const config_1 = require("@nestjs/config");
const Joi = __importStar(require("joi"));
const admin_module_1 = require("./admin/admin.module");
const events_module_1 = require("./events/events.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_module_1 = require("./user/user.module");
const service_module_1 = require("./service/service.module");
const cart_module_1 = require("./cart/cart.module");
const booking_module_1 = require("./booking/booking.module");
const event_module_1 = require("./event/event.module");
const request_module_1 = require("./request/request.module");
const payment_module_1 = require("./payment/payment.module");
const payout_module_1 = require("./payout/payout.module");
const notification_module_1 = require("./notification/notification.module");
const review_module_1 = require("./review/review.module");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            vendor_module_1.VendorModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    DB_URI: Joi.string().uri().default('mongodb://mongo:NBtnHsntwJMKkCiAVpiMwkxWZTRkKsCy@mongodb.railway.internal:27017/eventra'),
                    PORT: Joi.number().default(3002),
                    CORS_ORIGIN: Joi.string().default('http://localhost:3000,https://eventra-frontend-eight.vercel.app'),
                    RAZORPAY_KEY_ID: Joi.string().required(),
                    RAZORPAY_KEY_SECRET: Joi.string().required(),
                    FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().optional(),
                }),
                validationOptions: { allowUnknown: true, abortEarly: false },
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: 60,
                        limit: 30,
                    },
                ],
            }),
            nest_winston_1.WinstonModule.forRoot({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
                    }),
                ],
            }),
            admin_module_1.AdminModule,
            events_module_1.EventsModule,
            mongoose_1.MongooseModule.forRoot(process.env.DB_URI ?? 'mongodb://localhost:27017/eventra'),
            user_module_1.UserModule,
            service_module_1.ServiceModule,
            cart_module_1.CartModule,
            vendor_module_1.VendorModule,
            booking_module_1.BookingModule,
            event_module_1.EventModule,
            request_module_1.RequestModule,
            payment_module_1.PaymentModule,
            review_module_1.ReviewModule,
            payout_module_1.PayoutModule,
            notification_module_1.NotificationModule,
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map