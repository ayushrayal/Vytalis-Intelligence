"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaRepository = exports.MetaRepository = void 0;
const user_model_1 = require("../../users/user.model");
class MetaRepository {
    async findUserById(userId) {
        return user_model_1.User.findById(userId);
    }
    async updateMetaOAuthState(userId, data) {
        return user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                'meta.encryptedAccessToken': data.encryptedAccessToken,
                'meta.userId': data.metaUserId || '',
                'meta.connectedAt': new Date(),
                'meta.tokenExpiresAt': data.tokenExpiresAt,
                // If adAccountId is already present, remain connected; otherwise prompt account selection
            },
        }, { new: true });
    }
    async selectAdAccount(userId, adAccountId, adAccountName) {
        return user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                'meta.connected': true,
                'meta.adAccountId': adAccountId,
                'meta.adAccountName': adAccountName,
                'connectedAccounts.metaConnected': true,
            },
        }, { new: true });
    }
    async updateMetaLastSynced(userId) {
        return user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                'meta.lastSyncedAt': new Date(),
            },
        }, { new: true });
    }
    async disconnectMeta(userId) {
        return user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                'meta.connected': false,
                'connectedAccounts.metaConnected': false,
            },
        }, { new: true });
    }
}
exports.MetaRepository = MetaRepository;
exports.metaRepository = new MetaRepository();
