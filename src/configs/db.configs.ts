import { Collection, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { UserType } from '~/models/schemas/User.schemas';
import RefreshToken from '~/models/schemas/RefreshToken.schemas';
import Follower from '~/models/schemas/Follower.schemas';
import VideoStatus from '~/models/schemas/VideoStatus.schemas';
import Tweet from '~/models/schemas/Tweet.schemas';
import Hashtag from '~/models/schemas/Hashtag';
import Bookmark from '~/models/schemas/Bookmark.schemas';
import Like from '~/models/schemas/Like.schemas';
import { TweetType } from '~/constants/enums';

dotenv.config();
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.ojj4u.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;

class Database {
  static instance: Database;
  client: MongoClient;

  constructor() {
    this.client = new MongoClient(url);
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect() {
    try {
      await this.client.db(`${process.env.DB_USERNAME}`).command({ ping: 1 });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ connecting to MongoDB::: ', error);
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log(':::Disconnected from MongoDB:::');
    } catch (error) {
      console.log(':::Error Disconnecting to MongoDB:::', error);
    }
  }

  getUserCollection(): Collection<UserType> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_USERS}`);
  }

  getRefreshTokenCollection(): Collection<RefreshToken> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_REFRESH_TOKENS}`);
  }

  getEmailVerifyTokenCollection(): Collection<RefreshToken> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_EMAIL_VERIFY_TOKENS}`);
  }

  getFollowersCollection(): Collection<Follower> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_FOLLOWERS}`);
  }

  getVideoStatusCollection(): Collection<VideoStatus> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_VIDEO_STATUS}`);
  }

  getTweetCollection(): Collection<Tweet> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_TWEETS}`);
  }

  getHashtagCollection(): Collection<Hashtag> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_HASH_TAGS}`);
  }

  getBookmarkCollection(): Collection<Bookmark> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_BOOKMARKS}`);
  }

  getLikeCollection(): Collection<Like> {
    return this.client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_LIKES}`);
  }

  getCollection(collectionName: string) {
    return this.client.db(`${process.env.DB_NAME}`).collection(collectionName);
  }

  async indexUserCollection() {
    const isIndexExists = await this.getUserCollection().indexExists(['email_1', 'username_1', 'email_1_password_1']);
    console.log('Is indexUserCollection exists:', isIndexExists);
    if (isIndexExists) return;
    await this.getUserCollection().createIndex({ email: 1 }, { unique: true });
    await this.getUserCollection().createIndex({ username: 1 }, { unique: true });
    await this.getUserCollection().createIndex({ email: 1, password: 1 });
  }

  async indexRefreshTokenCollection() {
    const isIndexExists = await this.getRefreshTokenCollection().indexExists(['token_1', 'exp_1']);
    console.log('Is indexRefreshTokenCollection exists:', isIndexExists);
    if (isIndexExists) return;
    await this.getRefreshTokenCollection().createIndex({ token: 1 });
    await this.getRefreshTokenCollection().createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
  }

  async indexVideoStatusCollection() {
    const isIndexExists = await this.getVideoStatusCollection().indexExists(['name_1']);
    console.log('Is indexVideoStatusCollection exists:', isIndexExists);
    if (isIndexExists) return;
    await this.getVideoStatusCollection().createIndex({ name: 1 });
  }

  async indexFollowersCollection() {
    const isIndexExists = await this.getFollowersCollection().indexExists(['userId_1_followeeId_1']);
    console.log('Is indexFollowersCollection exists:', isIndexExists);
    if (isIndexExists) return;
    await this.getFollowersCollection().createIndex({ userId: 1, followeeId: 1 });
  }

  async ensureIndexes() {
    try {
      console.log(":::Creating indexes:::");
      await this.indexUserCollection();
      await this.indexRefreshTokenCollection();
      await this.indexVideoStatusCollection();
      await this.indexFollowersCollection();
      console.log("✅ Indexes created successfully!");
    } catch (error) {
      console.error("❌ Error creating indexes:", error);
    }
  }

  async initialize() {
    try {
      await this.connect();
      await this.ensureIndexes();
    } catch (error) {
      console.error("❌ Error initializing database:", error);
    }
  }

  getTweetAggregationStagesById(id: string) {
    return [
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'hash_tags',
          localField: 'hashtags',
          foreignField: '_id',
          as: 'hashtags'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentions',
          foreignField: '_id',
          as: 'mentions'
        }
      },
      {
        $addFields: {
          mentions: {
            $map: {
              input: '$mentions',
              as: 'mention',
              in: {
                _id: '$$mention._id',
                name: '$$mention.name',
                username: '$$mention.username',
                email: '$$mention.email'
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'bookmarks'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'parent_tweet_id',
          as: 'tweet_children'
        }
      },
      {
        $addFields: {
          bookmarks: { $size: '$bookmarks' },
          likes: { $size: '$likes' },
          retweet_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 1] }
              }
            }
          },
          quote_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 3] }
              }
            }
          },
          comment_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 2] }
              }
            }
          },
          // views: {
          //   $add: ['$user_views', '$guest_views']
          // }
        }
      },
      { $project: { tweet_children: 0 } }
    ]
  }

  getTweetChildrenAggregationStagesById({ id, limit, page, type }: { id: string, limit: number, page: number, type: TweetType }) {
    return [
      {
        $match: {
          parent_tweet_id: new ObjectId(id),
          type: type
        }
      },
      {
        $lookup: {
          from: 'hash_tags',
          localField: 'hashtags',
          foreignField: '_id',
          as: 'hashtags'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentions',
          foreignField: '_id',
          as: 'mentions'
        }
      },
      {
        $addFields: {
          mentions: {
            $map: {
              input: '$mentions',
              as: 'mention',
              in: {
                _id: '$$mention._id',
                name: '$$mention.name',
                username: '$$mention.username',
                email: '$$mention.email'
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'bookmarks'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'parent_tweet_id',
          as: 'tweet_children'
        }
      },
      {
        $addFields: {
          bookmarks: { $size: '$bookmarks' },
          likes: { $size: '$likes' },
          retweet_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 1] }
              }
            }
          },
          quote_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 3] }
              }
            }
          },
          comment_counts: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: { $eq: ['$$item.type', 2] }
              }
            }
          },
        }
      },
      { $project: { tweet_children: 0 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]
  }
}

const db = Database.getInstance();
export default db

