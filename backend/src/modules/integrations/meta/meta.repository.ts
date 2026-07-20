import { User, IUser } from '../../users/user.model';

export class MetaRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  async updateMetaOAuthState(
    userId: string,
    data: {
      encryptedAccessToken: string;
      metaUserId?: string;
      tokenExpiresAt?: Date;
    }
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'meta.encryptedAccessToken': data.encryptedAccessToken,
          'meta.userId': data.metaUserId || '',
          'meta.connectedAt': new Date(),
          'meta.tokenExpiresAt': data.tokenExpiresAt,
          // If adAccountId is already present, remain connected; otherwise prompt account selection
        },
      },
      { new: true }
    );
  }

  async selectAdAccount(
    userId: string,
    adAccountId: string,
    adAccountName: string
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'meta.connected': true,
          'meta.adAccountId': adAccountId,
          'meta.adAccountName': adAccountName,
          'connectedAccounts.metaConnected': true,
        },
      },
      { new: true }
    );
  }

  async updateMetaLastSynced(userId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'meta.lastSyncedAt': new Date(),
        },
      },
      { new: true }
    );
  }

  async disconnectMeta(userId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'meta.connected': false,
          'connectedAccounts.metaConnected': false,
        },
      },
      { new: true }
    );
  }
}

export const metaRepository = new MetaRepository();
