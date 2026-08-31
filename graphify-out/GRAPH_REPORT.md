# Graph Report - koperasi-desktop  (2026-08-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1113 nodes · 3088 edges · 115 communities (36 shown, 79 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 2,573 input · 1,302 output

## Graph Freshness
- Built from commit: `ab9dac80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Shared UI Hooks and Components
- Financial Reporting and Export
- Electron Main Process Configuration
- Database and Environment Utilities
- Basic UI Components
- Electron Build Configuration
- Generic Form Components
- Page Layout and Breadcrumbs
- Header and Navigation UI
- Loan and Selection Forms
- Form Input Elements
- Core Business Logic Controllers
- Application Page Components
- Holiday and Auth Services
- TypeScript and Vite Configuration
- Controller and Constant Definitions
- Area Management Logic
- Category Management Logic
- Loan Processing Logic
- Business Position Tracking
- Member and Text Inputs
- POS Management Logic
- Development Dependencies
- Installment Management Logic
- Member Data Logic
- Transaction Processing Logic
- External Library Dependencies
- Group Management Logic
- Employee Management Controller
- Activity Logging Logic
- Business Position Controller
- User Management Logic
- React Core Dependencies
- Transaction Management Controller
- Employee Data Model
- Navigation and Layout Utilities
- Project Metadata
- Avatar UI Components
- NPM Scripts
- NodeJS Environment Types
- Documentation and Assets
- Phone Input Component
- Map Visualization Component
- TypeScript Project References
- Workflow Rules
- Password Hashing Library
- HTTP Client Library
- Class Name Utility
- CORS Middleware
- Holiday Calendar Library
- Environment Variable Library
- Auto-update Library
- ESLint Core
- ESLint JavaScript Config
- ESLint React Hooks
- ESLint React Refresh
- Express Web Framework
- Validation Middleware
- Date Picker Library
- FullCalendar Core
- FullCalendar DayGrid
- FullCalendar Interaction
- FullCalendar List View
- FullCalendar React Integration
- Global Variables Config
- HTML Canvas Library
- Static Web Assets
- JWT Authentication Library
- PDF Generation Library
- File Upload Middleware
- MySQL Database Driver
- iCal Parsing Library
- SQL Query Builder
- React Library
- ApexCharts React Integration
- Drag and Drop Library
- DND HTML5 Backend
- React DOM Library
- File Dropzone Library
- React SEO Library
- React Form Library
- Vector Map Core
- Vector Map World
- React Router Library
- Toast Notification Library
- Carousel Slider Library
- Tailwind Merge Utility
- Tailwind Vite Plugin
- Schema Validation Library
- Tailwind CSS Framework
- Tailwind PostCSS Plugin
- React Type Definitions
- React DOM Types
- Vite Build Tool
- Vite Electron Plugin
- Vite React Plugin
- SVG Type Definitions
- Electron Type Definitions
- Update Information
- Database Migration Scripts
- 404 Light Theme Asset
- 404 Dark Theme Asset
- Koperasi Indonesia Branding
- Owner Profile Photo
- User Avatar Placeholder
- Alert Notification Icon
- User Interface Icon

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 61 edges
2. `axios` - 61 edges
3. `logActivity()` - 48 edges
4. `useUser()` - 45 edges
5. `formatCurrency()` - 43 edges
6. `toLocalDate()` - 39 edges
7. `Label()` - 38 edges
8. `ComponentCard()` - 38 edges
9. `PageMeta()` - 38 edges
10. `Button()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `TailAdmin React README` --references--> `Calendar Icon`  [INFERRED]
  README.md → src/icons/calendar.svg
- `TailAdmin React README` --references--> `Chat Icon`  [INFERRED]
  README.md → src/icons/chat.svg
- `Index HTML` --references--> `Favicon Logo`  [EXTRACTED]
  index.html → public/favicon.png
- `ExportPDFProps` --references--> `TransactionProps`  [EXTRACTED]
  src/pages/laba-rugi/ExportPDF.tsx → src/utils/types.ts
- `ExportPDFProps` --references--> `TransactionProps`  [EXTRACTED]
  src/pages/transactions/ExportPDF.tsx → src/utils/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Agent Infrastructure** — agents_rules_graphify, agents_workflows_graphify [EXTRACTED 1.00]
- **Dashboard UI Assets** — public_images_error_404, public_images_error_404_dark, src_icons_alert, src_icons_calendar [INFERRED 0.80]

## Communities (115 total, 79 thin omitted)

### Community 0 - "Shared UI Hooks and Components"
Cohesion: 0.05
Nodes (109): Calendar, Home, LoanDetail, Pagination(), PaginationProps, Badge(), BadgeColor, BadgeProps (+101 more)

### Community 1 - "Financial Reporting and Export"
Cohesion: 0.05
Nodes (67): LabaRugi, PosisiUsaha, EmployeForm(), EmployeTable(), ExportPDF(), ExportPDFProps, getData(), FilterDate() (+59 more)

### Community 2 - "Electron Main Process Configuration"
Cohesion: 0.04
Nodes (36): __dirname, MAIN_DIST, RENDERER_DIST, require, size, VITE_DEV_SERVER_URL, electron, DOM (+28 more)

### Community 3 - "Database and Environment Utilities"
Cohesion: 0.10
Nodes (15): als, __dirname, exportDB(), __filename, getAppDataPath(), getBackupDir(), getEnvPath(), listBackup() (+7 more)

### Community 4 - "Basic UI Components"
Cohesion: 0.10
Nodes (25): UserProfiles, DatePicker(), PropsType, Label(), LabelProps, Button(), ButtonProps, UserAddressCard() (+17 more)

### Community 5 - "Electron Build Configuration"
Cohesion: 0.05
Nodes (37): appId, asar, directories, output, extraFiles, files, linux, artifactName (+29 more)

### Community 6 - "Generic Form Components"
Cohesion: 0.09
Nodes (24): AreaForm, CategoryForm, EmployeForm, PosForm, ScheduleForm, UserForm, Form(), FormProps (+16 more)

### Community 7 - "Page Layout and Breadcrumbs"
Cohesion: 0.28
Nodes (8): ComponentCard(), ComponentCardProps, BreadcrumbProps, PageBreadcrumb(), PageMeta(), Input, InputProps, days

### Community 8 - "Header and Navigation UI"
Cohesion: 0.10
Nodes (19): ThemeToggleButton(), HeaderProps, NotificationDropdown(), UserDropdown(), SidebarContext, SidebarContextType, SidebarProvider(), useSidebar() (+11 more)

### Community 9 - "Loan and Selection Forms"
Cohesion: 0.12
Nodes (22): Angsuran, GroupForm, LoanForm, MultiSelect(), MultiSelectProps, Option, Option, Select() (+14 more)

### Community 10 - "Form Input Elements"
Cohesion: 0.09
Nodes (19): FormElements, CheckboxComponents(), DefaultInputs(), DropzoneComponent(), FileInputExample(), InputGroup(), InputStates(), RadioButtons() (+11 more)

### Community 11 - "Core Business Logic Controllers"
Cohesion: 0.09
Nodes (5): GroupController, MemberController, ScheduleController, logActivity(), UserController

### Community 12 - "Application Page Components"
Cohesion: 0.08
Nodes (25): App(), Area, Backup, Blank, Category, Employe, Group, Loan (+17 more)

### Community 13 - "Holiday and Auth Services"
Cohesion: 0.11
Nodes (13): filePath, formatDate(), getHolidayApi(), hd, saveHolidayJson(), AuthController, uploadProfileController(), authenticate() (+5 more)

### Community 14 - "TypeScript and Vite Configuration"
Cohesion: 0.10
Nodes (20): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, composite, isolatedModules, lib, module (+12 more)

### Community 15 - "Controller and Constant Definitions"
Cohesion: 0.39
Nodes (5): ACTIVITY_ACTION, ACTIVITY_ENTITY, ACTIVITY_MENU, diffObject(), ScheduleModel

### Community 19 - "Business Position Tracking"
Cohesion: 0.12
Nodes (3): PosisiUsaha, formatDate(), getDefaultRange()

### Community 20 - "Member and Text Inputs"
Cohesion: 0.15
Nodes (12): MemberForm, TransactionForm, TextArea(), TextareaProps, Option, SelectSearch(), SelectSearchProps, MemberFormInput (+4 more)

### Community 22 - "Development Dependencies"
Cohesion: 0.13
Nodes (15): electron-log, devDependencies, electron-builder, electron-log, postcss, typescript, typescript-eslint, vite-plugin-electron-renderer (+7 more)

### Community 26 - "External Library Dependencies"
Cohesion: 0.18
Nodes (11): apexcharts, @fullcalendar/timegrid, @hookform/resolvers, ical, lucide-react, dependencies, apexcharts, @fullcalendar/timegrid (+3 more)

### Community 32 - "React Core Dependencies"
Cohesion: 0.22
Nodes (9): overrides, react-helmet-async, @react-jvectormap/core, @react-jvectormap/world, react, react, react-dom, react (+1 more)

### Community 35 - "Navigation and Layout Utilities"
Cohesion: 0.33
Nodes (4): GridShape(), ThemeTogglerTwo(), useGoBack(), NotFound()

### Community 36 - "Project Metadata"
Cohesion: 0.29
Nodes (6): icon, main, name, private, type, version

### Community 37 - "Avatar UI Components"
Cohesion: 0.33
Nodes (4): AvatarProps, sizeClasses, statusColorClasses, statusSizeClasses

### Community 38 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 39 - "NodeJS Environment Types"
Cohesion: 0.50
Nodes (3): NodeJS, ProcessEnv, Window

### Community 40 - "Documentation and Assets"
Cohesion: 0.50
Nodes (4): MIT License, TailAdmin React README, Calendar Icon, Chat Icon

### Community 41 - "Phone Input Component"
Cohesion: 0.50
Nodes (3): CountryCode, PhoneInput(), PhoneInputProps

## Knowledge Gaps
- **300 isolated node(s):** `PaginationProps`, `BadgeColor`, `BadgeProps`, `BadgeSize`, `BadgeVariant` (+295 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **79 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `electron` connect `Electron Main Process Configuration` to `Database and Environment Utilities`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Dependencies` to `Global Variables Config`, `Electron Main Process Configuration`, `Project Metadata`, `ESLint Core`, `ESLint JavaScript Config`, `ESLint React Hooks`, `ESLint React Refresh`, `Tailwind CSS Framework`, `Tailwind PostCSS Plugin`, `React Type Definitions`, `React DOM Types`, `Vite Build Tool`, `Vite Electron Plugin`, `Vite React Plugin`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `electron` connect `Electron Main Process Configuration` to `Development Dependencies`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `PaginationProps`, `BadgeColor`, `BadgeProps` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Hooks and Components` be split into smaller, more focused modules?**
  _Cohesion score 0.051150226559776926 - nodes in this community are weakly interconnected._
- **Should `Financial Reporting and Export` be split into smaller, more focused modules?**
  _Cohesion score 0.051590483827853514 - nodes in this community are weakly interconnected._
- **Should `Electron Main Process Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._