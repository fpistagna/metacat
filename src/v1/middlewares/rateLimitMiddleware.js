/**
 * @fileoverview Rate limiting middleware for authentication endpoints.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const { rateLimit } = require('express-rate-limit')

const positiveIntegerFromEnv = (name, fallback) => {
  const value = Number(process.env[name])
  return Number.isSafeInteger(value) && value > 0 ? value : fallback
}

const loginRateLimiter = rateLimit({
  windowMs: positiveIntegerFromEnv('LOGIN_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  limit: positiveIntegerFromEnv('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', 5),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  identifier: 'login-failed-attempts',
  message: {
    type: 'RateLimitError',
    errorCode: 60,
    message: 'Too many failed login attempts. Please try again later.'
  }
})

module.exports = { loginRateLimiter }
