// Cross-platform compatibility utilities
import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Cross-platform path utilities
 */
export class PathUtils {
  /**
   * Normalize path separators for current platform
   * @param {string} inputPath - Path to normalize
   * @returns {string} - Normalized path
   */
  static normalize(inputPath) {
    if (!inputPath) return '';
    return path.normalize(inputPath);
  }

  /**
   * Join paths using platform-appropriate separators
   * @param {...string} paths - Path segments to join
   * @returns {string} - Joined path
   */
  static join(...paths) {
    return path.join(...paths.filter(p => p && typeof p === 'string'));
  }

  /**
   * Resolve path to absolute path
   * @param {...string} paths - Path segments to resolve
   * @returns {string} - Absolute path
   */
  static resolve(...paths) {
    return path.resolve(...paths.filter(p => p && typeof p === 'string'));
  }

  /**
   * Get relative path between two paths
   * @param {string} from - Source path
   * @param {string} to - Target path
   * @returns {string} - Relative path
   */
  static relative(from, to) {
    return path.relative(from, to);
  }

  /**
   * Ensure path uses forward slashes (for URLs and cross-platform consistency)
   * @param {string} inputPath - Path to convert
   * @returns {string} - Path with forward slashes
   */
  static toUnixPath(inputPath) {
    if (!inputPath) return '';
    return inputPath.replace(/\\/g, '/');
  }

  /**
   * Convert path to platform-specific format
   * @param {string} inputPath - Path to convert
   * @returns {string} - Platform-specific path
   */
  static toPlatformPath(inputPath) {
    if (!inputPath) return '';
    return os.platform() === 'win32' 
      ? inputPath.replace(/\//g, '\\')
      : inputPath.replace(/\\/g, '/');
  }

  /**
   * Get file extension in lowercase
   * @param {string} filePath - File path
   * @returns {string} - File extension (without dot)
   */
  static getExtension(filePath) {
    return path.extname(filePath).toLowerCase().slice(1);
  }

  /**
   * Get filename without extension
   * @param {string} filePath - File path
   * @returns {string} - Filename without extension
   */
  static getBasename(filePath, includeExt = false) {
    return includeExt ? path.basename(filePath) : path.basename(filePath, path.extname(filePath));
  }

  /**
   * Get directory name from path
   * @param {string} filePath - File path
   * @returns {string} - Directory path
   */
  static getDirname(filePath) {
    return path.dirname(filePath);
  }

  /**
   * Check if path is absolute
   * @param {string} inputPath - Path to check
   * @returns {boolean} - True if absolute
   */
  static isAbsolute(inputPath) {
    return path.isAbsolute(inputPath);
  }

  /**
   * Create safe file path by sanitizing filename
   * @param {string} filename - Original filename
   * @param {string} directory - Target directory
   * @returns {string} - Safe file path
   */
  static createSafeFilePath(filename, directory = '') {
    // Remove unsafe characters
    const safeFilename = filename
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
      .replace(/^\.+/, '_')
      .substring(0, 255);
    
    return directory ? this.join(directory, safeFilename) : safeFilename;
  }

  /**
   * Ensure directory exists, create if not
   * @param {string} dirPath - Directory path
   * @returns {boolean} - True if directory exists or was created
   */
  static ensureDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      return true;
    } catch (error) {
      console.error(`Failed to create directory: ${dirPath}`, error);
      return false;
    }
  }
}

/**
 * Operating system utilities
 */
export class OSUtils {
  /**
   * Get current operating system
   * @returns {string} - OS name (windows, macos, linux, other)
   */
  static getOS() {
    const platform = os.platform();
    switch (platform) {
      case 'win32': return 'windows';
      case 'darwin': return 'macos';
      case 'linux': return 'linux';
      default: return 'other';
    }
  }

  /**
   * Check if running on Windows
   * @returns {boolean} - True if Windows
   */
  static isWindows() {
    return os.platform() === 'win32';
  }

  /**
   * Check if running on macOS
   * @returns {boolean} - True if macOS
   */
  static isMacOS() {
    return os.platform() === 'darwin';
  }

  /**
   * Check if running on Linux
   * @returns {boolean} - True if Linux
   */
  static isLinux() {
    return os.platform() === 'linux';
  }

  /**
   * Get system temporary directory
   * @returns {string} - Temp directory path
   */
  static getTempDir() {
    return os.tmpdir();
  }

  /**
   * Get user home directory
   * @returns {string} - Home directory path
   */
  static getHomeDir() {
    return os.homedir();
  }

  /**
   * Get system information
   * @returns {object} - System information
   */
  static getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
      nodeArch: process.arch,
      nodePlatform: process.platform
    };
  }

  /**
   * Get platform-specific line ending
   * @returns {string} - Line ending for current platform
   */
  static getLineEnding() {
    return os.EOL;
  }

  /**
   * Get platform-specific executable extension
   * @returns {string} - Executable extension (.exe on Windows, empty on Unix)
   */
  static getExecutableExtension() {
    return this.isWindows() ? '.exe' : '';
  }

  /**
   * Get platform-specific path separator
   * @returns {string} - Path separator (; on Windows, : on Unix)
   */
  static getPathSeparator() {
    return path.delimiter;
  }
}

/**
 * File system utilities with cross-platform support
 */
export class FileUtils {
  /**
   * Check if file exists
   * @param {string} filePath - File path to check
   * @returns {boolean} - True if file exists
   */
  static exists(filePath) {
    try {
      return fs.existsSync(PathUtils.normalize(filePath));
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   * @param {string} filePath - File path
   * @returns {object|null} - File stats or null if error
   */
  static getStats(filePath) {
    try {
      return fs.statSync(PathUtils.normalize(filePath));
    } catch {
      return null;
    }
  }

  /**
   * Get file size in bytes
   * @param {string} filePath - File path
   * @returns {number} - File size in bytes, -1 if error
   */
  static getFileSize(filePath) {
    const stats = this.getStats(filePath);
    return stats ? stats.size : -1;
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   * @returns {boolean} - True if successful
   */
  static createDir(dirPath) {
    return PathUtils.ensureDirectory(dirPath);
  }

  /**
   * Delete file safely
   * @param {string} filePath - File path to delete
   * @returns {boolean} - True if successful
   */
  static deleteFile(filePath) {
    try {
      if (this.exists(filePath)) {
        fs.unlinkSync(PathUtils.normalize(filePath));
        return true;
      }
      return true; // File doesn't exist, consider it deleted
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Copy file with cross-platform support
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {boolean} - True if successful
   */
  static copyFile(source, destination) {
    try {
      const normalizedSource = PathUtils.normalize(source);
      const normalizedDest = PathUtils.normalize(destination);
      
      // Ensure destination directory exists
      PathUtils.ensureDirectory(PathUtils.getDirname(normalizedDest));
      
      fs.copyFileSync(normalizedSource, normalizedDest);
      return true;
    } catch (error) {
      console.error(`Failed to copy file: ${source} -> ${destination}`, error);
      return false;
    }
  }

  /**
   * Move/rename file with cross-platform support
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {boolean} - True if successful
   */
  static moveFile(source, destination) {
    try {
      const normalizedSource = PathUtils.normalize(source);
      const normalizedDest = PathUtils.normalize(destination);
      
      // Ensure destination directory exists
      PathUtils.ensureDirectory(PathUtils.getDirname(normalizedDest));
      
      fs.renameSync(normalizedSource, normalizedDest);
      return true;
    } catch (error) {
      console.error(`Failed to move file: ${source} -> ${destination}`, error);
      return false;
    }
  }
}

/**
 * URL utilities for cross-platform web paths
 */
export class URLUtils {
  /**
   * Convert file path to URL format
   * @param {string} filePath - File path
   * @returns {string} - URL-formatted path
   */
  static filePathToURL(filePath) {
    return PathUtils.toUnixPath(filePath);
  }

  /**
   * Convert URL format to file path
   * @param {string} urlPath - URL path
   * @returns {string} - File system path
   */
  static urlToFilePath(urlPath) {
    return PathUtils.toPlatformPath(urlPath);
  }

  /**
   * Join URL paths
   * @param {...string} paths - URL path segments
   * @returns {string} - Joined URL path
   */
  static joinURL(...paths) {
    return paths
      .filter(p => p && typeof p === 'string')
      .map((p, i) => {
        if (i === 0) return p.replace(/\/+$/, '');
        return p.replace(/^\/+|\/+$/g, '');
      })
      .join('/');
  }
}

/**
 * Environment utilities
 */
export class EnvUtils {
  /**
   * Get environment variable with fallback
   * @param {string} name - Environment variable name
   * @param {string} fallback - Fallback value
   * @returns {string} - Environment variable value or fallback
   */
  static get(name, fallback = '') {
    return process.env[name] || fallback;
  }

  /**
   * Check if running in development mode
   * @returns {boolean} - True if development
   */
  static isDevelopment() {
    return this.get('NODE_ENV', 'development') === 'development';
  }

  /**
   * Check if running in production mode
   * @returns {boolean} - True if production
   */
  static isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if running in test mode
   * @returns {boolean} - True if test
   */
  static isTest() {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get port with fallback
   * @param {number} fallback - Fallback port
   * @returns {number} - Port number
   */
  static getPort(fallback = 5004) {
    return parseInt(this.get('PORT', fallback.toString()), 10) || fallback;
  }
}

// Default export object for convenience
export default {
  PathUtils,
  OSUtils,
  FileUtils,
  URLUtils,
  EnvUtils
};
