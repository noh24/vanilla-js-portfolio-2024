import globals from 'globals'
import pluginJs from '@eslint/js'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: { globals: globals.browser },
		extends: ['eslint:recommended', 'plugin:pretteir/recommended'],
		files: ['*.js'],
		rules: {
			semi: ['error', 'never'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
			"no console": ['warn', { allow: ["warn", "error"]} ],
			"no-unused-vars": ['off', {args: 'none'}]
		},
		tabWidth: 4,
	},
	pluginJs.configs.recommended,
]
