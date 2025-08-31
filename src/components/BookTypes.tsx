'use client'
import React from 'react'
import { Button } from './ui/button'
import { useQueryStore } from '@/store'

export function BookTypes() {
    const query = useQueryStore((state) => state.query)
  return (
    <div className="">
        <div className='flex gap-3 items-center'>
            <Button variant="outline">Fiction</Button>
            <Button variant="outline">Non-Fiction</Button>
            <Button variant="outline">Fantasy</Button>
            <Button variant="outline">Mystery</Button>
            <Button variant="outline">Romance</Button>
            <Button variant="outline">Horror</Button>
            <Button variant="outline">Classics</Button>
        </div>
        {query && <p>Search Results for &quot;{query}&quot;</p>}

    </div>
  )
}