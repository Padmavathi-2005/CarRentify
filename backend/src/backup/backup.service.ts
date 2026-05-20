import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EJSON } from 'bson';
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async runBackup(): Promise<{
    success: boolean;
    timestamp: string;
    filePath: string;
    fileSizeKb: number;
    collections: { name: string; count: number }[];
    error?: string;
  }> {
    try {
      const db = this.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }

      const backupDir = join(process.cwd(), 'db_backups');
      
      // Ensure backup directory exists
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
        this.logger.log(`Created backup directory: ${backupDir}`);
      } else {
        // Delete old backup files in the folder
        const files = readdirSync(backupDir);
        for (const file of files) {
          try {
            unlinkSync(join(backupDir, file));
            this.logger.log(`Deleted old backup file: ${file}`);
          } catch (e: any) {
            this.logger.warn(`Could not delete old backup file ${file}: ${e.message}`);
          }
        }
      }

      // Fetch all collections and serialize
      const collections = await db.listCollections().toArray();
      const backupData: Record<string, any[]> = {};
      const collectionStats: { name: string; count: number }[] = [];

      for (const col of collections) {
        const colName = col.name;
        if (colName.startsWith('system.')) continue;
        
        const docs = await db.collection(colName).find({}).toArray();
        backupData[colName] = docs;
        collectionStats.push({ name: colName, count: docs.length });
        this.logger.log(`Backed up collection ${colName}: ${docs.length} documents`);
      }

      // Use relaxed: false to preserve strict Mongo BSON types
      const serialized = EJSON.stringify(backupData, { relaxed: false });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_${timestamp}.json`;
      const filePath = join(backupDir, fileName);

      writeFileSync(filePath, serialized, 'utf-8');
      const stats = statSync(filePath);
      const fileSizeKb = Math.round((stats.size / 1024) * 100) / 100;

      this.logger.log(`Backup completed successfully. Saved to ${filePath} (${fileSizeKb} KB)`);

      return {
        success: true,
        timestamp: new Date().toLocaleString(),
        filePath: fileName,
        fileSizeKb,
        collections: collectionStats,
      };
    } catch (error: any) {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);
      return {
        success: false,
        timestamp: new Date().toLocaleString(),
        filePath: '',
        fileSizeKb: 0,
        collections: [],
        error: error.message,
      };
    }
  }

  async runRestore(): Promise<{
    success: boolean;
    timestamp: string;
    filePath: string;
    clearedCollections: string[];
    restoredCollections: { name: string; count: number }[];
    error?: string;
  }> {
    try {
      const db = this.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }

      const backupDir = join(process.cwd(), 'db_backups');
      if (!existsSync(backupDir)) {
        throw new Error('Backup directory does not exist. Please run a backup first.');
      }

      const files = readdirSync(backupDir).filter((f) => f.endsWith('.json'));
      if (files.length === 0) {
        throw new Error('No backup files found in backup directory.');
      }

      // Sort to get latest backup file
      files.sort();
      const latestBackupFile = files[files.length - 1];
      const filePath = join(backupDir, latestBackupFile);

      const content = readFileSync(filePath, 'utf-8');
      const backupData = EJSON.parse(content) as Record<string, any[]>;

      // Get current collections to clear
      const currentCollections = await db.listCollections().toArray();
      const clearedCollections: string[] = [];

      for (const col of currentCollections) {
        const colName = col.name;
        if (colName.startsWith('system.')) continue;

        try {
          await db.collection(colName).deleteMany({});
          clearedCollections.push(colName);
          this.logger.log(`Cleared all documents from collection: ${colName}`);
        } catch (err: any) {
          this.logger.warn(`Could not clear collection ${colName}: ${err.message}`);
        }
      }

      // Restore data from backup
      const restoredCollections: { name: string; count: number }[] = [];

      for (const [colName, docs] of Object.entries(backupData)) {
        if (docs.length > 0) {
          await db.collection(colName).insertMany(docs);
          restoredCollections.push({ name: colName, count: docs.length });
          this.logger.log(`Restored ${docs.length} documents to collection: ${colName}`);
        } else {
          restoredCollections.push({ name: colName, count: 0 });
          this.logger.log(`Restored empty collection: ${colName}`);
        }
      }

      return {
        success: true,
        timestamp: new Date().toLocaleString(),
        filePath: latestBackupFile,
        clearedCollections,
        restoredCollections,
      };
    } catch (error: any) {
      this.logger.error(`Restore failed: ${error.message}`, error.stack);
      return {
        success: false,
        timestamp: new Date().toLocaleString(),
        filePath: '',
        clearedCollections: [],
        restoredCollections: [],
        error: error.message,
      };
    }
  }
}
