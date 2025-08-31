'use client'

import { useQueryStore } from "@/store"
import Image from "next/image"
import { Button } from "./ui/button"

export const BookDisplayed = () => {
    const data = useQueryStore((state) => state.data)
  return (
    <div>
        {data && data.length > 0 ? (
            data.map((book)=>(
                <div key={book.id}>
                    <div>
                        <Image src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} width={100} height={100}/>
                        <p>{book.volumeInfo.title}</p>
                        <p>{book.volumeInfo.authors}</p>
                        <Button>View details</Button>
                    </div>
                </div>
            ))
        ) : <p>No books found.</p>  }
    </div>
  )
}
