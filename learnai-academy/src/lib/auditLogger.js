import prisma from './prisma.js';
import { logSecurity } from './logger.js';

/**
 * Audit Logger Service
 * 
 * Logs sensitive operations for security and compliance
 */

/**
 * Log an audit event
 * @param {Object} event - Audit event data
 */
export async function logAuditEvent(event) {
  const {
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
    metadata = {},
    severity = 'info',
  } = event;

  try {
    // Log to Winston logger
    logSecurity(action, severity, {
      userId,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      ...metadata,
    });

    // Store in database for long-term audit trail
    // Note: In production, you might want a separate audit log table
    // For now, we'll use the existing logger which writes to files
    
    // If you want database audit logs, uncomment and create an AuditLog model:
    /*
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        metadata: JSON.stringify(metadata),
        severity,
        createdAt: new Date(),
      },
    });
    */
  } catch (error) {
    // Don't fail the operation if audit logging fails
    console.error('Audit logging failed:', error);
  }
}

/**
 * Log authentication events
 */
export const auditAuth = {
  login: async (userId, email, ipAddress, userAgent, success, reason = null) => {
    await logAuditEvent({
      userId,
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceId: email,
      ipAddress,
      userAgent,
      metadata: {
        success,
        reason,
      },
      severity: success ? 'info' : 'warn',
    });
  },

  logout: async (userId, ipAddress, userAgent) => {
    await logAuditEvent({
      userId,
      action: 'LOGOUT',
      resourceType: 'AUTH',
      ipAddress,
      userAgent,
      severity: 'info',
    });
  },

  register: async (userId, email, ipAddress, userAgent) => {
    await logAuditEvent({
      userId,
      action: 'REGISTER',
      resourceType: 'AUTH',
      resourceId: email,
      ipAddress,
      userAgent,
      severity: 'info',
    });
  },

  passwordChange: async (userId, ipAddress, userAgent) => {
    await logAuditEvent({
      userId,
      action: 'PASSWORD_CHANGE',
      resourceType: 'USER',
      resourceId: userId,
      ipAddress,
      userAgent,
      severity: 'warn',
    });
  },

  accountLocked: async (userId, email, ipAddress, reason) => {
    await logAuditEvent({
      userId,
      action: 'ACCOUNT_LOCKED',
      resourceType: 'AUTH',
      resourceId: email,
      ipAddress,
      metadata: { reason },
      severity: 'error',
    });
  },
};

/**
 * Log data access events
 */
export const auditData = {
  view: async (userId, resourceType, resourceId, ipAddress) => {
    await logAuditEvent({
      userId,
      action: 'VIEW',
      resourceType,
      resourceId,
      ipAddress,
      severity: 'info',
    });
  },

  create: async (userId, resourceType, resourceId, ipAddress) => {
    await logAuditEvent({
      userId,
      action: 'CREATE',
      resourceType,
      resourceId,
      ipAddress,
      severity: 'info',
    });
  },

  update: async (userId, resourceType, resourceId, ipAddress, changes = {}) => {
    await logAuditEvent({
      userId,
      action: 'UPDATE',
      resourceType,
      resourceId,
      ipAddress,
      metadata: { changes },
      severity: 'info',
    });
  },

  delete: async (userId, resourceType, resourceId, ipAddress) => {
    await logAuditEvent({
      userId,
      action: 'DELETE',
      resourceType,
      resourceId,
      ipAddress,
      severity: 'warn',
    });
  },
};

/**
 * Log security events
 */
export const auditSecurity = {
  suspiciousActivity: async (userId, activity, ipAddress, userAgent) => {
    await logAuditEvent({
      userId,
      action: 'SUSPICIOUS_ACTIVITY',
      resourceType: 'SECURITY',
      ipAddress,
      userAgent,
      metadata: { activity },
      severity: 'error',
    });
  },

  rateLimitExceeded: async (identifier, endpoint, ipAddress) => {
    await logAuditEvent({
      userId: null,
      action: 'RATE_LIMIT_EXCEEDED',
      resourceType: 'API',
      resourceId: endpoint,
      ipAddress,
      metadata: { identifier },
      severity: 'warn',
    });
  },

  unauthorizedAccess: async (userId, resourceType, resourceId, ipAddress) => {
    await logAuditEvent({
      userId,
      action: 'UNAUTHORIZED_ACCESS',
      resourceType,
      resourceId,
      ipAddress,
      severity: 'error',
    });
  },
};

/**
 * Get client IP and user agent from request
 */
export function getRequestMetadata(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const userAgent = request.headers.get('user-agent');

  const ipAddress = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  return { ipAddress, userAgent };
}

export default {
  logAuditEvent,
  auditAuth,
  auditData,
  auditSecurity,
  getRequestMetadata,
};

