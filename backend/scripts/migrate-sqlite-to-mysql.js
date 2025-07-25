/**
 * Data migration script from SQLite to MySQL
 * Run this script only if you have existing data in SQLite that needs to be migrated
 */

const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function migrateSQLiteToMySQL() {
  const sqliteDbPath = path.join(__dirname, '../prisma/database.sqlite.backup');
  
  console.log('🔄 Starting SQLite to MySQL data migration...');
  
  // Check if SQLite backup exists
  const fs = require('fs');
  if (!fs.existsSync(sqliteDbPath)) {
    console.log('❌ SQLite backup file not found. Skipping data migration.');
    console.log('   Expected file: ' + sqliteDbPath);
    return;
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqliteDbPath, (err) => {
      if (err) {
        console.error('❌ Error opening SQLite database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Migrate Users
    db.all('SELECT * FROM User', async (err, users) => {
      if (err) {
        console.error('❌ Error reading users from SQLite:', err);
        reject(err);
        return;
      }

      console.log(`📊 Found ${users.length} users to migrate`);

      for (const user of users) {
        try {
          await prisma.user.create({
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              avatar: user.avatar,
              roles: user.roles || 'user',
              // createdAt and updatedAt will be set automatically
            },
          });
          console.log(`✅ Migrated user: ${user.email}`);
        } catch (error) {
          console.error(`❌ Error migrating user ${user.email}:`, error.message);
        }
      }

      // Migrate Tasks
      db.all('SELECT * FROM Task', async (err, tasks) => {
        if (err) {
          console.error('❌ Error reading tasks from SQLite:', err);
          reject(err);
          return;
        }

        console.log(`📊 Found ${tasks.length} tasks to migrate`);

        for (const task of tasks) {
          try {
            await prisma.task.create({
              data: {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status || 'PENDING',
                userId: task.userId,
                createdAt: new Date(task.createdAt),
                // updatedAt will be set automatically
              },
            });
            console.log(`✅ Migrated task: ${task.title}`);
          } catch (error) {
            console.error(`❌ Error migrating task ${task.title}:`, error.message);
          }
        }

        // Migrate RefreshTokens
        db.all('SELECT * FROM RefreshToken', async (err, tokens) => {
          if (err) {
            console.error('❌ Error reading refresh tokens from SQLite:', err);
            reject(err);
            return;
          }

          console.log(`📊 Found ${tokens.length} refresh tokens to migrate`);

          for (const token of tokens) {
            try {
              await prisma.refreshToken.create({
                data: {
                  id: token.id,
                  token: token.token,
                  userId: token.userId,
                  createdAt: new Date(token.createdAt),
                  expiresAt: new Date(token.expiresAt),
                  // updatedAt will be set automatically
                },
              });
              console.log(`✅ Migrated refresh token for user ${token.userId}`);
            } catch (error) {
              console.error(`❌ Error migrating refresh token:`, error.message);
            }
          }

          console.log('🎉 Data migration completed!');
          db.close();
          resolve();
        });
      });
    });
  });
}

// Run migration
migrateSQLiteToMySQL()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
