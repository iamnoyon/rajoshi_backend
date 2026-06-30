import { User } from './user.entity';
export declare enum AddressType {
    SHIPPING = "shipping",
    BILLING = "billing"
}
export declare class Address {
    id: string;
    type: AddressType;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
