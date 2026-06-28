
import PrivateNavBar from "@/components/PrivateNavbar";
import PublicNavBar from "@/components/PublicNavbar";
import PublicNavbar from "@/components/PublicNavbar";
import { currentUser } from "@clerk/nextjs/server"




export default async function mainLayout({
    children,
}:
    { children: React.ReactNode }
) {
    const user=await currentUser();
    return (
        <main className="relative">
            {/* <PublicNavbar></PublicNavbar> */}
            {user? <PrivateNavBar/>:<PublicNavbar/>}
            <section className="pt-36">
                {children}
            </section>
        </main>
    )
}