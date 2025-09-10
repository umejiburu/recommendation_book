'use client'
import React from 'react'
import { Button } from './ui/button'
import { useQueryStore } from '@/store'
import { getRecommendations } from './action'

export function BookTypes() {
    const query = useQueryStore((state) => state.query)
    
    async function handleCategoryClick(category: string){
      const res = await getRecommendations({category})
      console.log(res);
    }
    
  return (
    <div className="">
        <div className='flex gap-3 items-center'>
            <Button onClick={()=>handleCategoryClick('fiction')} variant="outline">Fiction</Button>
            <Button onClick={()=>handleCategoryClick('non-fiction')} variant="outline">Non-Fiction</Button>
            <Button onClick={()=>handleCategoryClick('fantasy')} variant="outline">Fantasy</Button>
            <Button onClick={()=>handleCategoryClick('mystery')} variant="outline">Mystery</Button>
            <Button variant="outline">Romance</Button>
            <Button variant="outline">Horror</Button>
            <Button variant="outline">Classics</Button>
        </div>
        {query && <p>Search Results for &quot;{query}&quot;</p>}

    </div>
  )
}