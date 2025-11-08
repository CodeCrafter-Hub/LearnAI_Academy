/**
 * Reward Shop and Points System
 * Gamification through points, rewards, and virtual currency
 */

/**
 * Reward catalog with items students can unlock
 */
const REWARD_CATALOG = {
  // Avatar customization
  avatars: [
    { id: 'robot', name: 'Robot Avatar', cost: 100, type: 'avatar', icon: '🤖', rarity: 'common' },
    { id: 'unicorn', name: 'Unicorn Avatar', cost: 250, type: 'avatar', icon: '🦄', rarity: 'rare' },
    { id: 'dragon', name: 'Dragon Avatar', cost: 500, type: 'avatar', icon: '🐉', rarity: 'epic' },
    { id: 'wizard', name: 'Wizard Avatar', cost: 1000, type: 'avatar', icon: '🧙', rarity: 'legendary' },
  ],

  // Themes
  themes: [
    { id: 'space', name: 'Space Theme', cost: 200, type: 'theme', icon: '🚀', rarity: 'common' },
    { id: 'ocean', name: 'Ocean Theme', cost: 300, type: 'theme', icon: '🌊', rarity: 'rare' },
    { id: 'forest', name: 'Forest Theme', cost: 400, type: 'theme', icon: '🌲', rarity: 'rare' },
    { id: 'galaxy', name: 'Galaxy Theme', cost: 750, type: 'theme', icon: '🌌', rarity: 'epic' },
  ],

  // Power-ups
  powerups: [
    { id: 'hint-pack', name: 'Hint Pack (5x)', cost: 50, type: 'powerup', icon: '💡', consumable: true, quantity: 5 },
    { id: 'time-boost', name: 'Time Boost', cost: 75, type: 'powerup', icon: '⚡', consumable: true, duration: '1-session' },
    { id: 'double-xp', name: 'Double XP (1 day)', cost: 150, type: 'powerup', icon: '⭐', consumable: true, duration: '1-day' },
    { id: 'streak-freeze', name: 'Streak Freeze', cost: 200, type: 'powerup', icon: '❄️', consumable: true },
  ],

  // Badges
  badges: [
    { id: 'gold-star', name: 'Gold Star Badge', cost: 300, type: 'badge', icon: '⭐', rarity: 'rare' },
    { id: 'trophy', name: 'Trophy Badge', cost: 500, type: 'badge', icon: '🏆', rarity: 'epic' },
    { id: 'crown', name: 'Crown Badge', cost: 1000, type: 'badge', icon: '👑', rarity: 'legendary' },
  ],

  // Special items
  special: [
    { id: 'pet-cat', name: 'Study Pet: Cat', cost: 600, type: 'pet', icon: '🐱', rarity: 'epic' },
    { id: 'pet-dog', name: 'Study Pet: Dog', cost: 600, type: 'pet', icon: '🐶', rarity: 'epic' },
    { id: 'trophy-shelf', name: 'Trophy Shelf', cost: 800, type: 'decoration', icon: '🏅', rarity: 'epic' },
    { id: 'custom-emoji', name: 'Custom Emoji Pack', cost: 1500, type: 'emoji-pack', icon: '😎', rarity: 'legendary' },
  ],

  // Certificates
  certificates: [
    { id: 'month-perfect', name: 'Perfect Month Certificate', cost: 2000, type: 'certificate', icon: '📜', rarity: 'legendary' },
    { id: 'subject-master', name: 'Subject Mastery Certificate', cost: 2500, type: 'certificate', icon: '🎓', rarity: 'legendary' },
  ],
};

/**
 * Points earning activities
 */
const POINTS_ACTIVITIES = {
  // Learning activities
  questionCorrect: { points: 10, multiplier: 'difficulty' },
  questionPerfect: { points: 20, multiplier: 'difficulty' }, // Correct + fast
  topicCompleted: { points: 100 },
  topicMastered: { points: 250 },
  lessonCompleted: { points: 50 },

  // Streaks
  dailyStreak: { points: 25 },
  weeklyStreak: { points: 100 },
  monthlyStreak: { points: 500 },

  // Reviews
  reviewCompleted: { points: 5 },
  reviewPerfect: { points: 15 },

  // Social
  helpPeer: { points: 30 },
  groupSession: { points: 40 },
  challengeWin: { points: 100 },
  challengeParticipate: { points: 25 },

  // Achievements
  achievementEarned: { points: 50, multiplier: 'tier' }, // bronze: 1x, silver: 2x, gold: 3x, platinum: 4x

  // Habits
  habitCompleted: { points: 15 },
  allHabitsDay: { points: 50 },
};

/**
 * PointsManager
 * Manages student points and earning activities
 */
export class PointsManager {
  constructor(storage = 'localStorage') {
    this.storage = storage;
    this.balances = new Map();
    this.transactions = new Map();
    this.loadData();
  }

  /**
   * Get student balance
   */
  getBalance(studentId) {
    if (!this.balances.has(studentId)) {
      this.balances.set(studentId, {
        studentId,
        points: 0,
        lifetimePoints: 0,
        rank: 'Beginner',
        level: 1,
      });
    }

    return this.balances.get(studentId);
  }

  /**
   * Award points
   */
  awardPoints(studentId, activity, metadata = {}) {
    const activityConfig = POINTS_ACTIVITIES[activity];

    if (!activityConfig) {
      throw new Error(`Activity ${activity} not found`);
    }

    let points = activityConfig.points;

    // Apply multipliers
    if (activityConfig.multiplier === 'difficulty' && metadata.difficulty) {
      points = points * (metadata.difficulty / 5);
    } else if (activityConfig.multiplier === 'tier' && metadata.tier) {
      const multipliers = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
      points = points * (multipliers[metadata.tier] || 1);
    }

    // Apply active power-ups
    if (metadata.doubleXP) {
      points = points * 2;
    }

    points = Math.round(points);

    // Update balance
    const balance = this.getBalance(studentId);
    balance.points += points;
    balance.lifetimePoints += points;

    // Update rank
    balance.rank = this.calculateRank(balance.lifetimePoints);
    balance.level = this.calculateLevel(balance.lifetimePoints);

    // Record transaction
    this.recordTransaction(studentId, {
      type: 'earn',
      activity,
      points,
      metadata,
      balanceAfter: balance.points,
    });

    this.saveData();

    return {
      pointsEarned: points,
      newBalance: balance.points,
      rank: balance.rank,
      level: balance.level,
    };
  }

  /**
   * Spend points
   */
  spendPoints(studentId, amount, reason) {
    const balance = this.getBalance(studentId);

    if (balance.points < amount) {
      throw new Error('Insufficient points');
    }

    balance.points -= amount;

    this.recordTransaction(studentId, {
      type: 'spend',
      reason,
      points: amount,
      balanceAfter: balance.points,
    });

    this.saveData();

    return {
      pointsSpent: amount,
      newBalance: balance.points,
    };
  }

  /**
   * Record transaction
   */
  recordTransaction(studentId, transaction) {
    if (!this.transactions.has(studentId)) {
      this.transactions.set(studentId, []);
    }

    const transactions = this.transactions.get(studentId);
    transactions.push({
      id: this.generateTransactionId(),
      studentId,
      timestamp: new Date().toISOString(),
      ...transaction,
    });

    // Keep only last 500 transactions
    if (transactions.length > 500) {
      this.transactions.set(studentId, transactions.slice(-500));
    }
  }

  /**
   * Get transaction history
   */
  getTransactions(studentId, limit = 50) {
    const transactions = this.transactions.get(studentId) || [];
    return transactions.slice(-limit).reverse();
  }

  /**
   * Calculate rank based on lifetime points
   */
  calculateRank(lifetimePoints) {
    if (lifetimePoints >= 50000) return 'Grand Master';
    if (lifetimePoints >= 25000) return 'Master';
    if (lifetimePoints >= 10000) return 'Expert';
    if (lifetimePoints >= 5000) return 'Advanced';
    if (lifetimePoints >= 2000) return 'Intermediate';
    if (lifetimePoints >= 500) return 'Apprentice';
    return 'Beginner';
  }

  /**
   * Calculate level based on lifetime points
   */
  calculateLevel(lifetimePoints) {
    return Math.floor(Math.sqrt(lifetimePoints / 100)) + 1;
  }

  /**
   * Get points needed for next level
   */
  getPointsForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    const pointsNeeded = Math.pow(nextLevel - 1, 2) * 100;
    return pointsNeeded;
  }

  /**
   * Generate transaction ID
   */
  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load data
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_points');
        if (data) {
          const parsed = JSON.parse(data);
          this.balances = new Map(Object.entries(parsed.balances || {}));
          this.transactions = new Map(Object.entries(parsed.transactions || {}));
        }
      }
    } catch (error) {
      console.error('Error loading points data:', error);
    }
  }

  /**
   * Save data
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          balances: Object.fromEntries(this.balances),
          transactions: Object.fromEntries(this.transactions),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_points', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving points data:', error);
    }
  }

  /**
   * Clear data
   */
  clearData() {
    this.balances.clear();
    this.transactions.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_points');
    }
  }
}

/**
 * RewardShop
 * Manages the reward shop and purchases
 */
export class RewardShop {
  constructor(pointsManager, storage = 'localStorage') {
    this.pointsManager = pointsManager;
    this.storage = storage;
    this.inventory = new Map();
    this.purchases = new Map();
    this.loadData();
  }

  /**
   * Get available items
   */
  getAvailableItems(filters = {}) {
    let items = [];

    // Collect all items
    Object.values(REWARD_CATALOG).forEach((category) => {
      items = items.concat(category);
    });

    // Apply filters
    if (filters.type) {
      items = items.filter((item) => item.type === filters.type);
    }

    if (filters.maxCost) {
      items = items.filter((item) => item.cost <= filters.maxCost);
    }

    if (filters.rarity) {
      items = items.filter((item) => item.rarity === filters.rarity);
    }

    return items;
  }

  /**
   * Purchase item
   */
  purchaseItem(studentId, itemId) {
    // Find item
    const item = this.findItem(itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    // Check if already owned (non-consumable)
    if (!item.consumable && this.hasItem(studentId, itemId)) {
      throw new Error('Item already owned');
    }

    // Check balance and spend points
    const result = this.pointsManager.spendPoints(studentId, item.cost, `Purchase: ${item.name}`);

    // Add to inventory
    this.addToInventory(studentId, item);

    // Record purchase
    this.recordPurchase(studentId, item);

    return {
      item,
      pointsSpent: item.cost,
      newBalance: result.newBalance,
    };
  }

  /**
   * Find item by ID
   */
  findItem(itemId) {
    for (const category of Object.values(REWARD_CATALOG)) {
      const item = category.find((i) => i.id === itemId);
      if (item) return item;
    }
    return null;
  }

  /**
   * Add item to inventory
   */
  addToInventory(studentId, item) {
    if (!this.inventory.has(studentId)) {
      this.inventory.set(studentId, []);
    }

    const inventory = this.inventory.get(studentId);

    if (item.consumable) {
      // Add quantity
      const existing = inventory.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        inventory.push({
          ...item,
          quantity: item.quantity || 1,
          acquiredAt: new Date().toISOString(),
        });
      }
    } else {
      // Add as owned
      inventory.push({
        ...item,
        acquiredAt: new Date().toISOString(),
        equipped: false,
      });
    }

    this.saveData();
  }

  /**
   * Use consumable item
   */
  useItem(studentId, itemId) {
    const inventory = this.inventory.get(studentId) || [];
    const item = inventory.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Item not in inventory');
    }

    if (!item.consumable) {
      throw new Error('Item is not consumable');
    }

    if (item.quantity <= 0) {
      throw new Error('Item out of stock');
    }

    item.quantity--;

    if (item.quantity === 0) {
      // Remove from inventory
      const index = inventory.indexOf(item);
      inventory.splice(index, 1);
    }

    this.saveData();

    return {
      item,
      remainingQuantity: item.quantity,
    };
  }

  /**
   * Equip item (for avatars, themes, etc.)
   */
  equipItem(studentId, itemId) {
    const inventory = this.inventory.get(studentId) || [];
    const item = inventory.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Item not in inventory');
    }

    // Unequip all items of same type
    inventory.forEach((i) => {
      if (i.type === item.type) {
        i.equipped = false;
      }
    });

    // Equip this item
    item.equipped = true;

    this.saveData();

    return item;
  }

  /**
   * Get student inventory
   */
  getInventory(studentId) {
    return this.inventory.get(studentId) || [];
  }

  /**
   * Check if student has item
   */
  hasItem(studentId, itemId) {
    const inventory = this.inventory.get(studentId) || [];
    return inventory.some((i) => i.id === itemId);
  }

  /**
   * Get equipped items
   */
  getEquippedItems(studentId) {
    const inventory = this.inventory.get(studentId) || [];
    return inventory.filter((i) => i.equipped);
  }

  /**
   * Record purchase
   */
  recordPurchase(studentId, item) {
    if (!this.purchases.has(studentId)) {
      this.purchases.set(studentId, []);
    }

    const purchases = this.purchases.get(studentId);
    purchases.push({
      itemId: item.id,
      itemName: item.name,
      cost: item.cost,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 purchases
    if (purchases.length > 100) {
      this.purchases.set(studentId, purchases.slice(-100));
    }
  }

  /**
   * Get purchase history
   */
  getPurchaseHistory(studentId, limit = 50) {
    const purchases = this.purchases.get(studentId) || [];
    return purchases.slice(-limit).reverse();
  }

  /**
   * Load data
   */
  loadData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem('learnai_rewards');
        if (data) {
          const parsed = JSON.parse(data);
          this.inventory = new Map(Object.entries(parsed.inventory || {}));
          this.purchases = new Map(Object.entries(parsed.purchases || {}));
        }
      }
    } catch (error) {
      console.error('Error loading reward data:', error);
    }
  }

  /**
   * Save data
   */
  saveData() {
    try {
      if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        const data = {
          inventory: Object.fromEntries(this.inventory),
          purchases: Object.fromEntries(this.purchases),
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('learnai_rewards', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving reward data:', error);
    }
  }

  /**
   * Clear data
   */
  clearData() {
    this.inventory.clear();
    this.purchases.clear();
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('learnai_rewards');
    }
  }
}

/**
 * Example Usage
 */

/*
// Initialize systems
const pointsManager = new PointsManager();
const rewardShop = new RewardShop(pointsManager);

// Award points for correct answer
const result = pointsManager.awardPoints('student123', 'questionCorrect', {
  difficulty: 7,
  doubleXP: false,
});

console.log('Points earned:', result.pointsEarned);
console.log('New balance:', result.newBalance);
console.log('Level:', result.level);

// Get balance
const balance = pointsManager.getBalance('student123');
console.log('Current points:', balance.points);
console.log('Lifetime points:', balance.lifetimePoints);
console.log('Rank:', balance.rank);

// Browse shop
const availableItems = rewardShop.getAvailableItems({ maxCost: 500 });
console.log('Affordable items:', availableItems.length);

// Purchase item
const purchase = rewardShop.purchaseItem('student123', 'robot');
console.log('Purchased:', purchase.item.name);
console.log('Remaining points:', purchase.newBalance);

// Get inventory
const inventory = rewardShop.getInventory('student123');
console.log('Inventory:', inventory);

// Equip item
rewardShop.equipItem('student123', 'robot');

// Get equipped items
const equipped = rewardShop.getEquippedItems('student123');
console.log('Equipped:', equipped);

// Use consumable
rewardShop.purchaseItem('student123', 'hint-pack');
const useResult = rewardShop.useItem('student123', 'hint-pack');
console.log('Remaining hints:', useResult.remainingQuantity);
*/

export { PointsManager, RewardShop, REWARD_CATALOG, POINTS_ACTIVITIES };
