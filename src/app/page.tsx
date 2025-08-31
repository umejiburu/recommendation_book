import { getRecommendations } from "@/components/action";
import { BookDisplayed } from "@/components/BookDisplayed";
import { BookTypes } from "@/components/BookTypes";
import { InputWithButton } from "@/components/InputWithButton";

export default async function Home() {
  
  return (
    <div className=" flex flex-col items-center justify-center in-h-screen py-2 gap-4
    ">
      <h1 className="text-3xl font-bold"> AI Book Finder</h1>
      <p>Discover your next favourite read with AI-powered recommendatios</p>
      <InputWithButton/>
      <BookTypes/>
      <BookDisplayed/>
    </div>
  )
}