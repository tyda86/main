import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  category: 'anime' | 'manga' | 'industry' | 'review' | 'general';
  tags: string[];
  publishedAt: Date;
  author?: string;
  featured: boolean;
  spoilerWarning: boolean;
  relatedAnimeIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    imageUrl: String,
    sourceUrl: {
      type: String,
      required: true,
    },
    sourceName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['anime', 'manga', 'industry', 'review', 'general'],
      default: 'general',
    },
    tags: [String],
    publishedAt: {
      type: Date,
      required: true,
    },
    author: String,
    featured: {
      type: Boolean,
      default: false,
    },
    spoilerWarning: {
      type: Boolean,
      default: false,
    },
    relatedAnimeIds: [Number],
  },
  {
    timestamps: true,
  }
);

NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });
NewsSchema.index({ featured: 1, publishedAt: -1 });

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema);