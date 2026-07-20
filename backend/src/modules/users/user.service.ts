import { userRepository } from './user.repository';
import { IUser, SubscriptionPlan } from './user.model';
import { NotFoundError } from '../../shared/errors/app-error';

export class UserService {
  async getUserById(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async completeOnboarding(userId: string, plan: SubscriptionPlan): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const now = new Date();
    const isStarter = plan === 'starter';

    const subscriptionData = isStarter
      ? {
          plan,
          status: 'trialing' as const,
          selectedAt: now,
          trialStartsAt: now,
          trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: undefined,
        }
      : {
          plan,
          status: 'active' as const,
          selectedAt: now,
          trialStartsAt: undefined,
          trialEndsAt: undefined,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        };

    const updatedUser = await userRepository.updateById(userId, {
      isOnboarded: true,
      onboardingStep: 4,
      subscription: subscriptionData,
      lastActiveAt: now,
    });

    if (!updatedUser) {
      throw new NotFoundError('User update failed');
    }

    return updatedUser;
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<IUser['preferences']>
  ): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.updateById(userId, {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
      lastActiveAt: new Date(),
    });

    if (!updatedUser) {
      throw new NotFoundError('User update failed');
    }

    return updatedUser;
  }
}

export const userService = new UserService();
