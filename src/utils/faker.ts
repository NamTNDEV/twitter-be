import { faker } from '@faker-js/faker'
import { ObjectId, WithId } from 'mongodb'
import db from '~/configs/db.configs'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { TweetReqBody } from '~/models/requests/tweet.requests'
import { RegisterReqBody } from '~/models/requests/user.requests'
import { User } from '~/models/schemas/User.schemas'
import { hashPassword } from './crypto'
import Follower from '~/models/schemas/Follower.schemas'
import Hashtag from '~/models/schemas/Hashtag'
import Tweet from '~/models/schemas/Tweet.schemas'

/**
 * Yêu cầu: Mọi người phải cài đặt `@faker-js/faker` vào project
 * Cài đặt: `npm i @faker-js/faker`
 */

// Mật khẩu cho các fake user
const PASSWORD = 'cloneTwitter6868.COM'
// ID của tài khoản của mình, dùng để follow người khác
const MYID = new ObjectId('67b920588b7492c041bc31f9')

// Số lượng user được tạo, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 500

const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirmPassword: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Public,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: ['NodeJS', 'MongoDB', 'ExpressJS', 'Swagger', 'Docker', 'Socket.io'],
    medias: [
      {
        type: MediaType.Image,
        url: faker.image.url()
      }
    ],
    mentions: [],
    parent_tweet_id: null
  }
  return tweet
}
const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Creating users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await db.getUserCollection().insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...')
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      db.getFollowersCollection().insertOne(
        new Follower({
          userId: user_id,
          followeeId: new ObjectId(followed_user_id)
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const checkAndCreateHashtags = async (hashtags: string[]) => {
  const hashtagDocuemts = await Promise.all(
    hashtags.map((hashtag) => {
      // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
      return db.getHashtagCollection().findOneAndUpdate(
        { name: hashtag },
        {
          $setOnInsert: new Hashtag({ name: hashtag })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
    })
  )
  return hashtagDocuemts.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
}

const insertTweet = async (user_id: ObjectId, body: TweetReqBody) => {
  const hashtags = await checkAndCreateHashtags(body.hashtags || [])
  const result = await db.getTweetCollection().insertOne(
    new Tweet({
      audience: body.audience,
      content: body.content,
      hashtags,
      mentions: body.mentions?.map((mention) => new ObjectId(mention)) || [],
      medias: body.medias,
      parent_tweet_id: body.parent_tweet_id ? new ObjectId(body.parent_tweet_id) : null,
      type: body.type,
      user_id: new ObjectId(user_id)
    })
  )
  return result
}

const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log('Creating tweets...')
  console.log(`Counting...`)
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([insertTweet(id, createRandomTweet()), insertTweet(id, createRandomTweet())])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids).catch((err) => {
    console.error('Error when following users')
    console.log(err)
  })
  insertMultipleTweets(ids).catch((err) => {
    console.error('Error when creating tweets')
    console.log(err)
  })
})
