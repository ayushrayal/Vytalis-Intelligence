"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessFeature = void 0;
const STARTER_FEATURES = [
    'dashboard',
    'connect_meta',
    'connect_shopify',
    'total_spend',
    'total_revenue',
    'purchases',
    'basic_kpi_cards',
];
const GROWTH_FEATURES = [
    ...STARTER_FEATURES,
    'meta_overview',
    'shopify_overview',
    'roas',
    'ctr',
    'campaign_table',
    'last_30_days_data',
    'age_breakdown',
    'gender_breakdown',
    'placement_breakdown',
    'device_breakdown',
];
const AGENCY_FEATURES = [
    ...GROWTH_FEATURES,
    'creative_analytics',
    'hook_rate',
    'hold_rate',
    'video_retention',
    'roas_analysis',
    'advanced_reports',
    'export_csv',
    'ai_insights',
    'attribution',
    'unlimited_history',
    'priority_support',
];
const FEATURE_MATRIX = {
    starter: new Set(STARTER_FEATURES),
    growth: new Set(GROWTH_FEATURES),
    agency: new Set(AGENCY_FEATURES),
};
const canAccessFeature = (plan, feature) => {
    const allowedFeatures = FEATURE_MATRIX[plan];
    return allowedFeatures ? allowedFeatures.has(feature) : false;
};
exports.canAccessFeature = canAccessFeature;
