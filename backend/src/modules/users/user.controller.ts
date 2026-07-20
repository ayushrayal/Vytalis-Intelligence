import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler } from '../../shared/utils/async-handler';
import { UnauthorizedError } from '../../shared/errors/app-error';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const user = await userService.getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
        lastLoginAt: user.lastLoginAt,
        lastActiveAt: user.lastActiveAt,
        subscription: user.subscription,
        connectedAccounts: user.connectedAccounts,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { plan } = req.body;
  const validPlans = ['starter', 'growth', 'agency'];
  const chosenPlan = validPlans.includes(plan) ? plan : 'starter';

  const user = await userService.completeOnboarding(req.user.userId, chosenPlan);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});
