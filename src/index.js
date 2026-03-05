"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var apollo_server_1 = require("apollo-server");
var client_1 = require("./generated/prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var connectionString = "".concat(process.env.DATABASE_URL);
var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
var prisma = new client_1.PrismaClient({ adapter: adapter });
var typeDefs = "\n  type User {\n    id: Int!\n    email: String!\n    name: String\n    posts: [Post!]!\n  }\n\n  type Post {\n    id: Int!\n    title: String!\n    content: String\n    published: Boolean!\n    author: User!\n    comments: [Comment!]!\n  }\n\n  type Comment {\n    id: Int!\n    content: String!\n    post: Post!\n  }\n\n  type Query {\n    feed: [Post!]!\n    post(id: Int!): Post\n  }\n";
var resolvers = {
    Query: {
        feed: function () { return prisma.post.findMany({ where: { published: true } }); },
        post: function (_, args) {
            return prisma.post.findUnique({ where: { id: args.id } });
        },
    },
    Post: {
        author: function (parent) {
            return prisma.user.findUnique({ where: { id: parent.authorId } });
        },
        comments: function (parent) {
            return prisma.comment.findMany({ where: { postId: parent.id } });
        },
    },
};
new apollo_server_1.ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: function () { return ({ prisma: prisma }); },
})
    .listen({ port: 10000 })
    .then(function (_a) {
    var url = _a.url;
    console.log("\uD83D\uDE80 Apollo server ready at ".concat(url));
});
