import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function createPool() {
  if (pool) return pool

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'poolvillasdb',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  })

  // Test connection on startup
  pool.getConnection()
    .then((connection: mysql.PoolConnection) => {
      console.log('✅ Database connected successfully')
      connection.release()
    })
    .catch((err: Error) => {
      console.error('❌ Database connection failed:', err)
    })

  return pool
}

export default createPool()