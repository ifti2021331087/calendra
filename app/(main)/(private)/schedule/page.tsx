import { ScheduleForm } from "@/components/forms/ScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchedule } from "@/server/actions/schedule";
import { auth } from "@clerk/nextjs/server"


export default async function SchedulePage() {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
        return redirectToSignIn();
    }
    const schedule = await getSchedule(userId);

    return (
        <Card className="max-w-md mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground">
            <CardHeader>
                <CardTitle>Schedule</CardTitle> {/* Display title for the page */}
            </CardHeader>
            <CardContent>
                <ScheduleForm schedule={schedule ?? undefined} />
                {/* Render the ScheduleForm component with the fetched schedule */}
            </CardContent>
        </Card>
    )
}
