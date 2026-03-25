# Razorpay Order Creation TODO

## Approved Plan:
Add POST /payments/create-order endpoint using existing PaymentModule without breaking booking/payment logic.

## Steps:
- [x] 1. Create CreateOrderDto in src/payment/dto/create-order.dto.ts ✅
- [x] 2. Update src/payment/payment.service.ts - add Razorpay instance + createRazorpayOrder method ✅
- [x] 3. Update src/payment/payment.controller.ts - add @Post('create-order') endpoint + import DTO ✅
- [x] 4. Test endpoint: POST /payments/create-order body: {amount: 50000} ✅ (server running)
- [x] 5. Mark complete & attempt_completion ✅

## Notes:
- Razorpay env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- Return only {orderId: order.id, amount: order.amount}
- Min amount ₹1 (100 paise)

