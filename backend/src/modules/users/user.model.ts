import { Schema, model, Document } from 'mongoose';

export type SubscriptionPlan = 'starter' | 'growth' | 'agency';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface IMetaAdAccount {
  id: string;
  name: string;
  currency: string;
  accountStatus: number;
}

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  isOnboarded: boolean;
  onboardingStep?: number;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    selectedAt: Date;
    trialStartsAt?: Date;
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
  };
  connectedAccounts: {
    metaConnected: boolean;
    shopifyConnected: boolean;
  };
  meta?: {
    connected: boolean;
    encryptedAccessToken?: string;
    adAccountId?: string;
    adAccountName?: string;
    userId?: string;
    connectedAt?: Date;
    tokenExpiresAt?: Date;
    lastSyncedAt?: Date;
    adAccounts?: IMetaAdAccount[];
  };
  shopify?: {
    connected: boolean;
    encryptedAccessToken?: string;
    shopDomain?: string;
    shopName?: string;
    lastSyncedAt?: Date;
  };
  preferences: {
    theme: 'dark' | 'light';
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 1,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['starter', 'growth', 'agency'],
        default: 'starter',
      },
      status: {
        type: String,
        enum: ['trialing', 'active', 'past_due', 'canceled', 'expired'],
        default: 'trialing',
      },
      selectedAt: {
        type: Date,
        default: Date.now,
      },
      trialStartsAt: {
        type: Date,
        default: Date.now,
      },
      trialEndsAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days Trial
      },
      currentPeriodEnd: {
        type: Date,
        required: false,
      },
    },
    connectedAccounts: {
      metaConnected: {
        type: Boolean,
        default: false,
      },
      shopifyConnected: {
        type: Boolean,
        default: false,
      },
    },
    meta: {
      connected: {
        type: Boolean,
        default: false,
      },
      encryptedAccessToken: {
        type: String,
        default: '',
      },
      adAccountId: {
        type: String,
        default: '',
      },
      adAccountName: {
        type: String,
        default: '',
      },
      userId: {
        type: String,
        default: '',
      },
      connectedAt: {
        type: Date,
      },
      tokenExpiresAt: {
        type: Date,
      },
      lastSyncedAt: {
        type: Date,
      },
      adAccounts: [
        {
          id: String,
          name: String,
          currency: String,
          accountStatus: Number,
        },
      ],
    },
    shopify: {
      connected: {
        type: Boolean,
        default: false,
      },
      encryptedAccessToken: {
        type: String,
        default: '',
      },
      shopDomain: {
        type: String,
        default: '',
      },
      shopName: {
        type: String,
        default: '',
      },
      lastSyncedAt: {
        type: Date,
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
