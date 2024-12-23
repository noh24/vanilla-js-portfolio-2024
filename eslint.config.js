import globals from 'globals'
import pluginJs from '@eslint/js'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: { globals: globals.browser },
		extends: ['eslint:recommended', 'plugin:pretteir/recommended'],
		files: ['**/*.js','*.js'],
		rules: {
			semi: ['error', 'never'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
			'no-console': ['warn', { allow: ['warn', 'error'] }], // Fixed "no console" typo
			'no-unused-vars': 'warn', // Corrected syntax
			'no-undef': 'warn', // Removed unnecessary option, as "typeof" doesn't apply when rule is disabled
		},
		tabWidth: 4,
	},
	pluginJs.configs.recommended,
]
