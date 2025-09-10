'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQueryStore } from "@/store"
import { getRecommendations } from "./action"

export function InputWithButton() {
  const query = useQueryStore((state) => state.query)
  const setQuery = useQueryStore((state) => state.setQuery)
  const setData = useQueryStore((state) => state.setData)


  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!query.trim()) return;

      try {
        const results = await getRecommendations({query})
        console.log('API Results:', results);

        if (results.books || results.recommendations) {
          // Combine direct search results with AI recommendations
          const allBooks = [
            ...(results.books || []),
            ...(results.recommendations || [])
          ];

          console.log(`Setting ${allBooks.length} books to display`);
          setData(allBooks);
        } else {
          // No books found
          setData([]);
        }

        setQuery('')
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        setData([]); // Clear data on error
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
