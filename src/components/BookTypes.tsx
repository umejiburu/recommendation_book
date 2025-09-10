'use client'
import React from 'react'
import { Button } from './ui/button'
import { useQueryStore } from '@/store'
import { getRecommendations } from './action'

export function BookTypes() {
    const query = useQueryStore((state) => state.query)
    const setData = useQueryStore((state) => state.setData)

    async function handleCategoryClick(category: string){
      try {
        const res = await getRecommendations({category})
        console.log('Category results:', res);

        if (res.books) {
          setData(res.books);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setData([]);
      }
    }

  return (
    <div className="">
        <div className='flex gap-3 items-center flex-wrap'>
            <Button onClick={()=>handleCategoryClick('fiction')} variant="outline">Fiction</Button>
            <Button onClick={()=>handleCategoryClick('non-fiction')} variant="outline">Non-Fiction</Button>
            <Button onClick={()=>handleCategoryClick('fantasy')} variant="outline">Fantasy</Button>
            <Button onClick={()=>handleCategoryClick('mystery')} variant="outline">Mystery</Button>
            <Button onClick={()=>handleCategoryClick('romance')} variant="outline">Romance</Button>
            <Button onClick={()=>handleCategoryClick('horror')} variant="outline">Horror</Button>
            <Button onClick={()=>handleCategoryClick('classics')} variant="outline">Classics</Button>
            <Button onClick={()=>handleCategoryClick('science fiction')} variant="outline">Sci-Fi</Button>
        </div>
        {query && <p>Search Results for &quot;{query}&quot;</p>}

    </div>
  )
}