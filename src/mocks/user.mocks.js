import { faker } from '@faker-js/faker';
import { USER_ROLES } from '../constants/userRoles.js';

export const generateMockUser = (role = USER_ROLES.CUSTOMER) => {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role
    };
}

export const generateMockUsers = (count, role) => {
    return Array.from({ length: count }, () => generateMockUser(role));
}

export const generateMockCustomers = (count) => {
    return generateMockUsers(count, USER_ROLES.CUSTOMER);
}

export const generateMockOwners = (count) => {
    return generateMockUsers(count, USER_ROLES.STORE);
}