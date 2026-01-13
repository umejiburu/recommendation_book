import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface GoogleBookItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    previewLink?: string;
    categories?: string[];
  };
}

interface Book {
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  previewLink?: string;
  categories?: string[];
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_KEY;



// Fetch books from Google Books API
async function fetchBooksFromGoogle(query: string, maxResults = 5): Promise<Book[]> {
  const url = GOOGLE_API_KEY
    ? `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&key=${GOOGLE_API_KEY}`
    : `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`;

  // console.log('Fetching from Google Books:', url);

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log('Number of items found:', data?.totalItems || 0);

    if (!data?.items || data.items.length === 0) {
      console.log('No books found for query:', query);
      return [];
    }

    return data.items.map((item: GoogleBookItem): Book => {
      const book = item.volumeInfo;
      return {
        title: book.title || 'Unknown Title',
        authors: book.authors || [],
        description: book.description || 'No description available',
        thumbnail: book.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        previewLink: book.previewLink,
        categories: book.categories || []
      };
    });
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    return [];
  }
}

// Get book recommendations from Gemini AI
async function getGeminiRecommendations(query: string, foundBooks: Book[]) {
  try {
    // Extract genres/categories from found books
    const genres = foundBooks.flatMap(book => book.categories || []).join(', ');
    const bookTitles = foundBooks.map(book => `${book.title} by ${book.authors.join(', ')}`).join(', ');
    console.log('this is genre' + genres);
    console.log('this is bookTitles' + bookTitles);
    

    const prompt = `Based on the search query "${query}" and these books found: ${bookTitles}

    Main genres: ${genres}

    Please recommend 5 similar books that users might also enjoy. Focus on the same genre or theme.
    Return ONLY a JSON array of book titles (with author if known), like:
    ["Book Title by Author", "Another Book by Author", ...]

    Do not include any books that were already found. Make sure the response is valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    // Clean and parse the JSON response
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(cleanText);
    console.log('recommrndation from gemini' + recommendations);
    

    if (Array.isArray(recommendations)) {
      console.log('Gemini recommendations:', recommendations);
      return recommendations.slice(0, 5); // Limit to 5 recommendations
    }

    return [];
  } catch (error) {
    console.error('Error getting Gemini recommendations:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, category } = await req.json();

    console.log('API Request:', { query, category });

    // Handle category-based search
    if (category) {
      const books = await fetchBooksFromGoogle(`subject:${category}`, 8);
      return NextResponse.json({
        books,
        type: 'category',
        query: category
      });
    }

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    // console.log('Processing search for:', searchQuery);

    // Step 1: Search Google Books for the user's query
    const directBooks = await fetchBooksFromGoogle(searchQuery, 5);

    if (directBooks.length === 0) {
      return NextResponse.json({
        books: [],
        recommendations: [],
        message: "No books found for your search query",
        query: searchQuery
      });
    }

    console.log(`Found ${directBooks.length} direct matches`);

    // Step 2: Get AI recommendations based on found books
    let recommendedBooks: Book[] = [];
    try {
      const recommendationTitles = await getGeminiRecommendations(searchQuery, directBooks);
      console.log('recommendatioTitle' + recommendationTitles);
      

      if (recommendationTitles.length > 0) {
        // Fetch details for each recommended book
        const recommendationPromises = recommendationTitles.map(title =>
          fetchBooksFromGoogle(title, 1)
        );

        const recommendationResults = await Promise.allSettled(recommendationPromises);

        recommendedBooks = recommendationResults
          .filter((result): result is PromiseFulfilledResult<Book[]> =>
            result.status === 'fulfilled' && result.value.length > 0
          )
          .map(result => result.value[0])
          .filter(book =>
            // Filter out books that are already in direct results
            !directBooks.some(directBook =>
              directBook.title.toLowerCase() === book.title.toLowerCase()
            )
          );

        console.log(`Found ${recommendedBooks.length} AI recommendations`);
      }
    } catch (error) {
      console.warn('Failed to get AI recommendations:', error);
    }

    // Step 3: Return comprehensive results
    return NextResponse.json({
      books: directBooks,
      recommendations: recommendedBooks,
      query: searchQuery,
      totalFound: directBooks.length,
      totalRecommendations: recommendedBooks.length,
      type: 'search'
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}