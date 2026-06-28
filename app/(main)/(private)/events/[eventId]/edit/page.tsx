import EventForm from "@/components/forms/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvent, getEvents } from "@/server/actions/events";
import { auth } from "@clerk/nextjs/server"


interface editEventProps {
    params: Promise<{ eventId: string }>
}


export default async function EditEventPage({ params }: editEventProps) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
        return redirectToSignIn();
    }
    const { eventId } = await params;
    const event = await getEvent(userId, eventId);
    if (!event) return <h1>Event not found</h1>
    return (
        <Card className="max-w-md mx-auto border-4 border-blue-100 shadow-2xl shadow-accent-foreground">
            <CardHeader>
                <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Render the EventForm with the event details, passing the event data as props */}
                <EventForm
                    event={{ ...event, description: event.description || undefined }} // If description is null, pass undefined
                />
            </CardContent>
        </Card>
    )
}
