"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const apollo_server_1 = require("apollo-server");
const client_1 = require("./generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
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
        post: (_, args) => prisma.post.findUnique({ where: { id: args.id } }),
    },
    Post: {
        author: (parent) => prisma.user.findUnique({ where: { id: parent.authorId } }),
        comments: (parent) => prisma.comment.findMany({ where: { postId: parent.id } }),
    },
};
new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ prisma }),
})
    .listen({ port: 10000 })
    .then(({ url }) => {
    console.log(`🚀 Apollo server ready at ${url}`);
});
