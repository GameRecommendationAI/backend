import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";

const MAX_RETRIES = 3;
const TIMEOUT = 10000; // 10 seconds

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ${url}, ${retries} attempts left`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function searchWeb(query: string) {
  try {
    const searchUrl = `http://127.0.0.1:8080/search?q=${encodeURIComponent(
      query
    )}&format=json`;
    const res = await axios.get(searchUrl, { timeout: TIMEOUT });
    const json = res.data;

    if (!json.results || !Array.isArray(json.results)) {
      console.error("Invalid search results format");
      return [];
    }

    const urls = json.results.map((result: any) => result.url).slice(0, 3);
    const texts = [];

    for (const url of urls) {
      try {
        console.log(`Fetching ${url}`);
        const html = await fetchWithRetry(url);
        const text = htmlToText(html);
        if (text.trim()) {
          texts.push(`Source: ${url}\n${text}\n\n`);
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Error fetching ${url}:`, err.message);
        continue; // Skip failed URLs and continue with others
      }
    }

    return texts;
  } catch (error) {
    const err = error as Error;
    console.error("Error in searchWeb:", err.message);
    return [];
  }
}

function htmlToText(html: string) {
  try {
    // Create a virtual DOM using jsdom
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Create a Readability instance
    const article = new Readability(doc).parse();

    // Return the text content if available, otherwise return empty string
    return article?.textContent || "";
  } catch (error) {
    const err = error as Error;
    console.error("Error parsing HTML:", err.message);
    return "";
  }
}
