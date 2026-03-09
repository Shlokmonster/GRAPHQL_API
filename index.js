import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import connectDB from './src/db.js';
import typeDefs from './src/schema/typeDefs.js';
import resolvers from './src/resolvers/resolvers.js';

const PORT = parseInt(process.env.PORT) || 4000;

async function startServer() {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create Apollo Server
    const server = new ApolloServer({ typeDefs, resolvers });

    // 3. Start standalone server (Apollo v5 built-in HTTP server)
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT },
    });

    console.log(`🚀  GraphQL API ready at: ${url}`);
}

startServer().catch((err) => {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
});
