import { faker } from "@faker-js/faker";

export const generateMockStore = (ownerID) => {
    return {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        owner: ownerID
    };
}

export const generateMockStores = (count, ownerID) => {
    return Array.from({ length: count }, () => generateMockStore(ownerID));
}