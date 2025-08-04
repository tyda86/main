import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  watchlist: {
    animeId: number;
    title: string;
    image: string;
    currentEpisode: number;
    totalEpisodes?: number;
    status: 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch';
    score?: number;
    addedAt: Date;
  }[];
  notifications: {
    episodeAlerts: boolean;
    newsAlerts: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    image: String,
    emailVerified: Date,
    watchlist: [
      {
        animeId: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: String,
        currentEpisode: {
          type: Number,
          default: 0,
        },
        totalEpisodes: Number,
        status: {
          type: String,
          enum: ['watching', 'completed', 'on-hold', 'dropped', 'plan-to-watch'],
          default: 'plan-to-watch',
        },
        score: {
          type: Number,
          min: 1,
          max: 10,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notifications: {
      episodeAlerts: {
        type: Boolean,
        default: true,
      },
      newsAlerts: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);