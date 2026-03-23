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
let RequestModule = class RequestModule {
};
exports.RequestModule = RequestModule;
exports.RequestModule = RequestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: request_schema_1.Request.name, schema: request_schema_1.RequestSchema }]),
            (0, common_1.forwardRef)(() => booking_module_1.BookingModule),
            user_module_1.UserModule,
            vendor_module_1.VendorModule,
            event_module_1.EventModule,
        ],
        controllers: [request_controller_1.RequestController],
        providers: [request_service_1.RequestService],
        exports: [request_service_1.RequestService],
    })
], RequestModule);
//# sourceMappingURL=request.module.js.map