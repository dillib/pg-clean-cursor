# Photonictag Design Guidelines

## Design Approach
**Premium B2B SaaS Aesthetic**
- Primary inspiration: Linear (clean precision), Stripe (trust, clarity), Vercel (modern minimalism)
- Enterprise-grade platform balancing authority with approachability
- Emphasis on data hierarchy, sophisticated simplicity, and visual credibility

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (product IDs, batch codes, technical data)

**Hierarchy:**
- Marketing headlines: text-4xl to text-6xl, font-bold, leading-tight, tracking-tight
- Dashboard headings: text-2xl to text-3xl, font-semibold
- Section titles: text-lg to text-xl, font-medium
- Body text: text-base, leading-relaxed
- Data labels: text-xs to text-sm, uppercase, tracking-wide, font-medium
- Technical data: font-mono, text-sm

## Layout & Spacing

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 24, 32
- Component internal: p-2 to p-4
- Card padding: p-6 to p-8
- Section spacing: py-12 to py-24 (responsive: py-8 mobile to py-24 desktop)
- Page containers: max-w-7xl with px-4 to px-8

**Grid Systems:**
- Marketing: Full-width sections with inner max-w-7xl containers
- Dashboard: Fixed sidebar (w-64) + main content area
- Feature grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: Full-width with horizontal scroll, sticky headers

## Marketing & Landing Pages

### Hero Section
**Layout:**
- Full viewport height (90vh to 100vh)
- Two-column split: lg:grid-cols-2, gap-12
- Left: Headline (text-5xl lg:text-6xl) + subheading (text-xl) + CTA stack
- Right: Hero visualization (dashboard screenshot, product passport mockup, or abstract data viz)
- Background: Subtle gradient mesh with geometric elements
- Buttons on hero images: Backdrop blur (backdrop-blur-md) with semi-transparent background

**Content Strategy:**
- Headline: Bold value proposition (e.g., "Digital Product Passports for the Circular Economy")
- Subheading: 2-3 lines clarifying offering
- Dual CTAs: Primary ("Start Free Trial") + Secondary ("Watch Demo" or "Schedule Consultation")
- Trust indicators: "Trusted by 500+ manufacturers" with logo strip below

### Feature Sections
**Two-Column Feature Blocks:**
- Alternating image/content layout
- Content side: Icon + heading (text-2xl) + description + feature list (3-4 bullets) + CTA link
- Image side: Product screenshots, data visualizations, or conceptual illustrations
- Spacing: py-24, gap-16 between sections

**Three-Column Feature Grid:**
- Cards with icon, title, description
- Icons from Heroicons (outline style)
- Consistent card heights, p-8 padding
- Hover state: subtle lift and border treatment

### Data Visualization Showcase
**Section Structure:**
- Full-width container with heading
- Interactive dashboard preview (large screenshot or live component)
- Three-metric highlights below: grid-cols-3, emphasizing key capabilities
- Each metric: Large number (text-4xl font-bold) + label + micro-description

### Trust & Social Proof
**Customer Logos:**
- Grid-cols-3 md:grid-cols-6, grayscale treatment
- Consistent sizing, centered alignment

**Testimonial Cards:**
- Two-column grid (lg:grid-cols-2)
- Quote + attribution + company logo
- Generous padding (p-8), subtle border

**Case Study Preview:**
- Horizontal card with image + content split
- Metrics callout: "67% reduction in supply chain opacity"
- Read more link with arrow icon

### Footer (Enhanced)
**Multi-Column Layout:**
- Four-column grid: Product links, Resources, Company, Contact
- Newsletter signup: Full-width component above columns with email input + subscribe button
- Bottom bar: Copyright + privacy links + social icons (LinkedIn, Twitter)
- Spacing: py-16 with py-8 bottom bar

## Dashboard & Admin Interface

### Sidebar Navigation
- Fixed position, w-64, full height
- Logo at top (p-6)
- Navigation groups with section headers (text-xs uppercase tracking-wide)
- Navigation items: Heroicons + label, py-2 px-4, rounded-md
- Active state: subtle background treatment
- Bottom: User profile card with avatar + name + role

### Dashboard Home
**Metrics Cards:**
- Grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: Large metric number (text-3xl font-bold) + percentage change indicator + sparkline graph
- Card structure: p-6, rounded-lg, border

**Activity Feed:**
- Two-column layout: Main feed (2/3 width) + Recent activity sidebar (1/3)
- Feed items: Timeline with icons, truncated descriptions, timestamp
- Sidebar: Compact list with micro-interactions

### Product Management

**Product List View:**
- Table with columns: Thumbnail, Name, Batch ID, Manufacturer, Sustainability Score, Status, Actions
- Sticky header, striped rows, hover state
- Filters bar above: Search + dropdown filters (category, status, manufacturer)
- Batch actions: Checkbox selection with action bar

**Product Detail:**
- Breadcrumb navigation
- Header: Product name (text-3xl) + status badge + action buttons (Edit, Generate QR, Export)
- Content sections in cards: Basic Info, Sustainability Metrics, Materials, Lifecycle, Media Gallery
- Two-column grid for specifications within cards
- QR code prominent display: w-64 h-64 with download button

**Product Form:**
- Single column, max-w-3xl centered
- Form sections with headings + dividers
- Field groups: space-y-6
- Multi-field rows: grid-cols-2 gap-4 (e.g., Carbon Footprint + Repairability Score)
- Media upload: Dropzone with preview grid
- AI content generation: Trigger button + loading state + generated content in distinct card with AI badge
- Fixed bottom action bar: Cancel + Save buttons

### Data Visualization Components

**Sustainability Dashboard:**
- Score cards with progress rings (circular indicators)
- Comparison charts: Bar charts comparing products or batches
- Timeline visualization: Lifecycle events and milestones
- Material composition: Donut chart with legend

**Supply Chain Map:**
- Interactive flowchart or geographic map
- Node-based visualization with connection lines
- Tooltip on hover with detailed information

## Public Scan Experience

**Scan Page Layout:**
- Centered content: max-w-4xl
- Hero product image: Full-width, aspect-video, rounded-lg, mb-8
- Product name: text-4xl font-bold + manufacturer (text-xl)
- Information architecture: Tabbed sections (Overview, Sustainability, Lifecycle, Repair & Recycle)
- Each tab content in cards with icon-label pairs
- Sustainability score: Prominent progress bars with percentage labels
- Warranty card: Highlighted with border accent, includes dates and coverage details
- Recycling instructions: Numbered steps with icons
- Footer: "Powered by Photonictag" with logo

## Images & Media

**Hero Images:**
- Marketing hero: Dashboard screenshot mockup, abstract data visualization, or product passport concept
- Aspect ratio: 16:9 or custom to fit layout
- High-quality, professional photography or 3D renders

**Feature Section Images:**
- Product screenshots with subtle shadow and border
- Data visualizations showing platform capabilities
- Conceptual illustrations for abstract concepts (trust, traceability, circularity)

**Product Photography:**
- Admin thumbnails: aspect-square, rounded-md
- Scan page: aspect-video hero image
- Fallback: Icon-based placeholder with product category icon

**Background Elements:**
- Subtle gradient meshes in hero sections
- Geometric patterns (dots, lines) for visual interest without distraction
- No large decorative illustrations competing with content

## Responsive Behavior

- Mobile: Single column, hamburger navigation, stacked metrics, card-based tables
- Tablet (md:): Two-column grids, condensed sidebar
- Desktop (lg:): Full layouts, three-column grids, expanded data tables
- Padding scales: p-4 mobile to p-8 desktop
- Font sizes scale: text-4xl mobile to text-6xl desktop for headlines

## Component Enrichment

- **Headers:** Logo + navigation + "Get Started" CTA + social proof indicator
- **Footers:** Links + newsletter + contact info + trust badges (SOC 2, ISO certifications)
- **CTA Sections:** Primary message + supporting bullet points + dual action buttons + trust reinforcement
- **Feature Cards:** Icon (Heroicons) + title + description + supporting metrics + learn more link
- **Form Sections:** Field labels + help text + validation messaging + character counts for textareas