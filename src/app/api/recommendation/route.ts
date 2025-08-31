import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_KEY;



export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: `Recommend 5 popular books based on: ${query}. 
          Return only the book titles (and author if available) in a clean JSON array, like:
          ["Title by Author", "Title by Author"]`,
          temperature: 0.9,  
          topP: 0.95,         
          topK: 40, 
      },
    });

  
    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text;
    let recommendations: string[] = [];

   try {
  // Clean response text: remove ```json ... ```
  const cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  recommendations = JSON.parse(cleanText);
  console.log("Gemini response recommendations:", recommendations);
} catch {
  console.error("Invalid JSON from Gemini:", text);
  return NextResponse.json(
    { error: "Gemini did not return valid JSON", raw: text },
    { status: 500 }
  );
}
   const bookDetails = await Promise.allSettled(
      recommendations.map(async (rec) => {
        try {
          const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
            rec
          )}&key=${GOOGLE_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            // console.log(book);
            
            return {
              recommendation: rec, 
              title: book.title,
              authors: book.authors || [],
              description: book.description || "",
              thumbnail: book.imageLinks?.thumbnail || null,
              previewLink: book.previewLink,
            };
          } else {
            return { recommendation: rec, notFound: true };
          }
        } catch (err) {
          console.error(`Error fetching Google Books for ${rec}:`, err);
          return { recommendation: rec, error: true };
        }
      })
    );


    return NextResponse.json({ recommendations: bookDetails });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

