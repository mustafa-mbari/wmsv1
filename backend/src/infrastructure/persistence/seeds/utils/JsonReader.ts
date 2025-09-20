import * as fs from 'fs/promises';
import * as path from 'path';
import { Result } from '../../../../utils/common/Result';

/**
 * Utility class for reading JSON data files
 */
export class JsonReader {
    private static dataBasePath = path.join(__dirname, '..', 'data');

    /**
     * Read JSON data from file
     */
    static async read<T = any>(filePath: string): Promise<Result<T[]>> {
        try {
            // Resolve the full path relative to the data directory
            const fullPath = path.isAbsolute(filePath)
                ? filePath
                : path.join(this.dataBasePath, filePath);

            // Check if file exists
            try {
                await fs.access(fullPath);
            } catch {
                return Result.fail(`File not found: ${fullPath}`);
            }

            // Read and parse the file
            const fileContent = await fs.readFile(fullPath, 'utf-8');

            if (!fileContent.trim()) {
                return Result.fail(`File is empty: ${fullPath}`);
            }

            const data = JSON.parse(fileContent);

            // Ensure data is an array
            if (!Array.isArray(data)) {
                return Result.fail(`Data in ${fullPath} must be an array`);
            }

            console.log(`📄 Loaded ${data.length} records from ${path.basename(fullPath)}`);
            return Result.ok(data);

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`Failed to read JSON file ${filePath}: ${message}`);
        }
    }

    /**
     * Read multiple JSON files
     */
    static async readMultiple<T = any>(filePaths: string[]): Promise<Result<{ [key: string]: T[] }>> {
        try {
            const results: { [key: string]: T[] } = {};

            for (const filePath of filePaths) {
                const result = await this.read<T>(filePath);
                if (result.isFailure) {
                    return Result.fail(result.error!);
                }

                const fileName = path.basename(filePath, '.json');
                results[fileName] = result.getValue();
            }

            return Result.ok(results);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`Failed to read multiple JSON files: ${message}`);
        }
    }

    /**
     * Get available data files for a domain
     */
    static async getDataFiles(domain: string): Promise<Result<string[]>> {
        try {
            const domainPath = path.join(this.dataBasePath, domain);

            try {
                await fs.access(domainPath);
            } catch {
                return Result.fail(`Domain directory not found: ${domainPath}`);
            }

            const files = await fs.readdir(domainPath);
            const jsonFiles = files
                .filter(file => file.endsWith('.json'))
                .map(file => path.join(domain, file));

            return Result.ok(jsonFiles);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`Failed to get data files for domain ${domain}: ${message}`);
        }
    }

    /**
     * Validate JSON file structure
     */
    static async validateFile(filePath: string, requiredFields: string[] = []): Promise<Result<void>> {
        try {
            const result = await this.read(filePath);
            if (result.isFailure) {
                return Result.fail(result.error!);
            }

            const data = result.getValue();

            if (data.length === 0) {
                return Result.ok(); // Empty files are valid
            }

            // Check required fields in first record
            const firstRecord = data[0];
            const missingFields = requiredFields.filter(field => !(field in firstRecord));

            if (missingFields.length > 0) {
                return Result.fail(`Missing required fields in ${filePath}: ${missingFields.join(', ')}`);
            }

            console.log(`✅ Validated ${path.basename(filePath)} - ${data.length} records`);
            return Result.ok();

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`Failed to validate file ${filePath}: ${message}`);
        }
    }

    /**
     * Get the base data path
     */
    static getDataBasePath(): string {
        return this.dataBasePath;
    }

    /**
     * Set custom data base path (for testing)
     */
    static setDataBasePath(basePath: string): void {
        this.dataBasePath = basePath;
    }
}