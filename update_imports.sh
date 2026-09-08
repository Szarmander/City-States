#!/bin/bash
cd client/src/components

# Update imports from App and types
find . -name "*.tsx" -exec sed -i '' "s|from '../App'|from '../../App'|g" {} +
find . -name "*.tsx" -exec sed -i '' "s|from '../types'|from '../../types'|g" {} +
find . -name "*.tsx" -exec sed -i '' "s|from '../i18n'|from '../../i18n'|g" {} +

