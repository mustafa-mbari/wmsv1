// prisma/seeds/utils/JsonReader.ts
// Utility class for reading and processing JSON seed files

import * as fs from 'fs/promises';
import * as path from 'path';

export interface JsonReaderOptions {
  encoding?: BufferEncoding;
  basePath?: string;
  validateJson?: boolean;
}

export class JsonReader {
  private options: JsonReaderOptions;
  private basePath: string;

  constructor(options: JsonReaderOptions = {}) {
    this.options = {
      encoding: 'utf-8',
      basePath: path.join(__dirname, '..', 'data'),
      validateJson: true,
      ...options
    };
    this.basePath = this.options.basePath!;
  }

  /**
   * Read a JSON file and parse it
   */
  async readJsonFile<T>(fileName: string): Promise<T[]> {
    try {
      const filePath = this.resolveFilePath(fileName);
      
      // Check if file exists
      await this.checkFileExists(filePath);
      
      // Read file content
      const content = await fs.readFile(filePath, { encoding: this.options.encoding });
      
      // Parse JSON
      const data = JSON.parse(content as string);
      
      // Validate structure
      if (this.options.validateJson) {
        this.validateJsonStructure(data, fileName);
      }
      
      console.log(`📖 Successfully read ${fileName}: ${Array.isArray(data) ? data.length : 1} records`);
      
      return Array.isArray(data) ? data : [data];
      
    } catch (error) {
      console.error(`❌ Failed to read JSON file ${fileName}:`, error);
      throw new Error(`Could not read JSON file ${fileName}: ${error}`);
    }
  }

  /**
   * Read multiple JSON files
   */
  async readMultipleJsonFiles<T>(fileNames: string[]): Promise<{ [fileName: string]: T[] }> {
    const results: { [fileName: string]: T[] } = {};
    
    for (const fileName of fileNames) {
      try {
        results[fileName] = await this.readJsonFile<T>(fileName);
      } catch (error) {
        console.warn(`⚠️ Could not read ${fileName}, skipping...`);
        results[fileName] = [];
      }
    }
    
    return results;
  }

  /**
   * Check if a JSON file exists
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      const filePath = this.resolveFilePath(fileName);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all JSON files in the data directory
   */
  async listJsonFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.basePath);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      console.error('❌ Failed to list JSON files:', error);
      return [];
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileName: string): Promise<{
    size: number;
    modified: Date;
    path: string;
  }> {
    const filePath = this.resolveFilePath(fileName);
    const stats = await fs.stat(filePath);
    
    return {
      size: stats.size,
      modified: stats.mtime,
      path: filePath
    };
  }

  /**
   * Write data to JSON file (for generating seed templates)
   */
  async writeJsonFile<T>(fileName: string, data: T[], pretty: boolean = true): Promise<void> {
    try {
      const filePath = this.resolveFilePath(fileName);
      const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      
      await fs.writeFile(filePath, content, { encoding: this.options.encoding });
      console.log(`💾 Successfully wrote ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Failed to write JSON file ${fileName}:`, error);
      throw new Error(`Could not write JSON file ${fileName}: ${error}`);
    }
  }

  /**
   * Create backup of existing JSON file
   */
  async backupJsonFile(fileName: string): Promise<string> {
    const filePath = this.resolveFilePath(fileName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace('.json', `_backup_${timestamp}.json`);
    
    try {
      await fs.copyFile(filePath, backupPath);
      console.log(`📋 Backup created: ${path.basename(backupPath)}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ Failed to create backup for ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Validate JSON file structure
   */
  private validateJsonStructure(data: any, fileName: string): void {
    if (data === null || data === undefined) {
      throw new Error(`JSON file ${fileName} is empty or invalid`);
    }

    if (!Array.isArray(data) && typeof data !== 'object') {
      throw new Error(`JSON file ${fileName} must contain an array or object`);
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.warn(`⚠️ JSON file ${fileName} contains an empty array`);
      }

      // Check if all items in array are objects
      const invalidItems = data.filter(item => typeof item !== 'object' || item === null);
      if (invalidItems.length > 0) {
        throw new Error(`JSON file ${fileName} contains invalid items (must be objects)`);
      }
    }
  }

  /**
   * Resolve file path
   */
  private resolveFilePath(fileName: string): string {
    // Add .json extension if not present
    if (!fileName.endsWith('.json')) {
      fileName += '.json';
    }

    // Resolve absolute path
    return path.resolve(this.basePath, fileName);
  }

  /**
   * Check if file exists and throw error if not
   */
  private async checkFileExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  /**
   * Set base path for JSON files
   */
  setBasePath(basePath: string): void {
    this.basePath = path.resolve(basePath);
  }

  /**
   * Get current base path
   */
  getBasePath(): string {
    return this.basePath;
  }
}