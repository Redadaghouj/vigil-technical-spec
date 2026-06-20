import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import assignmentBraceNewline from './eslint-rules/assignment-brace-newline.js'

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{js,jsx}'],
		extends: [
			js.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		plugins: {
			local: {
				rules: {
					'assignment-brace-newline': assignmentBraceNewline
				}
			}
		},
		rules: {
			indent: ['error', 'tab'],
			'brace-style': ['error', 'allman'],
			'local/assignment-brace-newline': 'error',
		},
	},
])
