import { validatePassword } from '@/lib/utils';

describe('Password Validation', () => {
  it('should return false for passwords with less than 8 characters', () => {
    expect(validatePassword('aBc!@12')).toBe(false);
  });

  it('should return false for passwords without an uppercase letter', () => {
    expect(validatePassword('abc!@123')).toBe(false);
  });

  it('should return false for passwords with less than 2 special characters', () => {
    expect(validatePassword('aBc-12345')).toBe(false);
  });

  it('should return true for valid passwords', () => {
    expect(validatePassword('Password!@1')).toBe(true);
    expect(validatePassword('Another$Valid#Password')).toBe(true);
  });
});
