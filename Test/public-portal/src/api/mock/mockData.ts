/**
 * DEV-ONLY SAMPLE DATA — loaded only when VITE_USE_MOCK=true in development.
 * Tree-shaken out of production builds. Replace by pointing VITE_API_BASE_URL at the real backend.
 */
import type { Category, Product, Project } from '@/types';
import { placeholderArt } from '@/utils/placeholder';

const cat = (name: string): Category => ({ id: name.toLowerCase(), name, slug: name.toLowerCase() });
const lighting = cat('Lighting');
const furniture = cat('Furniture');
const hardware = cat('Hardware');
const surfaces = cat('Surfaces');

export const mockCategories: Category[] = [lighting, furniture, hardware, surfaces];

const art = (seed: string, label: string, n = 3) => Array.from({ length: n }, (_, i) => placeholderArt(`${seed}-${i}`, i === 0 ? label : ''));

const p = (
  id: string,
  name: string,
  category: Category,
  price: number | null,
  summary: string,
  extra: Partial<Product> = {},
): Product => ({
  id,
  slug: id,
  name,
  summary,
  description: `${summary} Finished by hand and quality-checked before it leaves the workshop. Available in custom sizes and finishes on request.`,
  price,
  currency: 'INR',
  images: art(id, name),
  modelUrl: null,
  category,
  availability: 'in_stock',
  specs: [
    { label: 'Material', value: 'Brushed brass & oak' },
    { label: 'Finish', value: 'Satin, hand-polished' },
    { label: 'Dimensions', value: '420 × 420 × 280 mm' },
    { label: 'Warranty', value: '5 years' },
  ],
  variants: [
    { name: 'Finish', options: ['Brass', 'Graphite', 'Bronze'] },
    { name: 'Size', options: ['Small', 'Medium', 'Large'] },
  ],
  featured: false,
  ...extra,
});

export const mockProducts: Product[] = [
  p('atlas-pendant', 'Atlas Pendant', lighting, 18900, 'A sculpted pendant with a warm, diffused glow.', { featured: true, modelUrl: 'procedural:knot' }),
  p('meridian-lamp', 'Meridian Floor Lamp', lighting, 24500, 'Slender floor lamp with a weighted base.', { featured: true, modelUrl: 'procedural:orb' }),
  p('halo-sconce', 'Halo Wall Sconce', lighting, 9200, 'Ring sconce that washes walls in soft light.', { availability: 'low_stock' }),
  p('forma-chair', 'Forma Lounge Chair', furniture, 42000, 'Low-slung lounge chair in solid oak.', { featured: true, availability: 'made_to_order' }),
  p('strata-table', 'Strata Dining Table', furniture, 96000, 'Layered-edge table that seats eight.', { featured: true }),
  p('nook-shelf', 'Nook Shelving', furniture, null, 'Modular shelving, configured to your wall.', { availability: 'made_to_order' }),
  p('ridge-handle', 'Ridge Door Handle', hardware, 3400, 'Machined handle with a knurled grip.'),
  p('keystone-hinge', 'Keystone Hinge Set', hardware, 1800, 'Concealed hinges rated for heavy doors.', { availability: 'out_of_stock' }),
  p('terra-slab', 'Terra Stone Slab', surfaces, 12800, 'Honed composite slab with natural veining.'),
  p('lumen-panel', 'Lumen Wall Panel', surfaces, 7600, 'Acoustic wall panel in textured oak veneer.', { featured: true }),
];

const pr = (
  id: string,
  title: string,
  category: Category,
  summary: string,
  completedOn: string,
  extra: Partial<Project> = {},
): Project => ({
  id,
  slug: id,
  title,
  summary,
  overview: `${summary} From first sketch to final installation, the project was delivered in close collaboration with the client, balancing material character, function and schedule.`,
  objectives: ['Create a distinctive, durable result', 'Deliver on time with minimal site disruption', 'Use materials that age gracefully'],
  category,
  images: art(id, title, 4),
  completedOn,
  location: 'Chennai, India',
  client: null,
  services: ['Design', 'Fabrication', 'Installation'],
  specs: [
    { label: 'Area', value: '2,400 sq ft' },
    { label: 'Duration', value: '14 weeks' },
    { label: 'Materials', value: 'Oak, brass, stone' },
  ],
  featured: false,
  ...extra,
});

export const mockProjects: Project[] = [
  pr('harbour-residence', 'Harbour Residence', cat('Residential'), 'A coastal home finished in oak, brass and honed stone.', '2026-03-01', { featured: true }),
  pr('foundry-lofts', 'Foundry Lofts', cat('Commercial'), 'Adaptive reuse of a former foundry into open workspaces.', '2025-11-01', { featured: true }),
  pr('lumen-gallery', 'Lumen Gallery', cat('Hospitality'), 'A gallery café with bespoke lighting and joinery.', '2026-01-01', { featured: true }),
  pr('cedar-clinic', 'Cedar Clinic', cat('Commercial'), 'Calm, durable interiors for a multi-specialty clinic.', '2025-08-01'),
  pr('orchard-villa', 'Orchard Villa', cat('Residential'), 'A villa with a fully custom kitchen and library.', '2025-05-01'),
  pr('atrium-lobby', 'Atrium Lobby', cat('Hospitality'), 'Double-height lobby with a signature pendant cluster.', '2024-12-01'),
];
