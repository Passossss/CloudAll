const sql = require('mssql');

// Helper to sanitize SQL identifiers
function sanitizeIdentifier(identifier) {
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

// Azure SQL Database configuration
const config = {
  server: process.env.AZURE_SQL_SERVER || 'fincloud.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'fincloud',
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true, // Use encryption for Azure
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

/**
 * Get SQL connection pool (with connection pooling)
 */
async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('Azure SQL connection error:', error);
    throw error;
  }
}

/**
 * Azure Function HTTP Trigger - Azure SQL CRUD Handler
 * Handles CREATE events and CRUD operations for Azure SQL
 */
module.exports = async function (context, req) {
  context.log('Azure SQL Function HTTP trigger processed a request.');

  const method = req.method;
  const table = req.query.table || req.body?.table;
  
  if (!table) {
    context.res = {
      status: 400,
      body: { error: 'Table name is required (query param or body)' }
    };
    return;
  }

  try {
    const poolConnection = await getPool();

    switch (method) {
      case 'POST': {
        // CREATE - Insert record(s)
        const data = req.body.data;
        if (!data) {
          context.res = {
            status: 400,
            body: { error: 'Data is required for POST request' }
          };
          return;
        }

        // Sanitize table name to prevent SQL injection
        const safeTable = sanitizeIdentifier(table);
        
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `@param${i}`).join(', ');

        const query = `INSERT INTO [${safeTable}] (${columns.map(c => `[${c}]`).join(', ')}) 
                       OUTPUT INSERTED.* 
                       VALUES (${placeholders})`;

        const request = poolConnection.request();
        values.forEach((value, i) => {
          // Auto-detect type
          const sqlType = typeof value === 'number' ? sql.Decimal(18, 2) : 
                         typeof value === 'boolean' ? sql.Bit : 
                         value instanceof Date ? sql.DateTime2 : 
                         sql.NVarChar(sql.MAX);
          request.input(`param${i}`, sqlType, value);
        });

        const result = await request.query(query);

        context.log(`Created record in ${table}:`, result);

        context.res = {
          status: 201,
          body: {
            success: true,
            message: 'Record created successfully',
            data: result.recordset[0],
            rowsAffected: result.rowsAffected[0]
          }
        };
        break;
      }

      case 'GET': {
        // READ - Select record(s)
        const id = req.query.id;
        const where = req.query.where;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        // Sanitize table name
        const safeTable = sanitizeIdentifier(table);
        
        let query;
        const request = poolConnection.request();
        
        if (id) {
          // Find by ID
          query = `SELECT * FROM [${safeTable}] WHERE id = @id`;
          request.input('id', sql.VarChar, id);

          const result = await request.query(query);
          
          if (result.recordset.length === 0) {
            context.res = {
              status: 404,
              body: { error: 'Record not found' }
            };
            return;
          }

          context.res = {
            status: 200,
            body: {
              success: true,
              data: result.recordset[0]
            }
          };
        } else {
          // Find multiple with optional WHERE clause
          // Note: WHERE clause should be parameterized for security
          const whereClause = where ? `WHERE ${where}` : '';
          query = `SELECT * FROM [${safeTable}] ${whereClause} 
                   ORDER BY id 
                   OFFSET @offset ROWS 
                   FETCH NEXT @limit ROWS ONLY`;
          
          request.input('limit', sql.Int, limit);
          request.input('offset', sql.Int, offset);

          const result = await request.query(query);

          // Get total count
          const countQuery = `SELECT COUNT(*) as total FROM [${safeTable}] ${whereClause}`;
          const countResult = await poolConnection.request().query(countQuery);
          const total = countResult.recordset[0].total;

          context.res = {
            status: 200,
            body: {
              success: true,
              data: result.recordset,
              count: result.recordset.length,
              total: total,
              offset: offset,
              limit: limit
            }
          };
        }
        break;
      }

      case 'PUT': {
        // UPDATE - Update record
        const id = req.query.id || req.body.id;
        const updateData = req.body.data;

        if (!id || !updateData) {
          context.res = {
            status: 400,
            body: { error: 'ID and data are required for PUT request' }
          };
          return;
        }

        // Sanitize table name
        const safeTable = sanitizeIdentifier(table);
        
        const columns = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = columns.map((col, i) => `[${col}] = @param${i}`).join(', ');

        const query = `UPDATE [${safeTable}] 
                       SET ${setClause} 
                       OUTPUT INSERTED.*
                       WHERE id = @id`;

        const request = poolConnection.request();
        request.input('id', sql.NVarChar(255), id);
        values.forEach((value, i) => {
          // Auto-detect type
          const sqlType = typeof value === 'number' ? sql.Decimal(18, 2) : 
                         typeof value === 'boolean' ? sql.Bit : 
                         value instanceof Date ? sql.DateTime2 : 
                         sql.NVarChar(sql.MAX);
          request.input(`param${i}`, sqlType, value);
        });

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
          context.res = {
            status: 404,
            body: { error: 'Record not found' }
          };
          return;
        }

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Record updated successfully',
            data: result.recordset[0],
            rowsAffected: result.rowsAffected[0]
          }
        };
        break;
      }

      case 'DELETE': {
        // DELETE - Delete record
        const id = req.query.id || req.body.id;

        if (!id) {
          context.res = {
            status: 400,
            body: { error: 'ID is required for DELETE request' }
          };
          return;
        }

        // Sanitize table name
        const safeTable = sanitizeIdentifier(table);
        
        const query = `DELETE FROM [${safeTable}] 
                       OUTPUT DELETED.*
                       WHERE id = @id`;

        const request = poolConnection.request();
        request.input('id', sql.NVarChar(255), id);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
          context.res = {
            status: 404,
            body: { error: 'Record not found' }
          };
          return;
        }

        context.res = {
          status: 200,
          body: {
            success: true,
            message: 'Record deleted successfully',
            data: result.recordset[0],
            rowsAffected: result.rowsAffected[0]
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
    context.log.error('Azure SQL operation error:', error);
    
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
