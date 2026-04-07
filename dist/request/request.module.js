"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const request_service_1 = require("./request.service");
const request_controller_1 = require("./request.controller");
const request_schema_1 = require("./schemas/request.schema");
const booking_module_1 = require("../booking/booking.module");
const user_module_1 = require("../user/user.module");
const vendor_module_1 = require("../vendor/vendor.module");
const event_module_1 = require("../event/event.module");
const auth_module_1 = require("../auth/auth.module");
const events_module_1 = require("../events/events.module");
const event_schema_1 = require("../event/schemas/event.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
let RequestModule = class RequestModule {
};
exports.RequestModule = RequestModule;
exports.RequestModule = RequestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema },
                { name: event_schema_1.Event.name, schema: event_schema_1.EventSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
            ]),
            (0, common_1.forwardRef)(() => booking_module_1.BookingModule),
            user_module_1.UserModule,
            vendor_module_1.VendorModule,
            event_module_1.EventModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
        ],
        controllers: [request_controller_1.RequestController],
        providers: [request_service_1.RequestService],
        exports: [request_service_1.RequestService],
    })
], RequestModule);
//# sourceMappingURL=request.module.js.map