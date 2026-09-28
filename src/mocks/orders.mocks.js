import { faker } from "@faker-js/faker";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import { DELIVERY_PRIORITY } from "../constants/deliveryPriority.js";

export const generateMockOrder = (customerID, storeID) => {

    const items = [
        {
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 10 }),
            price: faker.number.int({ min: 1000, max: 10000 }),
        }
    ];

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
        customer: customerID,
        store: storeID,
        items,
        deliveryAddress: faker.location.streetAddress(),
        total,
        status: ORDER_STATUS.CREATED,
        priority: DELIVERY_PRIORITY.NORMAL,
    }
}

export const generateMockOrders = (count, customerID, storeID) => {
    return Array.from({ length: count }, () => generateMockOrder(customerID, storeID));
}