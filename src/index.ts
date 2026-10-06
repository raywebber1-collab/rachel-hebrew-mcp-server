import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";

const CORPUS_BASE =
  "https://rachel-hebrew-corpus.raywebber1.workers.dev";

function createServer() {
  const server = new McpServer({
    name: "rachel-hebrew-corpus",
    version: "1.0.0"
  });

  server.registerTool(
    "search_hebrew_lemma",
    {
      description:
        "Search Rachel's Hebrew Bible corpus for every occurrence of an OSHB lemma number. Returns references, Hebrew words, lemma forms, morphology, totals, and whether the result is exhaustive.",
      inputSchema: z.object({
        lemma: z.string().describe(
          "OSHB lemma number, for example 4150"
        )
      })
    },
    async ({ lemma }) => {
      const url =
        `${CORPUS_BASE}/search?lemma=${encodeURIComponent(lemma)}`;

      const response = await fetch(url);

      if (!response.ok) {
  const body = await response.text();

  return {
    content: [{
      type: "text",
      text:
        `Corpus search failed.\n` +
        `Requested URL: ${url}\n` +
        `Response URL: ${response.url}\n` +
        `Status: ${response.status} ${response.statusText}\n` +
        `Body: ${body.slice(0, 1000)}`
    }],
    isError: true
  };
}

      const data = await response.json();

      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "get_hebrew_context",
    {
      description:
        "Retrieve the complete Hebrew corpus data for a specific biblical reference, including the Hebrew words, lemmas, and morphology.",
      inputSchema: z.object({
        reference: z.string().describe(
          "Biblical reference in corpus format, for example Gen.1.14"
        )
      })
    },
    async ({ reference }) => {
      const url =
        `${CORPUS_BASE}/context?reference=${encodeURIComponent(reference)}`;

      const response = await fetch(url);

      if (!response.ok) {
        return {
          content: [{
            type: "text",
            text: `Context lookup failed: ${response.status} ${response.statusText}`
          }],
          isError: true
        };
      }

      const data = await response.json();

      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "search_hebrew_lemma_context",
    {
      description:
        "Search Rachel's Hebrew Bible corpus for an OSHB lemma and return occurrences together with their verse context.",
      inputSchema: z.object({
        lemma: z.string().describe(
          "OSHB lemma number, for example 4150"
        )
      })
    },
    async ({ lemma }) => {
      const url =
        `${CORPUS_BASE}/search-context?lemma=${encodeURIComponent(lemma)}`;

      const response = await fetch(url);

      if (!response.ok) {
        return {
          content: [{
            type: "text",
            text: `Lemma context search failed: ${response.status} ${response.statusText}`
          }],
          isError: true
        };
      }

      const data = await response.json();

      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)
        }]
      };
    }
  );

  return server;
}

export default createMcpHandler(createServer);
