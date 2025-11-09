import { cacheService } from '../services/cache/cacheService.js';

/**
 * Account Lockout Service
 * 
 * Prevents brute force attacks by locking accounts after multiple failed login attempts
 */

const LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5, // Maximum failed attempts before lockout
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  ATTEMPT_WINDOW: 15 * 60 * 1000, // Track attempts within 15 minutes
};

/**
 * Check if account is locked
 * @param {string} identifier - Email or userId
 * @returns {Promise<{locked: boolean, remainingAttempts: number, unlockAt: Date|null}>}
 */
export async function checkAccountLockout(identifier) {
  const lockKey = `lockout:${identifier}`;
  const attemptsKey = `login_attempts:${identifier}`;

  try {
    // Check if account is locked
    const lockData = await cacheService.get(lockKey);
    if (lockData) {
      const { lockedUntil } = JSON.parse(lockData);
      const now = Date.now();

      if (now < lockedUntil) {
        return {
          locked: true,
          remainingAttempts: 0,
          unlockAt: new Date(lockedUntil),
          lockoutDuration: Math.ceil((lockedUntil - now) / 1000), // seconds
        };
      } else {
        // Lock expired, remove it
        await cacheService.delete(lockKey);
      }
    }

    // Get current attempt count
    const attemptsData = await cacheService.get(attemptsKey);
    const attempts = attemptsData ? parseInt(attemptsData, 10) : 0;

    return {
      locked: false,
      remainingAttempts: Math.max(0, LOCKOUT_CONFIG.MAX_ATTEMPTS - attempts),
      unlockAt: null,
    };
  } catch (error) {
    console.error('Error checking account lockout:', error);
    // Fail open - don't block legitimate users if cache fails
    return {
      locked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_ATTEMPTS,
      unlockAt: null,
    };
  }
}

/**
 * Record a failed login attempt
 * @param {string} identifier - Email or userId
 * @returns {Promise<{locked: boolean, remainingAttempts: number, unlockAt: Date|null}>}
 */
export async function recordFailedAttempt(identifier) {
  const lockKey = `lockout:${identifier}`;
  const attemptsKey = `login_attempts:${identifier}`;

  try {
    // Increment failed attempts
    const attemptsData = await cacheService.get(attemptsKey);
    let attempts = attemptsData ? parseInt(attemptsData, 10) : 0;
    attempts += 1;

    // Store attempts with expiration
    await cacheService.set(
      attemptsKey,
      attempts.toString(),
      LOCKOUT_CONFIG.ATTEMPT_WINDOW / 1000 // Convert to seconds
    );

    // Check if we should lock the account
    if (attempts >= LOCKOUT_CONFIG.MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_CONFIG.LOCKOUT_DURATION;
      await cacheService.set(
        lockKey,
        JSON.stringify({ lockedUntil }),
        LOCKOUT_CONFIG.LOCKOUT_DURATION / 1000
      );

      return {
        locked: true,
        remainingAttempts: 0,
        unlockAt: new Date(lockedUntil),
        lockoutDuration: LOCKOUT_CONFIG.LOCKOUT_DURATION / 1000,
      };
    }

    return {
      locked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_ATTEMPTS - attempts,
      unlockAt: null,
    };
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return {
      locked: false,
      remainingAttempts: LOCKOUT_CONFIG.MAX_ATTEMPTS,
      unlockAt: null,
    };
  }
}

/**
 * Clear failed attempts (on successful login)
 * @param {string} identifier - Email or userId
 */
export async function clearFailedAttempts(identifier) {
  const lockKey = `lockout:${identifier}`;
  const attemptsKey = `login_attempts:${identifier}`;

  try {
    await cacheService.delete(lockKey);
    await cacheService.delete(attemptsKey);
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
}

/**
 * Manually unlock an account (admin function)
 * @param {string} identifier - Email or userId
 */
export async function unlockAccount(identifier) {
  await clearFailedAttempts(identifier);
}

export default {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  unlockAccount,
  LOCKOUT_CONFIG,
};

