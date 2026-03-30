import {expect} from 'chai'

import {parseJsonc} from '../../src/util/parse-jsonc'

describe('parseJsonc', () => {
  it('should parse plain JSON tsconfig', () => {
    const input = '{"compilerOptions": {"target": "ES2020", "module": "commonjs"}}'
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {target: 'ES2020', module: 'commonjs'}})
  })

  it('should strip single-line comments', () => {
    const input = `{
      // This is the compiler configuration
      "compilerOptions": {
        "target": "ES2020", // Target ES2020
        "module": "commonjs" // Use CommonJS modules
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {target: 'ES2020', module: 'commonjs'}})
  })

  it('should strip multi-line comments', () => {
    const input = `{
      /* Main compiler options for the project */
      "compilerOptions": {
        "target": "ES2020",
        /*
         * Use strict mode for better type safety.
         * This enables all strict type-checking options.
         */
        "strict": true
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {target: 'ES2020', strict: true}})
  })

  it('should handle trailing commas in compilerOptions', () => {
    const input = `{
      "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "strict": true,
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {target: 'ES2020', module: 'commonjs', strict: true}})
  })

  it('should handle trailing commas in arrays', () => {
    const input = `{
      "compilerOptions": {
        "lib": [
          "ES2020",
          "DOM",
        ],
        "types": [
          "node",
          "mocha",
        ],
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {
        lib: ['ES2020', 'DOM'],
        types: ['node', 'mocha'],
      },
    })
  })

  it('should not strip // inside string values', () => {
    const input = `{
      "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "baseUrl": "https://example.com"
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        baseUrl: 'https://example.com',
      },
    })
  })

  it('should not strip /* inside string values', () => {
    const input = `{
      "compilerOptions": {
        "outDir": "dist/* output */"
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {outDir: 'dist/* output */'}})
  })

  it('should handle extends field', () => {
    const input = `{
      // Extend the base configuration
      "extends": "@tsconfig/node20/tsconfig.json",
      "compilerOptions": {
        "outDir": "./dist",
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({
      extends: '@tsconfig/node20/tsconfig.json',
      compilerOptions: {outDir: './dist'},
    })
  })

  it('should handle relative extends with comments', () => {
    const input = `{
      /* Extend the local base config */
      "extends": "./tsconfig.base.json",
      "compilerOptions": {
        // Override the output directory
        "outDir": "./lib",
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({
      extends: './tsconfig.base.json',
      compilerOptions: {outDir: './lib'},
    })
  })

  it('should handle ts-node section with comments and trailing commas', () => {
    const input = `{
      "compilerOptions": {
        "target": "ES2020",
      },
      // ts-node specific options
      "ts-node": {
        "transpileOnly": true,
        "require": [
          "tsconfig-paths/register",
        ],
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {target: 'ES2020'},
      'ts-node': {
        transpileOnly: true,
        require: ['tsconfig-paths/register'],
      },
    })
  })

  it('should handle include/exclude arrays with comments', () => {
    const input = `{
      "compilerOptions": {
        "target": "ES2020",
      },
      "include": [
        "src/**/*", // Source files
        "types/**/*", // Type declarations
      ],
      "exclude": [
        "node_modules",
        "dist",
        // Don't compile test files
        "**/*.test.ts",
      ],
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {target: 'ES2020'},
      include: ['src/**/*', 'types/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    })
  })

  it('should handle paths with glob patterns in strings', () => {
    const input = `{
      "compilerOptions": {
        "paths": {
          "@app/*": ["./src/*"],
          "@test/*": ["./test/*"],
        },
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {
        paths: {
          '@app/*': ['./src/*'],
          '@test/*': ['./test/*'],
        },
      },
    })
  })

  it('should handle escaped quotes in string values', () => {
    const input = `{
      "compilerOptions": {
        "plugins": [{ "name": "some-\\"plugin\\"" }]
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {
        plugins: [{name: 'some-"plugin"'}],
      },
    })
  })

  it('should handle mixed single-line and multi-line comments', () => {
    const input = `{
      // Top-level comment
      "compilerOptions": {
        /* Block comment */ "target": "ES2022", // Inline comment
        /**
         * JSDoc-style comment
         */
        "module": "nodenext",
        "moduleResolution": "nodenext" /* trailing block */
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {target: 'ES2022', module: 'nodenext', moduleResolution: 'nodenext'},
    })
  })

  it('should handle empty tsconfig', () => {
    expect(parseJsonc('{}')).to.deep.equal({})
  })

  it('should handle tsconfig with only comments', () => {
    const input = `{
      // nothing configured yet
    }`
    expect(parseJsonc(input)).to.deep.equal({})
  })

  it('should handle deeply nested trailing commas', () => {
    const input = `{
      "compilerOptions": {
        "paths": {
          "@lib/*": [
            "./lib/*",
          ],
        },
        "plugins": [
          {
            "name": "typescript-plugin-css-modules",
          },
        ],
      },
    }`
    expect(parseJsonc(input)).to.deep.equal({
      compilerOptions: {
        paths: {'@lib/*': ['./lib/*']},
        plugins: [{name: 'typescript-plugin-css-modules'}],
      },
    })
  })

  it('should handle comment immediately before closing brace', () => {
    const input = `{
      "compilerOptions": {
        "strict": true
        // "declaration": true
      }
    }`
    expect(parseJsonc(input)).to.deep.equal({compilerOptions: {strict: true}})
  })

  it('should throw on malformed JSON', () => {
    expect(() => parseJsonc('{ broken')).to.throw(SyntaxError)
  })

  it('should throw on unterminated multi-line comment', () => {
    expect(() => parseJsonc('{ /* never closed')).to.throw()
  })

  it('should handle a realistic full tsconfig.json', () => {
    const input = `{
      /* Configuration for oclif-core */
      "extends": "./tsconfig.base.json",
      "compilerOptions": {
        "target": "ES2022",           // Node 18+
        "module": "commonjs",
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,               // Enable all strict checks
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "paths": {
          "@oclif/*": ["./src/*"],     // Internal path aliases
        },
      },
      // ts-node configuration for development
      "ts-node": {
        "transpileOnly": true,
        "require": ["tsconfig-paths/register"],
      },
      "include": ["src/**/*"],
      "exclude": [
        "node_modules",
        "dist",
        "**/*.test.ts",              // Exclude test files
      ],
    }`
    expect(parseJsonc(input)).to.deep.equal({
      extends: './tsconfig.base.json',
      compilerOptions: {
        target: 'ES2022',
        module: 'commonjs',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        paths: {'@oclif/*': ['./src/*']},
      },
      'ts-node': {
        transpileOnly: true,
        require: ['tsconfig-paths/register'],
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    })
  })
})
