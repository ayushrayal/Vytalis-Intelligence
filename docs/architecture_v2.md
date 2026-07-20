# Vytalis Intelligence - V2 Background Synchronization Architecture

This document details the blueprint and technical specification for the Phase 5.6 / V2 Background Synchronization system, designed to pre-warm Redis caches and refresh analytics data asynchronously for connected user accounts.

---

## 1. Overview & Objectives

In V1, analytics metrics are fetched on-demand when users open the dashboard and cached in Redis for 900 seconds (15 minutes).
In V2, a dedicated background worker system will periodically execute background sync jobs to pre-warm Redis caches before user requests arrive, ensuring instant load times (<50ms) across all dashboard modules.

---

## 2. Redis Caching Specification

### Cache Key Namespaces

1. **Shopify Store Metrics**:
   - **Key Format**: `shopify:metrics:<userId>`
   - **TTL**: `900` seconds (15 Minutes)
   - **Payload**: Orders count, total revenue, AOV, returning customer %, product performance table, revenue trend.

2. **Meta Marketing Insights**:
   - **Key Format**: `meta:insights:<userId>`
   - **TTL**: `900` seconds (15 Minutes)
   - **Payload**: Total spend, reach, impressions, clicks, CTR, purchases, revenue, ROAS, frequency, spend trend, placement breakdown, age breakdown.

---

## 3. Background Sync Architecture (`node-cron` & Workers)

### Architectural Flow Diagram

```
+-------------------------------------------------------+
|              node-cron Scheduler                      |
|          Triggered Every 15 Minutes                   |
+--------------------------+----------------------------+
                           |
                           v
+--------------------------+----------------------------+
|             Active User Account Fetcher               |
|  Select users where lastActiveAt > Date.now() - 7d    |
+--------------------------+----------------------------+
                           |
           +---------------+---------------+
           |                               |
           v                               v
+----------+------------+        +---------+------------+
| Shopify Sync Worker   |        | Meta Sync Worker     |
| - Query GraphQL API   |        | - Query Graph API    |
| - Store in Redis      |        | - Store in Redis     |
+-----------------------+        +----------------------+
```

### Background Worker Implementation Specs

1. **Cron Schedule**: `*/15 * * * *` (Every 15 minutes).
2. **Batch Processing**:
   - Process users in batches of 20 to avoid exceeding Shopify GraphQL rate limits (bucket size 1000, leak rate 50/sec) and Meta Marketing API call limits.
3. **Cache Invalidation & Manual Refresh**:
   - When a user clicks **"Sync Now"** in the sticky header, `clearShopifyMetricsCache(userId)` and `storeMetaInsightsCache(userId)` are triggered synchronously, forcing an immediate API refetch.

---

## 4. Production Security & Resilience

- **Rate Limit Compliance**: Exponential backoff with jitter on HTTP 429 responses.
- **Fail-Safe Fallback**: If background sync fails due to expired OAuth tokens, set connection status to `requiresReconnect` or `isExpired` without invalidating existing cached analytics data prematurely.
