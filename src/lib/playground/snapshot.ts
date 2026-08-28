/**
 * Typed access to the vendored playground snapshot. Server-only: the API
 * route imports this; client components receive results over HTTP.
 */

import "server-only";
import rawSnapshot from "./data/snapshot.json";

export interface PlaygroundSnapshot {
  generatedAt: string;
  source: string;
  timeline: string;
  strands: Record<string, string[]>;
  currentCard: string;
  direction: string | null;
  mutations: string | null;
  slices: Record<string, { core: string; previously: string }>;
}

export const snapshot = rawSnapshot as PlaygroundSnapshot;
