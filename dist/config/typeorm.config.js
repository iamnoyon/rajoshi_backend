"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const user_entity_1 = require("../entities/user.entity");
const product_entity_1 = require("../entities/product.entity");
const category_entity_1 = require("../entities/category.entity");
const product_image_entity_1 = require("../entities/product-image.entity");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const payment_entity_1 = require("../entities/payment.entity");
const coupon_entity_1 = require("../entities/coupon.entity");
const review_entity_1 = require("../entities/review.entity");
const wishlist_entity_1 = require("../entities/wishlist.entity");
const cart_entity_1 = require("../entities/cart.entity");
const address_entity_1 = require("../entities/address.entity");
const typeOrmConfig = (configService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    entities: [
        user_entity_1.User,
        product_entity_1.Product,
        category_entity_1.Category,
        product_image_entity_1.ProductImage,
        order_entity_1.Order,
        order_item_entity_1.OrderItem,
        payment_entity_1.Payment,
        coupon_entity_1.Coupon,
        review_entity_1.Review,
        wishlist_entity_1.Wishlist,
        cart_entity_1.Cart,
        address_entity_1.Address,
    ],
    synchronize: true,
});
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map