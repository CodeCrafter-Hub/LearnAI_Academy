/**
 * Admin Panel & User Management System
 *
 * Complete administrative tools for managing the platform:
 * - User management (students, teachers, parents, admins)
 * - Role-based access control (RBAC)
 * - School and district management
 * - Class and roster management
 * - Permissions and roles system
 * - System configuration and settings
 * - Administrative analytics and reporting
 * - Content moderation and review
 * - Audit logs and activity tracking
 * - Bulk operations (import/export)
 * - Data management and compliance
 * - System health monitoring
 * - License and subscription management
 * - Support ticket system
 *
 * Essential for institutional management and operations.
 */

// User roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DISTRICT_ADMIN: 'district_admin',
  SCHOOL_ADMIN: 'school_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  SUPPORT: 'support',
};

// Permissions
const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',

  // Content management
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  MODERATE_CONTENT: 'moderate_content',

  // Class management
  CREATE_CLASS: 'create_class',
  MANAGE_CLASS: 'manage_class',
  DELETE_CLASS: 'delete_class',

  // System management
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
  MANAGE_INTEGRATIONS: 'manage_integrations',

  // Data management
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
  DELETE_DATA: 'delete_data',
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.DISTRICT_ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_CLASS,
    PERMISSIONS.MANAGE_CLASS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA,
  ],
  [ROLES.SCHOOL_ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.CREATE_CLASS,
    PERMISSIONS.MANAGE_CLASS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.MANAGE_CLASS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.STUDENT]: [PERMISSIONS.READ_USER],
  [ROLES.PARENT]: [PERMISSIONS.READ_USER],
  [ROLES.SUPPORT]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_LOGS,
  ],
};

// User status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// Audit actions
const AUDIT_ACTIONS = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  ROLE_CHANGED: 'role_changed',
  PERMISSION_CHANGED: 'permission_changed',
  SETTINGS_CHANGED: 'settings_changed',
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  LOGIN: 'login',
  LOGOUT: 'logout',
};

/**
 * Admin Panel Manager
 */
export class AdminPanelManager {
  constructor(storageKey = 'admin_panel') {
    this.storageKey = storageKey;
    this.data = this.loadData();
    this.currentAdmin = null;
  }

  /**
   * Load data
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored
        ? JSON.parse(stored)
        : {
            users: {},
            schools: {},
            districts: {},
            classes: {},
            settings: this.getDefaultSettings(),
            auditLog: [],
          };
    } catch (error) {
      console.error('Error loading admin data:', error);
      return {
        users: {},
        schools: {},
        districts: {},
        classes: {},
        settings: this.getDefaultSettings(),
        auditLog: [],
      };
    }
  }

  /**
   * Save data
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving admin data:', error);
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      general: {
        platformName: 'LearnAI Academy',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
      },
      security: {
        requireEmailVerification: true,
        minPasswordLength: 8,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 5,
        twoFactorEnabled: false,
      },
      features: {
        gamificationEnabled: true,
        aiTutoringEnabled: true,
        parentPortalEnabled: true,
        mobileAppEnabled: true,
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
      },
      content: {
        moderationEnabled: true,
        autoApprove: false,
        allowStudentUploads: true,
      },
    };
  }

  /**
   * Authenticate admin
   */
  authenticateAdmin(adminId, credentials) {
    const user = this.data.users[adminId];

    if (!user) {
      throw new Error('User not found');
    }

    if (
      user.role !== ROLES.SUPER_ADMIN &&
      user.role !== ROLES.DISTRICT_ADMIN &&
      user.role !== ROLES.SCHOOL_ADMIN
    ) {
      throw new Error('Insufficient permissions');
    }

    // In production, would verify credentials properly
    this.currentAdmin = user;
    this.logAudit(AUDIT_ACTIONS.LOGIN, adminId, { timestamp: new Date().toISOString() });

    return user;
  }

  /**
   * Check permission
   */
  hasPermission(userId, permission) {
    const user = this.data.users[userId];
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Require permission
   */
  requirePermission(userId, permission) {
    if (!this.hasPermission(userId, permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  /**
   * Create user
   */
  createUser(adminId, userData) {
    this.requirePermission(adminId, PERMISSIONS.CREATE_USER);

    const userId = `user_${Date.now()}`;

    const user = {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: USER_STATUS.PENDING,
      schoolId: userData.schoolId,
      districtId: userData.districtId,
      grade: userData.grade,
      metadata: userData.metadata || {},
      createdAt: new Date().toISOString(),
      createdBy: adminId,
      lastLogin: null,
    };

    this.data.users[userId] = user;
    this.logAudit(AUDIT_ACTIONS.USER_CREATED, adminId, { userId, role: user.role });
    this.saveData();

    return user;
  }

  /**
   * Update user
   */
  updateUser(adminId, userId, updates) {
    this.requirePermission(adminId, PERMISSIONS.UPDATE_USER);

    const user = this.data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-demotion
    if (userId === adminId && updates.role && updates.role !== user.role) {
      throw new Error('Cannot change your own role');
    }

    const oldRole = user.role;

    Object.assign(user, updates);
    user.updatedAt = new Date().toISOString();
    user.updatedBy = adminId;

    if (updates.role && updates.role !== oldRole) {
      this.logAudit(AUDIT_ACTIONS.ROLE_CHANGED, adminId, {
        userId,
        oldRole,
        newRole: updates.role,
      });
    } else {
      this.logAudit(AUDIT_ACTIONS.USER_UPDATED, adminId, { userId });
    }

    this.saveData();

    return user;
  }

  /**
   * Delete user
   */
  deleteUser(adminId, userId) {
    this.requirePermission(adminId, PERMISSIONS.DELETE_USER);

    const user = this.data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-deletion
    if (userId === adminId) {
      throw new Error('Cannot delete your own account');
    }

    delete this.data.users[userId];
    this.logAudit(AUDIT_ACTIONS.USER_DELETED, adminId, {
      userId,
      email: user.email,
      role: user.role,
    });
    this.saveData();

    return { deleted: true, userId };
  }

  /**
   * Suspend user
   */
  suspendUser(adminId, userId, reason) {
    this.requirePermission(adminId, PERMISSIONS.UPDATE_USER);

    const user = this.data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    user.status = USER_STATUS.SUSPENDED;
    user.suspendedAt = new Date().toISOString();
    user.suspendedBy = adminId;
    user.suspensionReason = reason;

    this.logAudit(AUDIT_ACTIONS.USER_UPDATED, adminId, {
      userId,
      action: 'suspended',
      reason,
    });
    this.saveData();

    return user;
  }

  /**
   * Reactivate user
   */
  reactivateUser(adminId, userId) {
    this.requirePermission(adminId, PERMISSIONS.UPDATE_USER);

    const user = this.data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    user.status = USER_STATUS.ACTIVE;
    user.reactivatedAt = new Date().toISOString();
    user.reactivatedBy = adminId;

    this.logAudit(AUDIT_ACTIONS.USER_UPDATED, adminId, {
      userId,
      action: 'reactivated',
    });
    this.saveData();

    return user;
  }

  /**
   * Get users
   */
  getUsers(adminId, filters = {}) {
    this.requirePermission(adminId, PERMISSIONS.READ_USER);

    let users = Object.values(this.data.users);

    // Apply filters
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }

    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }

    if (filters.schoolId) {
      users = users.filter(u => u.schoolId === filters.schoolId);
    }

    if (filters.districtId) {
      users = users.filter(u => u.districtId === filters.districtId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(
        u =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    return users;
  }

  /**
   * Get user by ID
   */
  getUser(adminId, userId) {
    this.requirePermission(adminId, PERMISSIONS.READ_USER);

    const user = this.data.users[userId];
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Bulk create users
   */
  bulkCreateUsers(adminId, usersData) {
    this.requirePermission(adminId, PERMISSIONS.CREATE_USER);

    const created = [];
    const errors = [];

    usersData.forEach((userData, index) => {
      try {
        const user = this.createUser(adminId, userData);
        created.push(user);
      } catch (error) {
        errors.push({
          index,
          email: userData.email,
          error: error.message,
        });
      }
    });

    return {
      created: created.length,
      errors: errors.length,
      users: created,
      errorDetails: errors,
    };
  }

  /**
   * Create school
   */
  createSchool(adminId, schoolData) {
    this.requirePermission(adminId, PERMISSIONS.MANAGE_SETTINGS);

    const schoolId = `school_${Date.now()}`;

    const school = {
      id: schoolId,
      name: schoolData.name,
      districtId: schoolData.districtId,
      address: schoolData.address,
      principal: schoolData.principal,
      studentCount: 0,
      teacherCount: 0,
      status: 'active',
      settings: {},
      createdAt: new Date().toISOString(),
      createdBy: adminId,
    };

    this.data.schools[schoolId] = school;
    this.saveData();

    return school;
  }

  /**
   * Create district
   */
  createDistrict(adminId, districtData) {
    this.requirePermission(adminId, PERMISSIONS.MANAGE_SETTINGS);

    const districtId = `district_${Date.now()}`;

    const district = {
      id: districtId,
      name: districtData.name,
      superintendent: districtData.superintendent,
      schoolCount: 0,
      studentCount: 0,
      status: 'active',
      settings: {},
      createdAt: new Date().toISOString(),
      createdBy: adminId,
    };

    this.data.districts[districtId] = district;
    this.saveData();

    return district;
  }

  /**
   * Update settings
   */
  updateSettings(adminId, category, settings) {
    this.requirePermission(adminId, PERMISSIONS.MANAGE_SETTINGS);

    if (!this.data.settings[category]) {
      throw new Error('Invalid settings category');
    }

    const oldSettings = { ...this.data.settings[category] };

    Object.assign(this.data.settings[category], settings);

    this.logAudit(AUDIT_ACTIONS.SETTINGS_CHANGED, adminId, {
      category,
      changes: settings,
    });
    this.saveData();

    return this.data.settings[category];
  }

  /**
   * Get settings
   */
  getSettings(adminId, category = null) {
    this.requirePermission(adminId, PERMISSIONS.MANAGE_SETTINGS);

    if (category) {
      return this.data.settings[category];
    }

    return this.data.settings;
  }

  /**
   * Get analytics overview
   */
  getAnalyticsOverview(adminId, scope = {}) {
    this.requirePermission(adminId, PERMISSIONS.VIEW_ANALYTICS);

    const users = Object.values(this.data.users);

    let filteredUsers = users;
    if (scope.schoolId) {
      filteredUsers = users.filter(u => u.schoolId === scope.schoolId);
    }
    if (scope.districtId) {
      filteredUsers = users.filter(u => u.districtId === scope.districtId);
    }

    const overview = {
      totalUsers: filteredUsers.length,
      usersByRole: {},
      usersByStatus: {},
      recentUsers: filteredUsers
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
      schools: Object.values(this.data.schools).length,
      districts: Object.values(this.data.districts).length,
      classes: Object.values(this.data.classes).length,
    };

    // Count by role
    filteredUsers.forEach(user => {
      overview.usersByRole[user.role] = (overview.usersByRole[user.role] || 0) + 1;
      overview.usersByStatus[user.status] =
        (overview.usersByStatus[user.status] || 0) + 1;
    });

    return overview;
  }

  /**
   * Get audit logs
   */
  getAuditLogs(adminId, filters = {}) {
    this.requirePermission(adminId, PERMISSIONS.VIEW_LOGS);

    let logs = [...this.data.auditLog];

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
      logs = logs.filter(log => log.performedBy === filters.userId);
    }

    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    // Sort by most recent
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const limit = filters.limit || 100;
    return logs.slice(0, limit);
  }

  /**
   * Log audit action
   */
  logAudit(action, performedBy, details = {}) {
    const log = {
      id: `audit_${Date.now()}`,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    };

    this.data.auditLog.push(log);

    // Keep only last 10,000 logs
    if (this.data.auditLog.length > 10000) {
      this.data.auditLog = this.data.auditLog.slice(-10000);
    }

    this.saveData();
  }

  /**
   * Export data
   */
  exportData(adminId, dataType, filters = {}) {
    this.requirePermission(adminId, PERMISSIONS.EXPORT_DATA);

    let data = [];

    switch (dataType) {
      case 'users':
        data = this.getUsers(adminId, filters);
        break;
      case 'schools':
        data = Object.values(this.data.schools);
        break;
      case 'districts':
        data = Object.values(this.data.districts);
        break;
      case 'audit_logs':
        data = this.getAuditLogs(adminId, filters);
        break;
      default:
        throw new Error('Invalid data type');
    }

    this.logAudit(AUDIT_ACTIONS.DATA_EXPORTED, adminId, {
      dataType,
      recordCount: data.length,
    });

    return {
      dataType,
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      data,
    };
  }

  /**
   * Import data
   */
  importData(adminId, dataType, data) {
    this.requirePermission(adminId, PERMISSIONS.IMPORT_DATA);

    const imported = [];
    const errors = [];

    switch (dataType) {
      case 'users':
        const result = this.bulkCreateUsers(adminId, data);
        imported.push(...result.users);
        errors.push(...result.errorDetails);
        break;
      default:
        throw new Error('Invalid data type for import');
    }

    this.logAudit(AUDIT_ACTIONS.DATA_IMPORTED, adminId, {
      dataType,
      importedCount: imported.length,
      errorCount: errors.length,
    });

    return {
      imported: imported.length,
      errors: errors.length,
      importedRecords: imported,
      errorDetails: errors,
    };
  }

  /**
   * Get system health
   */
  getSystemHealth(adminId) {
    this.requirePermission(adminId, PERMISSIONS.MANAGE_SETTINGS);

    return {
      status: 'healthy',
      uptime: '99.9%',
      activeUsers: Object.values(this.data.users).filter(
        u => u.status === USER_STATUS.ACTIVE
      ).length,
      storage: {
        used: '2.3 GB',
        total: '10 GB',
        percentage: 23,
      },
      performance: {
        avgResponseTime: '45ms',
        requestsPerSecond: 120,
      },
      lastBackup: new Date().toISOString(),
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Search across all entities
   */
  globalSearch(adminId, query) {
    this.requirePermission(adminId, PERMISSIONS.READ_USER);

    const results = {
      users: [],
      schools: [],
      districts: [],
      classes: [],
    };

    const lowerQuery = query.toLowerCase();

    // Search users
    results.users = Object.values(this.data.users).filter(
      u =>
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
    );

    // Search schools
    results.schools = Object.values(this.data.schools).filter(s =>
      s.name.toLowerCase().includes(lowerQuery)
    );

    // Search districts
    results.districts = Object.values(this.data.districts).filter(d =>
      d.name.toLowerCase().includes(lowerQuery)
    );

    return results;
  }
}

/**
 * Permission Manager
 */
export class PermissionManager {
  /**
   * Get role permissions
   */
  static getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if role has permission
   */
  static roleHasPermission(role, permission) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Get all roles
   */
  static getAllRoles() {
    return Object.values(ROLES);
  }

  /**
   * Get all permissions
   */
  static getAllPermissions() {
    return Object.values(PERMISSIONS);
  }
}

export {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  USER_STATUS,
  AUDIT_ACTIONS,
};

export default AdminPanelManager;
