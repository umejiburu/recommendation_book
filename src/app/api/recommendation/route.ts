import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { promises } from "dns";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"



async function fetchBooksFromGoogle(query: string, bySubject = false){
  const url = bySubject ? `${GOOGLE_BOOKS_API}?q=subject:${encodeURIComponent(
        query
      )}&maxResults=5&orderBy=relevance&key=${GOOGLE_API_KEY}` :  `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
        query
      )}&maxResults=5&orderBy=relevance&key=${GOOGLE_API_KEY}`
      const res = await fetch(url)
      const data = await res.json()

      if(!data?.items) return []
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        // console.log(book);
        
        return {
          title: book.title,
          authors: book.authors || [],
          description: book.description || "",
          thumbnail: book.imageLinks?.thumbnail || null,
          previewLink: book.previewLink,
        };
      } else {
        return null;
      }
}

export async function POST(req: NextRequest) {
  try {
    const { query, category } = await req.json();
    if (category) {
      const books = await fetchBooksFromGoogle(category, true);
      return NextResponse.json({ books });
    }

    // ✅ Case 2: Query required
    if (!query) {
      return NextResponse.json(
        { error: "Query or category required" },
        { status: 400 }
      );
    }

    // ✅ Try Gemini first
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          systemInstruction: `Recommend 5 popular books based on: ${query}. 
            Return only the book titles in a clean JSON array.`,
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
        },
      });
    } catch (err) {
      console.warn("Gemini failed, falling back to Google Books:", err.message);
      const books = await fetchBooksFromGoogle(query, false);
      return NextResponse.json({ books, fallback: true });
    }

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    let recommendations: string[] = [];
    try {
      const cleanText =
        text?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
      recommendations = JSON.parse(cleanText);
    } catch {
      return NextResponse.json(
        { error: "Gemini did not return valid JSON", raw: text },
        { status: 500 }
      );
    }

    // ✅ Fetch books for each recommendation
    const bookDetails = await Promise.allSettled(
      recommendations.map(async (rec) => {
        try {
          const data = await fetchBooksFromGoogle(rec);
          return {
            recommendation: rec,
            results: data,
          };
        } catch (err) {
          console.error("Error fetching from Google Books:", rec, err);
          return {
            recommendation: rec,
            error: true,
          };
        }
      })
    );

    console.log(bookDetails);
    
    // ✅ Only one response returned
    return NextResponse.json({ recommendations: bookDetails});

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}




// export async function POST(req: NextRequest) {
//   try {
//     const { query, category } = await req.json();

//     // ✅ Case 1: Category button clicked (skip Gemini, fetch directly)
//     if (category) {
//       const url = `${GOOGLE_BOOKS_API}?q=subject:${encodeURIComponent(
//         category
//       )}&maxResults=5&orderBy=relevance&key=${GOOGLE_API_KEY}`;

//       const res = await fetch(url);
//       const data = await res.json();

//       if (!data.items) {
//         return NextResponse.json({ books: [] });
//       }

//       const books = data.items.map((item: any) => {
//         const info = item.volumeInfo;
//         return {
//           title: info.title,
//           authors: info.authors || [],
//           description: info.description || "",
//           thumbnail: info.imageLinks?.thumbnail || null,
//           previewLink: info.previewLink,
//         };
//       });

//       return NextResponse.json({ books });
//     }

//     // ✅ Case 2: User provided query → use Gemini
//     if (!query) {
//       return NextResponse.json({ error: "Query or category required" }, { status: 400 });
//     }

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: query,
//       config: {
//         systemInstruction: `Recommend 5 popular books based on: ${query}. 
//           Return only the book titles (and author if available) in a clean JSON array, like:
//           ["Title by Author", "Title by Author"]`,
//         temperature: 0.9,
//         topP: 0.95,
//         topK: 40,
//       },
//     });

//     const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

//     let recommendations: string[] = [];
//     try {
//       const cleanText = text?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
//       recommendations = JSON.parse(cleanText);
//     } catch {
//       return NextResponse.json(
//         { error: "Gemini did not return valid JSON", raw: text },
//         { status: 500 }
//       );
//     }

//     const bookDetails = await Promise.allSettled(
//       recommendations.map(async (rec) => {
//         try {
//           const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
//             rec
//           )}&key=${GOOGLE_API_KEY}`;
//           const res = await fetch(url);
//           const data = await res.json();

//           if (data.items && data.items.length > 0) {
//             const book = data.items[0].volumeInfo;
//             return {
//               recommendation: rec,
//               title: book.title,
//               authors: book.authors || [],
//               description: book.description || "",
//               thumbnail: book.imageLinks?.thumbnail || null,
//               previewLink: book.previewLink,
//             };
//           } else {
//             return { recommendation: rec, notFound: true };
//           }
//         } catch {
//           return { recommendation: rec, error: true };
//         }
//       })
//     );

//     return NextResponse.json({ recommendations: bookDetails });
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
