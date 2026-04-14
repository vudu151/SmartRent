# Changelog

## [2026-04-14]
### Added
- Created `.brain` directory for persistent project knowledge storage.
- Implemented Dark Mode toggle inside the Dashboard Configurator drawer.

### Changed
- **Global Layout Tightening:** Updated dashboard spacing to a symmetric 8px grid (container padding, sidebar margins).
- **Navbar Overhaul:** 
    - Removed Breadcrumbs and Page Title text for a minimalist look.
    - Removed Settings and Dark Mode icons (migrated to Configurator).
    - Aligned Navbar top edge perfectly with Sidebar (8px from top).
- **Sidebar Modernization:** Updated active item color to Gradient Gray to match the system theme.
- **Listing Modules Optimization:**
    - Refactored `Tenants`, `Rooms`, `Residents`, `Bills`, `Users`, and `Contracts` to use a `h-full` (Fixed Height) container.
    - Enabled internal table scrolling inside `CardBody` while keeping `CardHeader` fixed.
    - Updated all module headers to use the consistent Dark Gradient pattern.

### Fixed
- Resolved layout scrolling issue where the entire page scrolled instead of the internal table.
- Corrected asymmetric margins between the sidebar and the main content card.
