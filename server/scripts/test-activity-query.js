const { db } = require('../db/database');

try {
  console.log('Testing activity query...');
  
  const limit = 20;
  const params = [];
  const clauses = [];
  
  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT id, type, file_path, project, content, metadata, created_at FROM activities ${whereClause} ORDER BY created_at DESC LIMIT ?`;
  
  console.log('SQL:', sql);
  console.log('Params:', params, 'Limit:', limit);
  
  const statement = db.prepare(sql);
  const rows = statement.all(...params, limit);
  
  console.log('Query succeeded. Rows:');
  console.log(JSON.stringify(rows, null, 2));
} catch (err) {
  console.error('Query failed:', err.message);
  console.error('Full error:', err);
}
