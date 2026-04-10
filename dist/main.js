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
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const express = __importStar(require("express"));
async function bootstrap() {
    if (!admin.apps.length) {
        const serviceAccountPath = (0, path_1.join)(process.cwd(), 'serviceAccountKey.json');
        if ((0, fs_1.existsSync)(serviceAccountPath)) {
            admin.initializeApp({
                credential: admin.credential.cert(require(serviceAccountPath)),
            });
        }
        else {
            admin.initializeApp();
        }
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ level, message, timestamp }) => {
                        return `${timestamp} [${level}] ${message}`;
                    })),
                }),
            ],
        }),
    });
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,https://eventra-frontend-eight.vercel.app').split(',').map(o => o.trim()),
        credentials: true,
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsDir)) {
        (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
    }
    app.use('/uploads', (0, express_1.static)(uploadsDir));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.use('/uploads', express.static(uploadsDir));
    await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map