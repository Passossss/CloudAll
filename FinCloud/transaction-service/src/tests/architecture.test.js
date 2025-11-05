/**
 * Arquitetura Tests - Clean Architecture Dependency Rules
 */

const path = require('path');
const fs = require('fs');

// Simple test runner
function describe(name, fn) {
  console.log(`\n✓ ${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}: ${error.message}`);
  }
}

function expect(value) {
  return {
    not: {
      toMatch: (pattern) => {
        if (typeof value === 'string' && pattern.test(value)) {
          throw new Error(`Expected string not to match pattern: ${pattern}`);
        }
      }
    },
    toBeGreaterThan: (num) => {
      if (value <= num) {
        throw new Error(`Expected ${value} to be greater than ${num}`);
      }
    },
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    }
  };
}

// Run tests if executed directly
if (require.main === module) {
  describe('Clean Architecture - Dependency Rules', () => {
  const basePath = path.join(__dirname, '..');
  
  describe('Domain Layer', () => {
    it('should not have dependencies on other layers', () => {
      const domainPath = path.join(basePath, 'domain');
      if (!fs.existsSync(domainPath)) {
        console.warn('Domain layer not found, skipping test');
        return;
      }

      const domainFiles = getAllFiles(domainPath);
      domainFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/from ['"].*application/) || content.match(/require\(['"].*application/)) {
          throw new Error(`${file} imports from application layer`);
        }
        if (content.match(/from ['"].*infrastructure/) || content.match(/require\(['"].*infrastructure/)) {
          throw new Error(`${file} imports from infrastructure layer`);
        }
        if (content.match(/from ['"].*presentation/) || content.match(/require\(['"].*presentation/)) {
          throw new Error(`${file} imports from presentation layer`);
        }
      });
    });
  });

  describe('Application Layer', () => {
    it('should only depend on Domain layer', () => {
      const appPath = path.join(basePath, 'application');
      if (!fs.existsSync(appPath)) {
        console.warn('Application layer not found, skipping test');
        return;
      }

      const appFiles = getAllFiles(appPath);
      appFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/from ['"].*infrastructure/)) {
          throw new Error(`${file} imports from infrastructure layer`);
        }
        if (content.match(/require\(['"].*infrastructure/)) {
          throw new Error(`${file} requires from infrastructure layer`);
        }
        if (content.match(/from ['"].*presentation/)) {
          throw new Error(`${file} imports from presentation layer`);
        }
        if (content.match(/require\(['"].*presentation/)) {
          throw new Error(`${file} requires from presentation layer`);
        }
      });
    });
  });

  describe('Vertical Slice Structure', () => {
    it('should have features organized by use case', () => {
      const featuresPath = path.join(basePath, 'application', 'features');
      if (!fs.existsSync(featuresPath)) {
        console.warn('Features directory not found, skipping test');
        return;
      }

      const features = fs.readdirSync(featuresPath);
      expect(features.length).toBeGreaterThan(0);
      
      features.forEach(feature => {
        const featurePath = path.join(featuresPath, feature);
        const files = fs.readdirSync(featurePath);
        const hasUseCase = files.some(f => f.includes('UseCase') || f.includes('usecase'));
        expect(hasUseCase).toBe(true);
      });
    });
  });
  });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

