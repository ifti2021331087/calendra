

type EventCardProps = {
    id: string;
    name: string;
    description: string | null;
    durationInMinutes: number;
    clerkUserId: string;
    isActive: boolean;
}

import { cn } from '@/lib/utils';
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { formatEventDescription } from '@/lib/formatters';
import { CopyEventButton } from '../ui/CopyEventButton';

export default function EventCard({ id, name, description,
    durationInMinutes, clerkUserId, isActive }: EventCardProps) {
    return (
        <Card className={cn("flex flex-col border-4 border-blue-500/10 shadow-2xl transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110", !isActive && " bg-accent border-accent")}>
            {/* Card header with title and formatted duration */}
            <CardHeader className={cn(!isActive && "opacity-50")}>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    {formatEventDescription(durationInMinutes)}
                </CardDescription>
            </CardHeader>

            {/* Show event description if available */}
            {description != null && (
                <CardContent className={cn(!isActive && "opacity-50")}>
                    {description}
                </CardContent>
            )}

            {/* Card footer with copy and edit buttons */}
            <CardFooter className="flex justify-end gap-2 mt-auto">
                {/* Show copy button only if event is active */}
                {isActive && (
                    <CopyEventButton
                        variant="outline"
                        eventId={id}
                        clerkUserId={clerkUserId}
                    />
                )}
                {/* Edit event button */}
                <Button
                    className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                    asChild>
                    <Link href={`/events/${id}/edit`}>Edit</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
