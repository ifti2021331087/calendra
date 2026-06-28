import LandingPage from "@/components/LandingPage";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser();
  
  if (!user) return <LandingPage></LandingPage>
  return redirect('/events');
}
