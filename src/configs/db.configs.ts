import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { UserType } from '~/models/schemas/User.schemas';
import RefreshToken from '~/models/schemas/RefreshToken.schemas';
import Follower from '~/models/schemas/Follower.schemas';

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
      console.log(':::Connected to MongoDB:::');
    } catch (error) {
      console.log(':::Error connecting to MongoDB:::', error);
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

  getCollection(collectionName: string) {
    return this.client.db(`${process.env.DB_NAME}`).collection(collectionName);
  }
}

const db = Database.getInstance();
export default db

