# Photonictag Design Guidelines

## Design Approach
**System-Based with Modern B2B Influence**
- Primary inspiration: Linear (clean, data-focused), Stripe (trust, clarity)
- Enterprise-grade SaaS aesthetic with consumer-friendly scan experience
- Emphasis on data hierarchy, efficiency, and trustworthiness

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts)
- Monospace: JetBrains Mono (for product IDs, batch numbers)

**Hierarchy:**
- Headings: font-semibold to font-bold, tight leading (leading-tight)
- Body: font-normal, relaxed leading (leading-relaxed)
- Data labels: text-xs to text-sm, uppercase tracking-wide for field labels
- Product IDs/codes: font-mono, letter-spacing for readability

**Scale:**
- Admin headings: text-2xl to text-3xl
- Section titles: text-lg to text-xl
- Body text: text-base
- Metadata/labels: text-sm to text-xs

## Layout & Spacing

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (within cards, data rows)
- Standard spacing: p-4, gap-4 (form fields, card padding)
- Section spacing: p-8, py-12 (between major sections)
- Generous spacing: p-16, py-24 (page-level containers)

**Grid Systems:**
- Admin dashboard: 2-column layout (sidebar + main content)
- Product lists: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Forms: Single column, max-w-2xl
- Data displays: Full-width tables with horizontal scroll

## Component Library

### Admin Dashboard
**Sidebar Navigation:**
- Fixed width: w-64
- Full height with logo at top
- Navigation items with icons (use Heroicons)
- Active state clearly indicated with subtle treatment
- Spacing: py-2 between items, px-4 internal padding

**Main Content Area:**
- Container: max-w-7xl with responsive padding (px-4 to px-8)
- Page header: mb-8 with title + action buttons aligned
- Content cards: rounded-lg, border, p-6

### Product Creation/Edit Forms
**Form Structure:**
- Vertical single-column layout
- Field groups separated by space-y-6
- Labels above inputs, text-sm font-medium
- Required field indicators
- Input fields: full width with consistent height (h-10 to h-12)
- Textarea for long content: min-h-32
- Multi-field rows (e.g., carbon footprint + repairability): grid-cols-2 gap-4

**Form Sections:**
1. Basic Information (name, manufacturer, batch)
2. Materials & Sustainability (materials, carbon footprint, repairability)
3. Lifecycle Data (warranty, recycling, ownership)
4. Media Upload (product images)

### Product List View
**Card Design:**
- Consistent card structure: rounded-lg border p-6
- Product image: aspect-square, rounded-md, mb-4
- Product name: text-lg font-semibold, truncate
- Metadata grid: 2-column for key data points
- QR code thumbnail in corner or separate section
- Action buttons: Edit/View/Delete in footer

**Table Alternative:**
- Striped rows for readability
- Sticky header: position-sticky top-0
- Column widths: balanced for product name, ID, manufacturer, actions
- Responsive: collapse to cards on mobile

### Public Scan Page
**Layout:**
- Centered content: max-w-4xl mx-auto
- Product image: Large, prominent display (aspect-video or aspect-square)
- Product name: text-3xl font-bold, mb-2
- Manufacturer: text-xl, mb-8
- Information sections in cards: space-y-6

**Information Display:**
- Icon + Label pattern for each data point
- Two-column grid for specifications: grid-cols-2 gap-x-8 gap-y-4
- Clear visual separation between sections
- Sustainability scores: Progress bars or circular indicators
- Warranty info: Highlighted card with border accent
- Recycling instructions: Step-by-step list with numbers

### QR Code Display
**Admin View:**
- Prominent placement in product detail
- Size: w-48 h-48 to w-64 h-64
- Download/print button directly below
- Product ID displayed beneath in monospace font

**Print Version:**
- Larger size for clarity
- Product name and ID included
- High contrast for scanning reliability

### AI-Generated Content
**Styling:**
- Distinct cards: rounded-lg with subtle border
- Icon indicator for AI-generated content
- Title: font-semibold with icon (sparkle/AI icon)
- Content: prose formatting with proper line-height
- Spacing: p-6, space-y-3 for paragraphs

### Data Visualization
**Metrics Display:**
- Card-based: grid-cols-2 md:grid-cols-4
- Large number: text-3xl font-bold
- Label below: text-sm
- Icon or graph when appropriate

**Sustainability Scoring:**
- Progress bars: h-2 rounded-full
- Percentage display: font-mono font-semibold
- Color-agnostic: rely on fill percentage, not color coding

### Buttons & Actions
**Primary Actions:**
- Consistent height: h-10 to h-12
- Padding: px-6
- Font: font-medium
- Rounded: rounded-lg
- Icon + text combination where appropriate

**Secondary/Tertiary:**
- Ghost/outline variants
- Consistent sizing with primary
- Clear hierarchy through border/background treatment

### Navigation
**Top Bar (Admin):**
- Height: h-16
- Logo + breadcrumbs on left
- User menu + notifications on right
- Border bottom for separation

**Tabs:**
- Horizontal tabs for section switching
- Active state: border-b-2 treatment
- Spacing: px-4 py-2 per tab

## Interaction Patterns

**Loading States:**
- Skeleton screens for product cards
- Spinner for form submissions
- Progress indicators for file uploads

**Empty States:**
- Centered icon + message
- Call-to-action button
- Helpful context (e.g., "Create your first product")

**Validation:**
- Inline error messages below fields
- Error state: border treatment on inputs
- Success confirmation: Toast notifications

## Responsive Behavior

**Breakpoints:**
- Mobile: Single column, stacked layouts
- Tablet (md:): 2-column grids, condensed sidebar
- Desktop (lg:): Full layouts, 3-column grids

**Mobile Adjustments:**
- Sidebar: Collapse to hamburger menu
- Tables: Transform to card stack
- Forms: Maintain single column
- Reduce padding: scale from p-4 to p-2

## Images

**Product Images:**
- Admin: Square thumbnails (aspect-square) in lists, larger in detail view
- Scan page: Hero image at top, aspect-video or 16:9, full width of content area
- Upload: Clear dropzone with preview
- Fallback: Icon-based placeholder for products without images

**No large hero sections needed** - This is a functional application focused on product data display and management. Image usage is primarily for product photography within content areas.