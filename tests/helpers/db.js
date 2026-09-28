import mongoose from "mongoose";

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/shipnow_test";

export const connectTestDB = async () => {
    await mongoose.connect(TEST_MONGODB_URI);
};

export const clearTestDB = async () => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.deleteMany({});
    }
};

export const disconnectTestDB = async () => {
    await mongoose.disconnect();
};
