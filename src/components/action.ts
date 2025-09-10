

 export async function getRecommendations({query, category}:{query?: string, category?: string}) {
    const res = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category }),
    });
    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    } 
    console.log('action function' + res);
    

    return res.json();
}


