'use client'

import { useQueryStore } from "@/store"
import Image from "next/image"
import { Button } from "./ui/button"

export const BookDisplayed = () => {
    const data = useQueryStore((state) => state.data)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
        {data && data.length > 0 ? (
            data.map((book, index)=>(
                <div key={`${book.title}-${index}`} className="border rounded-lg p-4 shadow-md">
                    <div className="flex flex-col items-center space-y-2">
                        {book.thumbnail ? (
                            <Image
                                src={book.thumbnail}
                                alt={book.title}
                                width={128}
                                height={192}
                                className="object-cover rounded"
                            />
                        ) : (
                            <div className="w-32 h-48 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                        <h3 className="font-semibold text-center">{book.title}</h3>
                        {book.authors && book.authors.length > 0 && (
                            <p className="text-sm text-gray-600 text-center">
                                by {book.authors.join(', ')}
                            </p>
                        )}
                        {book.description && (
                            <p className="text-xs text-gray-500 text-center line-clamp-3">
                                {book.description.substring(0, 150)}...
                            </p>
                        )}
                        {book.previewLink && (
                            <Button
                                onClick={() => window.open(book.previewLink, '_blank')}
                                variant="outline"
                                size="sm"
                            >
                                View Details
                            </Button>
                        )}
                    </div>
                </div>
            ))
        ) : <p className="text-center text-gray-500">No books found. Try searching for something!</p>  }
    </div>
  )
}
