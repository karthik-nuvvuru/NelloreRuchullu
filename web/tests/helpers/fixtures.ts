import { test as base, expect } from '@playwright/test';

export interface FoodOrderFixtures {
  testUser: { email: string; password: string; firstName: string; lastName: string };
  adminUser: { email: string; password: string };
  apiUrl: string;
}

export const test = base.extend<FoodOrderFixtures>({
  testUser: [{ email: 'test@e2e.com', password: 'TestPass123!', firstName: 'E2E', lastName: 'User' }, { option: true }],
  adminUser: [{ email: 'admin@e2e.com', password: 'AdminPass123!' }, { option: true }],
  apiUrl: [process.env.API_URL || 'http://localhost:8000/api/v1', { option: true }],
});

export { expect };
