import globals from 'globals'
import pluginJs from '@eslint/js'
import prettier from 'prettier'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: { 
			globals: { ...globals.browser, ...globals.node },
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		files: ['**/*.js','*.js'],
		plugins: {
			prettier: prettier,
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			semi: ['error', 'never'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
			'no-console': ['warn', { allow: ['warn', 'error'] }], 
			'no-unused-vars': 'warn', 
			'no-undef': 'error',
			'prettier/prettier': 'error',
		},
	},
	pluginJs.configs.recommended,
]
