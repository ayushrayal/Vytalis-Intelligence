import { User, IUser } from './user.model';

export class UserRepository {
  async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId).exec();
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId }).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async updateById(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    }).exec();
  }

  async updateLastActive(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { lastActiveAt: new Date() },
    }).exec();
  }
}

export const userRepository = new UserRepository();
