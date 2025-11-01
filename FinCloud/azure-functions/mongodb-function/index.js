const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// MongoDB Connection URI from environment variable
const uri = process.env.MONGODB_URI || "mongodb+srv://fincloud:EWqxoxhEDblokoPd@cluster0.1fl5zhc.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let cachedDb = null;

/**
 * Get database connection (with connection pooling)
 */
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    await client.connect();
    cachedDb = client.db(process.env.MONGODB_DATABASE || 'fincloud');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Azure Function HTTP Trigger - MongoDB CRUD Handler
 * Handles CREATE events and CRUD operations for MongoDB
 */
module.exports = async function (context, req) {
  context.log('MongoDB Function HTTP trigger processed a request.');

  const method = req.method;
  const collection = req.query.collection || req.body?.collection;
  
  if (!collection) {
    context.res = {
      status: 400,
      body: { error: 'Collection name is required (query param or body)' }
    };
    return;
  }

  try {
    const db = await connectToDatabase();
    const coll = db.collection(collection);

    switch (method) {
      case 'POST': {
        // CREATE - Insert document(s)
        const data = req.body.data;
        if (!data) {
          context.res = {
            status: 400,
            body: { error: 'Data is required for POST request' }
          };
          return;
        }

        const result = Array.isArray(data)
          ? await coll.insertMany(data)
          : await coll.insertOne(data);

        context.log(`Created document(s) in ${collection}:`, result);

        context.res = {
          status: 201,
          body: {
            success: true,
            message: 'Document(s) created successfully',
            insertedId: result.insertedId,
            insertedIds: result.insertedIds,
            insertedCount: result.insertedCount || 1
          }
        };
        break;
      }

      case 'GET': {
        // READ - Find document(s)
        const id = req.query.id;
        const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
        const limit = parseInt(req.query.limit) || 100;
        const skip = parseInt(req.query.skip) || 0;

        if (id) {
          // Find by ID
          const document = await coll.findOne({ _id: new ObjectId(id) });
          
          if (!document) {
            context.res = {
              status: 404,
              body: { error: 'Document not found' }
            };
            return;
          }

          context.res = {
            status: 200,
            body: {
              success: true,
              data: document
            }
          };
        } else {
          // Find multiple with filter
          const documents = await coll.find(filter)
            .skip(skip)
            .limit(limit)
            .toArray();

          const total = await coll.countDocuments(filter);

          context.res = {
            status: 200,
            body: {
              success: true,
              data: documents,
              count: documents.length,
              total: total,
              skip: skip,
              limit: limit
            }
          };
        }
        break;
      }

      case 'PUT': {
        // UPDATE - Update document
        const id = req.query.id || req.body.id;
        const updateData = req.body.data;

        if (!id || !updateData) {
          context.res = {
            status: 400,
            body: { error: 'ID and data are required for PUT request' }
          };
          return;
        }

        const result = await coll.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          context.res = {
            status: 404,
            body: { error: 'Document not found' }
          };
          return;
        }

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Document updated successfully',
            modifiedCount: result.modifiedCount
          }
        };
        break;
      }

      case 'DELETE': {
        // DELETE - Delete document
        const id = req.query.id || req.body.id;

        if (!id) {
          context.res = {
            status: 400,
            body: { error: 'ID is required for DELETE request' }
          };
          return;
        }

        const result = await coll.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          context.res = {
            status: 404,
            body: { error: 'Document not found' }
          };
          return;
        }

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Document deleted successfully',
            deletedCount: result.deletedCount
          }
        };
        break;
      }

      default:
        context.res = {
          status: 405,
          body: { error: 'Method not allowed' }
        };
    }
  } catch (error) {
    context.log.error('MongoDB operation error:', error);
    
    context.res = {
      status: 500,
      body: {
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};
