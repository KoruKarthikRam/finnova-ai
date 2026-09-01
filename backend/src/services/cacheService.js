const NodeCache = require("node-cache");

// Default TTL: 5 minutes (300 seconds), check for expired keys every 60 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

/**
 * Get value from cache
 * @param {string} key 
 */
const get = (key) => {
  return cache.get(key);
};

/**
 * Set value in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} [ttl] Optional custom TTL in seconds
 */
const set = (key, value, ttl) => {
  if (ttl !== undefined) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
};

/**
 * Delete a specific key
 * @param {string} key 
 */
const del = (key) => {
  return cache.del(key);
};

/**
 * Invalidate all cached data related to a specific user's dashboard
 * @param {string|number} userId 
 */
const invalidateUserDashboardCache = (userId) => {
  if (!userId) return;
  const prefix = `dashboard:${userId}`;
  const keys = cache.keys();
  const keysToDelete = keys.filter((key) => key.startsWith(prefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    console.log(`[Cache] Invalidated ${keysToDelete.length} dashboard cache keys for user ${userId}`);
  }
};

/**
 * Flush all cache entries
 */
const flushAll = () => {
  cache.flushAll();
};

module.exports = {
  get,
  set,
  del,
  invalidateUserDashboardCache,
  flushAll,
  cache,
};
