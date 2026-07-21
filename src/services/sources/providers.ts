import type { Depth } from "../../schemas/common.js";
import type { PropheticSourceCard, ScholarlySourceCard } from "../../schemas/sources.js";

export type SourceSearchQuery = {
  topic?: string;
  passage?: string;
  depth: Depth;
};

export interface PropheticSourceProvider {
  search(query: SourceSearchQuery): Promise<PropheticSourceCard[]>;
}

export interface ScholarshipProvider {
  search(query: SourceSearchQuery): Promise<ScholarlySourceCard[]>;
}
