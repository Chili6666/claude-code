---
name: organize-imports
description: Reorder and group imports in all TSX and TS files with section comments
version: 1.0.0
type: command
last_updated: 2026-02-12
---

# organize-imports Command

Reorder and group imports in all `.ts` and `.tsx` source files across the monorepo. Each import group is separated by a blank line and preceded by a section comment.

## Import Group Order

Organize imports into the following groups, in this exact order:

### 1. React imports
React core and React ecosystem packages.

```ts
// React imports
import { useEffect, useState } from 'react';
import ReactDOM, { Root } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
```

Packages in this group: `react`, `react-dom`, `react-dom/client`, `react-router-dom`, `react-i18next`, `i18next`.

### 2. Third-party imports
All other external/non-relative imports not covered by the React group. This includes `@mui/*`, `@tanstack/*`, `ol/*`, and any other third-party package.

```ts
// Third-party imports
import axios from 'axios';
import { Button, Card } from '@mui/material';
import { QueryClient, useQuery } from '@tanstack/react-query';
import Map from 'ol/Map';
import 'ol/ol.css';
```

Side-effect imports from third-party packages (e.g. `import 'ol/ol.css'`, `import 'some-lib/styles.css'`) belong in this group.

### 3. Local imports - Interfaces/Types
Relative imports that are interfaces, types, or type-only imports.

```ts
// Local imports - Interfaces/Types
import type { Chat } from '../../interfaces/Chat';
import { Configuration } from './interfaces/Configuration';
import { Position } from '../../interfaces/Position';
```

Heuristics for this group:
- Has `import type` keyword
- Path contains `/interfaces/` or `/types/`
- File exports only types/interfaces (e.g. `TypeDefinitions.ts`, `Consts.ts`)

### 4. Local imports - Utilities/Services
Relative imports for utility functions, services, helpers, and hooks.

```ts
// Local imports - Utilities/Services
import { DataLayerSource } from '../../utils/DataLayerSource';
import { MapHelper } from '../../utils/MapHelper';
import { isMapItemsLayer } from '../../utils/utils';
```

Heuristics for this group:
- Path contains `/utils/`, `/services/`, `/helpers/`, `/hooks/`
- Non-component, non-interface local imports (functions, classes, constants from utility files)

### 5. Local imports - Components
Relative imports for React components and their associated CSS modules.

```ts
// Local imports - Components
import Header from './components/Header/Header';
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay';
import MapComponent from '../Map/Map';
import styles from './App.module.css';
```

Heuristics for this group:
- Path contains `/components/`, `/views/`, `/bootstrapables/`, `/pages/`
- CSS module imports (`*.module.css`)
- Side-effect CSS imports from local paths (`import './assets/css/...'`)
- Default component imports (e.g. `App`, `HomePage`)

### 6. Local imports - Other
Any remaining local relative imports that don't fit the above categories (e.g. `import './i18n'`, sample data, layers).

```ts
// Local imports - Other
import './i18n';
import pictogramData from '../../sampledata/Pictrograms.json';
import { VehicleDataLayer } from '../../layers/VehicleDataLayer';
```

## Rules

1. **Within each group**, sort imports alphabetically by the module specifier (the `from '...'` path).
2. **Omit empty groups** - if a file has no imports for a group, skip both the comment and the blank line for that group.
3. **Omit group comments when there is only one group** - if a file only has imports from a single group, do not add the section comment.
4. **Preserve side-effect imports** - imports without bindings (e.g. `import './i18n'`) stay in their appropriate group.
5. **Combine duplicate module imports** - if `Root` and `ReactDOM` are imported from the same module separately, combine them: `import ReactDOM, { Root } from 'react-dom/client'`.
6. **Do not modify non-import code** - only touch the import block at the top of each file.
7. **Use single quotes** consistently for import paths.

## Scope

- Process all `*.ts` and `*.tsx` files under `*/src/` directories in the monorepo.
- Skip files in `node_modules/`, `dist/`, and `.d.ts` declaration files.
- Skip files that have no imports or only a single import (nothing to reorder).
- Skip files that are already correctly organized.

## Execution

1. Use `Glob` to find all `*.ts` and `*.tsx` files under `*/src/` directories in the project.
2. Read each file and analyze its import block.
3. Categorize each import into the appropriate group.
4. If the imports are already correctly ordered and grouped, skip the file.
5. Use the `Edit` tool to replace the import block with the correctly organized version.
6. After all edits, report a summary of files changed vs files already correct.
