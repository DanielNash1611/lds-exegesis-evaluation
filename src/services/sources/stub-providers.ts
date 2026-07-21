import type { PropheticSourceCard, ScholarlySourceCard } from "../../schemas/sources.js";
import type { PropheticSourceProvider, ScholarshipProvider, SourceSearchQuery } from "./providers.js";

export class StubPropheticSourceProvider implements PropheticSourceProvider {
  async search(_query: SourceSearchQuery): Promise<PropheticSourceCard[]> {
    return [];
  }
}

export class StubScholarshipProvider implements ScholarshipProvider {
  async search(_query: SourceSearchQuery): Promise<ScholarlySourceCard[]> {
    return [];
  }
}
