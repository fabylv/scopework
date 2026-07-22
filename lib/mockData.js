/**
 * Sample data for previewing the app UI.
 * Used automatically when Supabase isn't configured yet.
 */

export const MOCK_PROJECTS = [
  {
    id: "mock-1",
    name: "123 Oak Ave — Full Renovation",
    address: "Miami, FL 33101",
    status: "analyzing",
    created_at: new Date().toISOString(),
    photos: [
      { id: "p1", public_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", status: "done" },
      { id: "p2", public_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400", status: "done" },
      { id: "p3", public_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400", status: "analyzing" },
    ],
    issues: [
      { id: "i1", project_id: "mock-1", description: "Roof shingles cracked and missing in 3 spots", category: "Roofing",     location: "North face of roof",       severity: "high",   estimated_cost: 3500, confidence: 0.92 },
      { id: "i2", project_id: "mock-1", description: "Water damage and mold behind shower wall",  category: "Plumbing",    location: "Master bathroom",          severity: "high",   estimated_cost: 2200, confidence: 0.88 },
      { id: "i3", project_id: "mock-1", description: "HVAC filter clogged, unit needs service",   category: "HVAC",        location: "Utility closet",           severity: "medium", estimated_cost: 450,  confidence: 0.95 },
      { id: "i4", project_id: "mock-1", description: "Drywall crack along living room ceiling",   category: "Structural",  location: "Living room",              severity: "medium", estimated_cost: 650,  confidence: 0.79 },
      { id: "i5", project_id: "mock-1", description: "Exterior paint peeling on south wall",      category: "Painting",    location: "South exterior wall",      severity: "low",    estimated_cost: 800,  confidence: 0.91 },
      { id: "i6", project_id: "mock-1", description: "Kitchen floor tiles cracked near sink",     category: "Flooring",    location: "Kitchen",                  severity: "low",    estimated_cost: 300,  confidence: 0.85 },
    ],
  },
  {
    id: "mock-2",
    name: "456 Palm Dr — Kitchen Remodel",
    address: "Coral Gables, FL 33134",
    status: "complete",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    photos: [
      { id: "p4", public_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", status: "done" },
      { id: "p5", public_url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400", status: "done" },
    ],
    issues: [
      { id: "i7", project_id: "mock-2", description: "Cabinet doors misaligned and hinges broken", category: "Other",       location: "Kitchen cabinets",         severity: "medium", estimated_cost: 420,  confidence: 0.90 },
      { id: "i8", project_id: "mock-2", description: "Garbage disposal not working",               category: "Plumbing",    location: "Kitchen sink",             severity: "medium", estimated_cost: 350,  confidence: 0.96 },
      { id: "i9", project_id: "mock-2", description: "Recessed light fixture flickering",          category: "Electrical",  location: "Kitchen ceiling",          severity: "low",    estimated_cost: 180,  confidence: 0.88 },
    ],
  },
  {
    id: "mock-3",
    name: "789 Biscayne Blvd — Unit 4B",
    address: "Brickell, FL 33131",
    status: "draft",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    photos: [],
    issues: [],
  },
];

export const MOCK_CONTRACTORS = [
  { id: "c1", name: "Carlos Mendez",   trade: "Plumber",      phone: "305-555-0101" },
  { id: "c2", name: "Mike Thompson",   trade: "Electrician",  phone: "305-555-0182" },
  { id: "c3", name: "Ana Gutierrez",   trade: "General",      phone: "305-555-0247" },
  { id: "c4", name: "Tony Roofworks",  trade: "Roofer",       phone: "305-555-0399" },
  { id: "c5", name: "Home Depot",      trade: "Supplies",     phone: "1-800-466-3337" },
  { id: "c6", name: "Lowe's",          trade: "Supplies",     phone: "1-800-445-6937" },
];

/** Returns true when Supabase is not fully configured. */
export function isMockMode() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    !url || url.includes("your-project-ref") || url.trim() === "" ||
    !key || key.includes("your-a") || key.trim() === ""
  );
}
