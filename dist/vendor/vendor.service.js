"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vendor_schema_1 = require("./schemas/vendor.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
const request_schema_1 = require("../request/schemas/request.schema");
const service_schema_1 = require("../service/schemas/service.schema");
const review_schema_1 = require("../review/schemas/review.schema");
const notification_schema_1 = require("../notification/schemas/notification.schema");
const user_service_1 = require("../user/user.service");
const BOOKING_STATUS = ['pending', 'accepted', 'completed', 'cancelled'];
let VendorService = class VendorService {
    vendorModel;
    bookingModel;
    requestModel;
    serviceModel;
    reviewModel;
    notificationModel;
    userService;
    constructor(vendorModel, bookingModel, requestModel, serviceModel, reviewModel, notificationModel, userService) {
        this.vendorModel = vendorModel;
        this.bookingModel = bookingModel;
        this.requestModel = requestModel;
        this.serviceModel = serviceModel;
        this.reviewModel = reviewModel;
        this.notificationModel = notificationModel;
        this.userService = userService;
    }
    sanitizeCategory(category) {
        if (Array.isArray(category)) {
            return category
                .map((value) => String(value).trim())
                .filter(Boolean);
        }
        if (typeof category === 'string' && category.trim()) {
            return [category.trim()];
        }
        return [];
    }
    normalizeLocation(location) {
        if (!location)
            return { city: '', area: '', address: '' };
        if (typeof location === 'string') {
            return {
                city: '',
                area: '',
                address: location,
            };
        }
        if (typeof location !== 'object') {
            return { city: '', area: '', address: '' };
        }
        const source = location;
        return {
            city: String(source.city ?? '').trim(),
            area: String(source.area ?? '').trim(),
            address: String(source.address ?? source.label ?? '').trim(),
        };
    }
    isProfileComplete(vendor) {
        const hasDescription = Boolean(vendor.description?.trim());
        const hasServices = (vendor.servicesOffered?.length ?? 0) > 0 || (vendor.services?.length ?? 0) > 0;
        const hasPortfolio = (vendor.portfolio?.length ?? 0) > 0 || (vendor.gallery?.length ?? 0) > 0;
        const hasKyc = (vendor.kycDocs?.length ?? 0) > 0;
        return hasDescription && hasServices && hasPortfolio && hasKyc;
    }
    mapBookingForVendor(booking) {
        return {
            _id: String(booking._id),
            vendorId: String(booking.vendorId),
            userId: String(booking.customerId),
            customerId: String(booking.customerId),
            eventId: String(booking.eventId),
            eventDetails: {
                type: booking.eventType ?? '',
                date: booking.date ?? '',
                time: booking.time ?? '',
                location: booking.location ?? '',
                guests: Number(booking.guests ?? 0),
            },
            status: booking.status,
            paymentStatus: booking.paymentStatus ?? 'pending',
            amount: Number(booking.amount ?? booking.price ?? 0),
            requestId: booking.requestId,
            createdAt: booking.createdAt,
        };
    }
    async create(createVendorDto) {
        if (createVendorDto.userId) {
            const existing = await this.vendorModel.findOne({ userId: createVendorDto.userId }).exec();
            if (existing) {
                return existing;
            }
        }
        const category = this.sanitizeCategory(createVendorDto.category);
        const location = this.normalizeLocation(createVendorDto.location);
        return this.vendorModel.create({
            ...createVendorDto,
            name: createVendorDto.name,
            businessName: createVendorDto.businessName ?? createVendorDto.name,
            category,
            location,
            description: createVendorDto.description ?? '',
            servicesOffered: (createVendorDto.servicesOffered ?? []).map((id) => new mongoose_2.Types.ObjectId(id)),
            portfolio: (createVendorDto.portfolio ?? []).map((item) => ({
                url: item.url,
                caption: item.caption ?? '',
                category: item.category ?? '',
                uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
            })),
            availability: {
                blockedDates: createVendorDto.availability?.blockedDates?.map((value) => new Date(value)) ?? [],
                workingHours: {
                    start: createVendorDto.availability?.workingHours?.start ?? '09:00',
                    end: createVendorDto.availability?.workingHours?.end ?? '18:00',
                },
            },
            kycDocs: createVendorDto.kycDocs ?? [],
            rating: createVendorDto.rating ?? 0,
            totalReviews: createVendorDto.totalReviews ?? 0,
            isVerified: createVendorDto.isVerified ?? createVendorDto.verified ?? false,
            verified: createVendorDto.verified ?? createVendorDto.isVerified ?? false,
            price: createVendorDto.price ?? 0,
            image: createVendorDto.image ?? '',
            profileImage: createVendorDto.profileImage ?? createVendorDto.image ?? '',
            gallery: createVendorDto.gallery ?? [],
            services: (createVendorDto.services ?? []).map((name) => ({
                name,
            })),
            packages: createVendorDto.packages ?? [],
            responseTime: createVendorDto.responseTime ?? '1 hour',
        });
    }
    async getOrCreateVendorProfile(userId) {
        let vendor = await this.findByUserId(userId);
        if (!vendor) {
            const user = await this.userService.findByUserId(userId);
            if (user.role !== 'vendor') {
                throw new common_1.ForbiddenException('Only vendor users can access vendor profile');
            }
            vendor = await this.create({
                userId,
                name: user.businessName ?? user.name,
                businessName: user.businessName ?? user.name,
                description: '',
                category: [],
                services: [],
                servicesOffered: [],
                portfolio: [],
                kycDocs: [],
                isVerified: false,
            });
        }
        return vendor;
    }
    async getVendorMe(userId) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        const payload = vendor.toObject();
        return {
            ...payload,
            profileCompleted: this.isProfileComplete(vendor),
        };
    }
    async getByUserId(userId) {
        return this.getVendorMe(userId);
    }
    async updateVendorMe(userId, updateVendorDto) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        const category = updateVendorDto.category
            ? this.sanitizeCategory(updateVendorDto.category)
            : vendor.category ?? [];
        const servicesOffered = updateVendorDto.servicesOffered
            ? updateVendorDto.servicesOffered.map((id) => new mongoose_2.Types.ObjectId(id))
            : vendor.servicesOffered ?? [];
        const nextLocation = updateVendorDto.location
            ? this.normalizeLocation(updateVendorDto.location)
            : vendor.location ?? { city: '', area: '', address: '' };
        const nextPortfolio = Array.isArray(updateVendorDto.portfolio)
            ? updateVendorDto.portfolio
                .map((item) => ({
                url: String(item.url ?? '').trim(),
                caption: String(item.caption ?? '').trim(),
                category: String(item.category ?? '').trim(),
                uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
            }))
                .filter((item) => Boolean(item.url))
                .slice(0, 7)
            : vendor.portfolio ?? [];
        Object.assign(vendor, {
            ...updateVendorDto,
            category,
            servicesOffered,
            location: nextLocation,
            portfolio: nextPortfolio,
            gallery: nextPortfolio.map((item) => item.url),
            isVerified: false,
            verified: false,
            businessName: updateVendorDto.businessName ?? vendor.businessName ?? updateVendorDto.name ?? vendor.name,
            name: updateVendorDto.name ?? vendor.name,
            totalReviews: vendor.totalReviews ?? 0,
        });
        await vendor.save();
        return {
            ...vendor.toObject(),
            profileCompleted: this.isProfileComplete(vendor),
        };
    }
    async updateByUserId(userId, updateVendorDto) {
        return this.updateVendorMe(userId, updateVendorDto);
    }
    async upsertProfile(userId, updateVendorDto) {
        await this.updateVendorMe(userId, updateVendorDto);
        return this.findByUserIdOrThrow(userId);
    }
    async addPortfolioItems(userId, items) {
        if (!items.length) {
            throw new common_1.BadRequestException('At least one portfolio item is required');
        }
        const vendor = await this.findByUserIdOrThrow(userId);
        const portfolio = vendor.portfolio ?? [];
        items.forEach((item) => {
            portfolio.push({
                url: item.url,
                caption: item.caption ?? '',
                category: item.category ?? '',
                uploadedAt: item.uploadedAt ?? new Date(),
            });
        });
        vendor.portfolio = portfolio;
        vendor.gallery = vendor.gallery ?? [];
        vendor.gallery.push(...items.map((item) => item.url));
        await vendor.save();
        return vendor;
    }
    async assignServices(userId, serviceIds) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const uniqueIds = Array.from(new Set(serviceIds.filter(Boolean)));
        if (uniqueIds.some((id) => !mongoose_2.Types.ObjectId.isValid(id))) {
            throw new common_1.BadRequestException('One or more service IDs are invalid');
        }
        const services = uniqueIds.length
            ? await this.serviceModel.find({ _id: { $in: uniqueIds } }).exec()
            : [];
        if (services.length !== uniqueIds.length) {
            throw new common_1.NotFoundException('Some services were not found');
        }
        vendor.servicesOffered = uniqueIds.map((id) => new mongoose_2.Types.ObjectId(id));
        vendor.services = services.map((item) => ({
            name: item.name,
            price: Number(item.price ?? 0),
            description: item.description ?? '',
        }));
        vendor.category = Array.from(new Set(services.map((item) => item.category).filter(Boolean)));
        vendor.isVerified = false;
        vendor.verified = false;
        await vendor.save();
        return vendor;
    }
    async updateAvailability(userId, payload) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const blockedDates = (payload.blockedDates ?? []).map((value) => new Date(value));
        const workingHours = {
            start: payload.workingHours?.start ?? vendor.availability?.workingHours?.start ?? '09:00',
            end: payload.workingHours?.end ?? vendor.availability?.workingHours?.end ?? '18:00',
        };
        vendor.availability = {
            blockedDates,
            workingHours,
        };
        await vendor.save();
        return vendor;
    }
    async addPackage(userId, vendorPackage) {
        const vendor = await this.findByUserIdOrThrow(userId);
        vendor.packages = vendor.packages ?? [];
        vendor.packages.push({
            name: vendorPackage.name,
            price: Number(vendorPackage.price),
            description: vendorPackage.description ?? '',
            servicesIncluded: vendorPackage.servicesIncluded ?? [],
        });
        await vendor.save();
        return vendor;
    }
    async addGalleryImage(userId, imageUrl) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const gallery = vendor.gallery ?? [];
        gallery.push(imageUrl);
        vendor.gallery = gallery;
        const portfolio = vendor.portfolio ?? [];
        portfolio.push({
            url: imageUrl,
            caption: '',
            category: '',
            uploadedAt: new Date(),
        });
        vendor.portfolio = portfolio;
        await vendor.save();
        return vendor;
    }
    async updateProfileImage(userId, imageUrl) {
        const vendor = await this.findByUserIdOrThrow(userId);
        vendor.profileImage = imageUrl;
        vendor.image = imageUrl;
        await vendor.save();
        return vendor;
    }
    async getVendorBookings(userId, bucket) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const vendorId = String(vendor._id);
        const bookings = await this.bookingModel
            .find({ vendorId })
            .sort({ createdAt: -1 })
            .exec();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const filtered = bookings.filter((booking) => {
            if (!bucket)
                return true;
            if (bucket === 'upcoming') {
                if (!booking.date)
                    return ['accepted', 'pending'].includes(booking.status);
                return (new Date(booking.date) >= now &&
                    !['cancelled', 'rejected', 'completed'].includes(booking.status));
            }
            if (bucket === 'completed') {
                return booking.status === 'completed';
            }
            if (bucket === 'cancelled') {
                return booking.status === 'cancelled' || booking.status === 'rejected';
            }
            throw new common_1.BadRequestException('Invalid booking bucket');
        });
        return filtered.map((booking) => this.mapBookingForVendor(booking));
    }
    async updateVendorBookingStatus(userId, bookingId, status) {
        if (!BOOKING_STATUS.includes(status)) {
            throw new common_1.BadRequestException('Invalid booking status');
        }
        const vendor = await this.findByUserIdOrThrow(userId);
        const booking = await this.bookingModel.findById(bookingId).exec();
        if (!booking || String(booking.vendorId) !== String(vendor._id)) {
            throw new common_1.NotFoundException('Booking not found for this vendor');
        }
        if (booking.status === 'cancelled' && status !== 'cancelled') {
            throw new common_1.BadRequestException('Cancelled bookings cannot be re-opened');
        }
        booking.status = status;
        await booking.save();
        return this.mapBookingForVendor(booking);
    }
    async getVendorReviews(userId) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const vendorId = String(vendor._id);
        const reviews = await this.reviewModel
            .find({ vendorId })
            .sort({ createdAt: -1 })
            .exec();
        const totalReviews = reviews.length;
        const rating = totalReviews
            ? Number((reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / totalReviews).toFixed(2))
            : 0;
        vendor.rating = rating;
        vendor.totalReviews = totalReviews;
        await vendor.save();
        return reviews;
    }
    async getVendorNotifications(userId) {
        const vendor = await this.findByUserIdOrThrow(userId);
        return this.notificationModel
            .find({ vendorId: String(vendor._id) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async markVendorNotificationRead(userId, notificationId) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const notification = await this.notificationModel.findById(notificationId).exec();
        if (!notification || String(notification.vendorId) !== String(vendor._id)) {
            throw new common_1.NotFoundException('Notification not found for this vendor');
        }
        notification.read = true;
        await notification.save();
        return notification;
    }
    async getDashboard(userId) {
        const vendor = await this.findByUserIdOrThrow(userId);
        const vendorId = String(vendor._id);
        const bookings = await this.bookingModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
        const pendingRequests = await this.requestModel.countDocuments({
            vendorId,
            status: 'pending',
        });
        const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
        const completedBookings = bookings.filter((booking) => booking.status === 'completed').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const revenueBookings = bookings.filter((booking) => ['accepted', 'completed'].includes(booking.status));
        const monthlyRevenue = revenueBookings
            .filter((booking) => {
            const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
            return createdAt
                ? createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear()
                : false;
        })
            .reduce((sum, booking) => sum + Number(booking.amount ?? booking.price ?? 0), 0);
        const totalRevenue = revenueBookings.reduce((sum, booking) => sum + Number(booking.amount ?? booking.price ?? 0), 0);
        const upcomingEvents = bookings.filter((booking) => {
            if (!booking.date)
                return booking.status === 'accepted';
            return new Date(booking.date) >= today && booking.status !== 'cancelled';
        });
        return {
            totalBookings: bookings.length,
            pendingRequests,
            pendingBookings,
            completedBookings,
            monthlyRevenue,
            monthlyEarnings: monthlyRevenue,
            revenue: totalRevenue,
            rating: Number(vendor.rating ?? 0),
            totalReviews: Number(vendor.totalReviews ?? 0),
            upcomingEvents: upcomingEvents.length,
            verified: Boolean(vendor.isVerified || vendor.verified),
            profileCompleted: this.isProfileComplete(vendor),
        };
    }
    async getPendingVendors() {
        return this.vendorModel.find({ isVerified: { $ne: true } }).sort({ createdAt: -1 }).exec();
    }
    async approveVendor(id) {
        const vendor = await this.vendorModel
            .findByIdAndUpdate(id, { isVerified: true, verified: true }, { new: true })
            .exec();
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async findAll() {
        return this.vendorModel.find().exec();
    }
    async findByUserId(userId) {
        return this.vendorModel.findOne({ userId }).exec();
    }
    async findByUserIdOrThrow(userId) {
        const vendor = await this.findByUserId(userId);
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found for this user');
        }
        return vendor;
    }
    async findByServices(services) {
        const normalizedServices = services.map((service) => service.trim()).filter(Boolean);
        if (normalizedServices.length === 0) {
            return [];
        }
        return this.vendorModel
            .find({
            $or: [
                { category: { $in: normalizedServices } },
                { 'services.name': { $in: normalizedServices } },
            ],
        })
            .sort({ price: 1, name: 1 })
            .exec();
    }
    async findOne(id) {
        const vendor = await this.vendorModel.findById(new mongoose_2.Types.ObjectId(id)).exec();
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async update(id, updateVendorDto) {
        const payload = { ...updateVendorDto };
        if (updateVendorDto.category) {
            payload.category = this.sanitizeCategory(updateVendorDto.category);
        }
        if (updateVendorDto.location) {
            payload.location = this.normalizeLocation(updateVendorDto.location);
        }
        if (updateVendorDto.servicesOffered) {
            payload.servicesOffered = updateVendorDto.servicesOffered.map((item) => new mongoose_2.Types.ObjectId(item));
        }
        const vendor = await this.vendorModel.findByIdAndUpdate(id, payload, { new: true }).exec();
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async remove(id) {
        const vendor = await this.vendorModel.findByIdAndDelete(id).exec();
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(2, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __param(3, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __param(4, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(5, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UserService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map