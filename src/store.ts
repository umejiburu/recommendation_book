import {create} from 'zustand';

interface Book {
    title: string;
    authors: string[];
    description: string;
    thumbnail: string | null;
    previewLink?: string;
    categories?: string[];
}

type QueryState = {
    query: string;
    setQuery: (value: string) => void;
    data: Book[];
    setData: (value: Book[]) => void;
}

export const useQueryStore = create<QueryState>((set)=>({
    query: '',
    setQuery: (value) => set({ query: value }),
    data: [],
    setData: (value) => set({ data: value }),
}))