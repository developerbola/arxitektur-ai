export type Point2D = {
  id: string;
  x: number;
  y: number;
};

export type LineSegment = {
  start: Point2D;
  end: Point2D;
};

export const PIXELS_PER_METER = 50;
export const SNAP_STEP_METERS = 0.05;

export const metersToPixels = (m: number, scale: number = PIXELS_PER_METER) => m * scale;
export const pixelsToMeters = (px: number, scale: number = PIXELS_PER_METER) => px / scale;

export const snapMeters = (m: number, step: number = SNAP_STEP_METERS) => {
  return Math.round(m / step) * step;
};

export const formatMeters = (m: number) => `${m.toFixed(2)} m`;

/**
 * Calculate the Euclidean distance between two points.
 */
export const getDistance = (p1: Point2D, p2: Point2D): number => {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
};

/**
 * Calculates the shortest distance from a point to a line segment.
 * Useful for checking if the mouse is near an edge/wall.
 */
export const getPointToSegmentDistance = (p: Point2D, s: LineSegment): { distance: number; projection: Point2D } => {
  const { start: v, end: w } = s;
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  
  if (l2 === 0) return { distance: getDistance(p, v), projection: v };
  
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  
  const projection = {
    id: `proj_${Date.now()}`,
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  };
  
  return {
    distance: getDistance(p, projection),
    projection
  };
};

/**
 * Finds the intersection point of two line segments, if any.
 */
export const getIntersection = (s1: LineSegment, s2: LineSegment): Point2D | null => {
  const { start: p1, end: p2 } = s1;
  const { start: p3, end: p4 } = s2;

  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null; // Lines are parallel

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      id: `intersect_${Date.now()}`,
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y)
    };
  }

  return null;
};

/**
 * Snaps a single dimension (x or y) to a grid spacing.
 */
export const snapToGrid = (value: number, gridSize: number = 20): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Given a set of points and a target, find if we can snap to an existing point.
 */
export const getPointSnap = (target: Point2D, availablePoints: Point2D[], threshold: number = 15): Point2D | null => {
  let closest: Point2D | null = null;
  let minDistance = Infinity;

  availablePoints.forEach(p => {
    // Avoid snapping to self if id matches (if target already has an ID)
    if (target.id && p.id === target.id) return;
    
    const d = getDistance(target, p);
    if (d < minDistance && d < threshold) {
      minDistance = d;
      closest = p;
    }
  });

  return closest;
};

/**
 * Simple signed polygon area calculator algorithm (Shoelace).
 */
export const getPolygonArea = (points: Point2D[]): number => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};
