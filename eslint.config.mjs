import globals from 'globals'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import importHelpersPlugin from 'eslint-plugin-import-helpers'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import perfectionistPlugin from 'eslint-plugin-perfectionist'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.js'],
    rules: {
      'camelcase': 'off',
      'space-before-function-paren': 'off'
    }
  },
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error'
    }
  },
  {
    plugins: {
      'import-helpers': importHelpersPlugin
    },
    rules: {
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            'module',
            '/^@prisma/',
            '/^@/',
            ['parent', 'sibling', 'index']
          ],
          alphabetize: { order: 'asc', ignoreCase: true }
        }
      ],
      'sort-imports': 'off'
    }
  },
  {
    plugins: {
      'unused-imports': unusedImportsPlugin
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'none',
          argsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    plugins: {
      perfectionist: perfectionistPlugin
    },
    rules: {
      'perfectionist/sort-interfaces': 'error',
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'natural',
          order: 'asc'
        }
      ]
    }
  },
  {
    rules: {
      'no-useless-constructor': 'off',
      'no-use-before-define': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'none',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'prisma/migrations/',
      '*.config.js',
      '*.config.mjs'
    ]
  }
]
