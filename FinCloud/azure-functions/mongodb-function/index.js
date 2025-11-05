const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// MongoDB Connection URI from environment variable
const uri = process.env.MONGODB_URI || "mongodb+srv://fincloud:EWqxoxhEDblokoPd@cluster0.1fl5zhc.mongodb.net/?appName=Cluster0";

let cachedDb = null;
let cachedClient = null;

/**
 * Helper to sanitize collection names
 */
function sanitizeCollectionName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Collection name must be a non-empty string');
  }
  // Remove any characters that could be used for injection
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Validate ObjectId
 */
function isValidObjectId(id) {
  if (!id) return false;
  try {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
  } catch {
    return false;
  }
}

/**
 * Get database connection (with connection pooling)
 */
async function connectToDatabase(context = null) {
  try {
    // Check if client is still connected
    if (cachedClient && cachedDb) {
      try {
        await cachedClient.db('admin').command({ ping: 1 });
        return cachedDb;
      } catch {
        // Connection lost, reset cache
        cachedClient = null;
        cachedDb = null;
      }
    }

    // Create new connection
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    });

    await cachedClient.connect();
    cachedDb = cachedClient.db(process.env.MONGODB_DATABASE || 'fincloud');
    
    if (context) {
      context.log('MongoDB connected successfully');
    }
    return cachedDb;
  } catch (error) {
    if (context) {
      context.log.error('MongoDB connection error:', error);
    }
    cachedClient = null;
    cachedDb = null;
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
  let collection = req.query.collection || req.body?.collection;
  
  if (!collection) {
    context.res = {
      status: 400,
      body: { 
        error: 'Collection name is required',
        message: 'Collection name must be provided as query parameter or in body',
        example: '?collection=transactions'
      }
    };
    return;
  }

  try {
    // Sanitize collection name
    collection = sanitizeCollectionName(collection);
    
    const db = await connectToDatabase(context);
    const coll = db.collection(collection);

    switch (method) {
      case 'POST': {
        // CREATE - Insert document(s)
        const data = req.body.data || req.body;
        
        // Remove collection from body if present
        if (data.collection) {
          delete data.collection;
        }
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          context.res = {
            status: 400,
            body: { 
              error: 'Data is required',
              message: 'Data must be provided in body.data or body',
              example: { data: { name: 'John', email: 'john@example.com' } }
            }
          };
          return;
        }

        let result;
        let insertedData;

        if (Array.isArray(data)) {
          // Insert multiple documents
          if (data.length > 100) {
            context.res = {
              status: 400,
              body: { error: 'Too many documents', message: 'Maximum 100 documents per request' }
            };
            return;
          }
          
          result = await coll.insertMany(data, { ordered: false });
          insertedData = await coll.find({ _id: { $in: Object.values(result.insertedIds) } }).toArray();
        } else {
          // Insert single document
          result = await coll.insertOne(data);
          insertedData = await coll.findOne({ _id: result.insertedId });
        }

        context.log(`Created document(s) in ${collection}:`, result);

        context.res = {
          status: 201,
          body: {
            success: true,
            message: Array.isArray(data) ? 'Documents created successfully' : 'Document created successfully',
            insertedId: result.insertedId,
            insertedIds: result.insertedIds,
            insertedCount: result.insertedCount || 1,
            data: Array.isArray(data) ? insertedData : insertedData
          }
        };
        break;
      }

      case 'GET': {
        // READ - Find document(s)
        const id = req.query.id;
        let filter = {};
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000); // Max 1000
        const skip = Math.max(parseInt(req.query.skip) || 0, 0);

        if (id) {
          // Find by ID
          if (!isValidObjectId(id)) {
            context.res = {
              status: 400,
              body: { 
                error: 'Invalid ID format',
                message: 'ID must be a valid MongoDB ObjectId'
              }
            };
            return;
          }

          const document = await coll.findOne({ _id: new ObjectId(id) });
          
          if (!document) {
            context.res = {
              status: 404,
              body: { 
                error: 'Document not found',
                message: `No document found with id: ${id}`
              }
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
          try {
            if (req.query.filter) {
              filter = typeof req.query.filter === 'string' 
                ? JSON.parse(req.query.filter) 
                : req.query.filter;
            }
            
            // Support query parameters as filters
            Object.keys(req.query).forEach(key => {
              if (!['collection', 'limit', 'skip', 'filter', 'sort'].includes(key)) {
                filter[key] = req.query[key];
              }
            });

            // Build query with sort
            let query = coll.find(filter);
            
            if (req.query.sort) {
              const sortObj = typeof req.query.sort === 'string'
                ? JSON.parse(req.query.sort)
                : req.query.sort;
              query = query.sort(sortObj);
            } else {
              query = query.sort({ _id: -1 }); // Default sort by _id descending
            }

            const documents = await query
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
                limit: limit,
                hasMore: (skip + limit) < total
              }
            };
          } catch (parseError) {
            context.res = {
              status: 400,
              body: {
                error: 'Invalid filter format',
                message: 'Filter must be valid JSON',
                details: parseError.message
              }
            };
            return;
          }
        }
        break;
      }

      case 'PUT': {
        // UPDATE - Update document
        const id = req.query.id || req.body.id;
        let updateData = req.body.data || req.body;

        // Remove id and collection from update data
        if (updateData.id) delete updateData.id;
        if (updateData.collection) delete updateData.collection;

        if (!id) {
          context.res = {
            status: 400,
            body: { 
              error: 'ID is required',
              message: 'ID must be provided as query parameter or in body'
            }
          };
          return;
        }

        if (!updateData || Object.keys(updateData).length === 0) {
          context.res = {
            status: 400,
            body: { 
              error: 'Update data is required',
              message: 'At least one field must be provided for update'
            }
          };
          return;
        }

        if (!isValidObjectId(id)) {
          context.res = {
            status: 400,
            body: { 
              error: 'Invalid ID format',
              message: 'ID must be a valid MongoDB ObjectId'
            }
          };
          return;
        }

        // Check if document exists
        const existingDoc = await coll.findOne({ _id: new ObjectId(id) });
        if (!existingDoc) {
          context.res = {
            status: 404,
            body: { 
              error: 'Document not found',
              message: `No document found with id: ${id}`
            }
          };
          return;
        }

        // Update with $set to preserve other fields
        const result = await coll.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: updateData,
            $currentDate: { updatedAt: true }
          }
        );

        // Get updated document
        const updatedDoc = await coll.findOne({ _id: new ObjectId(id) });

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Document updated successfully',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            data: updatedDoc
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
            body: { 
              error: 'ID is required',
              message: 'ID must be provided as query parameter or in body'
            }
          };
          return;
        }

        if (!isValidObjectId(id)) {
          context.res = {
            status: 400,
            body: { 
              error: 'Invalid ID format',
              message: 'ID must be a valid MongoDB ObjectId'
            }
          };
          return;
        }

        // Get document before deletion
        const docToDelete = await coll.findOne({ _id: new ObjectId(id) });
        
        if (!docToDelete) {
          context.res = {
            status: 404,
            body: { 
              error: 'Document not found',
              message: `No document found with id: ${id}`
            }
          };
          return;
        }

        const result = await coll.deleteOne({ _id: new ObjectId(id) });

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Document deleted successfully',
            deletedCount: result.deletedCount,
            deletedDocument: docToDelete
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
    
    // Handle specific MongoDB errors
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorDetails = error.message;

    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        // Duplicate key error
        statusCode = 409;
        errorMessage = 'Duplicate key error';
        errorDetails = 'A document with this value already exists';
      } else if (error.code === 11001) {
        statusCode = 400;
        errorMessage = 'Invalid index';
      }
    } else if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      statusCode = 503;
      errorMessage = 'Database connection error';
      errorDetails = 'Unable to connect to MongoDB. Please try again later.';
    } else if (error.name === 'BSONError' || error.message.includes('ObjectId')) {
      statusCode = 400;
      errorMessage = 'Invalid ObjectId format';
      errorDetails = 'The provided ID is not a valid MongoDB ObjectId';
    } else if (error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Invalid JSON format';
      errorDetails = error.message;
    }
    
    context.res = {
      status: statusCode,
      body: {
        error: errorMessage,
        message: errorDetails,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    };
  }
};
