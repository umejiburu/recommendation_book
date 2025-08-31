import {create} from 'zustand';

type QueryState = {
    query: string;
    setQuery: (value: string) => void;
    data: [];
    setData: (value: []) => void;
}

export const useQueryStore = create<QueryState>((set)=>({
    query: '',
    setQuery: (value) => set({ query: value }),
    data: [],
    setData: (value) => set({ data: value }),
}))