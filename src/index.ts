import "dotenv/config";
import { ApolloServer } from "apollo-server";
import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });



const typeDefs = `
  type User {
    id: Int!
    email: String!
    name: String
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: Int!
    content: String!
    post: Post!
  }

  type Query {
    feed: [Post!]!
    post(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    feed: () => prisma.post.findMany({ where: { published: true } }),
    post: (_: unknown, args: { id: number }) =>
      prisma.post.findUnique({ where: { id: args.id } }),
  },
  Post: {
    author: (parent: { authorId: number }) =>
      prisma.user.findUnique({ where: { id: parent.authorId } }),
    comments: (parent: { id: number }) =>
      prisma.comment.findMany({ where: { postId: parent.id } }),
  },
};

new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
})
  .listen({ port: 10000 })
  .then(({ url }) => {
    console.log(`🚀 Apollo server ready at ${url}`);
  });