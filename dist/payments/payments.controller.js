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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    createPayment(orderId, dto) {
        return this.paymentsService.createPayment(orderId, dto.method);
    }
    confirmPayment(paymentId, transactionId) {
        return this.paymentsService.confirmPayment(paymentId, transactionId);
    }
    getPaymentByOrder(orderId) {
        return this.paymentsService.getPaymentByOrder(orderId);
    }
    handleStripeWebhook(req, signature) {
        return this.paymentsService.handleStripeWebhook(req.body, signature);
    }
    handleSslcommerzSuccess(data) {
        return this.paymentsService.handleSslcommerzSuccess(data);
    }
    handleBkashWebhook(data) {
        return this.paymentsService.handleBkashWebhook(data);
    }
    handleNagadWebhook(data) {
        return this.paymentsService.handleNagadWebhook(data);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(':orderId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment for order' }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)(':paymentId/confirm'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm payment' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by order' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getPaymentByOrder", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('stripe/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe webhook endpoint' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('sslcommerz/success'),
    (0, swagger_1.ApiOperation)({ summary: 'SSLCommerz success callback' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleSslcommerzSuccess", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('bkash/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'bKash webhook endpoint' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleBkashWebhook", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('nagad/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Nagad webhook endpoint' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleNagadWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map