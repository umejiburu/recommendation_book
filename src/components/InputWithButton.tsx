'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQueryStore } from "@/store"
import { getRecommendations } from "./action"
import { stat } from "fs"

export function InputWithButton() {
  const query = useQueryStore((state) => state.query)
  const setQuery = useQueryStore((state) => state.setQuery)
  const setData = useQueryStore((state) => state.setData)


  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_KEY;
  
   
  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      try {
        const results = await getRecommendations({query})
        // setData(results)
        console.log('results from handleSubmit' + results);
        setQuery('')
      } catch (error) {
        console.log(error);
        
      }
   }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
      <Input type="text" placeholder="Search for books or authors ..." value={query}  onChange={(e) => setQuery(e.target.value)}/>
      <Button type="submit" variant="outline">
        Search
      </Button>
    </form>
  )
}
