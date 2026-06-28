"use client";

import React, { useTransition } from 'react'
import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventFormSchema } from '@/schema/events';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import Link from 'next/link';
import { createEvent, deleteEvent, updateEvent } from '@/server/actions/events';
import { useRouter } from 'next/navigation';

export default function EventForm({ event }: {
    event?: {
        id: string,
        name: string,
        description?: string,
        durationInMinutes: number,
        isActive: boolean
    }
}) {
    const [isDeletePending, startDeleteTransition] = useTransition();
    const router = useRouter();
    
    const { 
        register, 
        handleSubmit, 
        control, 
        setError, 
        formState: { errors, isSubmitting } 
    } = useForm<
        z.input<typeof eventFormSchema>, 
        any, 
        z.infer<typeof eventFormSchema>
    >({
        resolver: zodResolver(eventFormSchema),
        defaultValues: event ? {
            ...event
        } : {
            isActive: true,
            durationInMinutes: 30,
            description: '',
            name: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
        const action = event == null ? createEvent : updateEvent.bind(null, event.id);
            const data=await action(values);
        if(data?.error) {
            setError("root", {
                message: `There was an error saving your event`
            })
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-6 flex-col"
        >
            {/* Show root error if any */}
            {errors.root && (
                <div className="text-destructive text-sm font-medium">
                    {errors.root.message}
                </div>
            )}

            {/* Event Name Field */}
            <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Event Name
                </label>
                <Input id="name" {...register("name")} />
                <p className="text-[0.8rem] text-muted-foreground">
                    The name users will see when booking
                </p>
                {errors.name && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.name.message as string}
                    </p>
                )}
            </div>

            {/* Duration Field */}
            <div className="grid gap-2">
                <label htmlFor="durationInMinutes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Duration
                </label>
                <Input 
                    id="durationInMinutes" 
                    type="number" 
                    {...register("durationInMinutes", { valueAsNumber: true })} 
                />
                <p className="text-[0.8rem] text-muted-foreground">In minutes</p>
                {errors.durationInMinutes && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.durationInMinutes.message as string}
                    </p>
                )}
            </div>

            {/* Optional Description Field */}
            <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                </label>
                <Textarea 
                    id="description" 
                    className="resize-none h-32" 
                    {...register("description")} 
                />
                <p className="text-[0.8rem] text-muted-foreground">
                    Optional description of the event
                </p>
                {errors.description && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.description.message as string}
                    </p>
                )}
            </div>

            {/* Toggle for Active Status */}
            <div className="grid gap-2">
                <div className="flex items-center gap-2">
                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="isActive"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Active
                    </label>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                    Inactive events will not be visible for users to book
                </p>
                {errors.isActive && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.isActive.message as string}
                    </p>
                )}
            </div>

            {/* Buttons section: Delete, Cancel, Save */}
            <div className="flex gap-2 justify-end">
                {/* Delete Button */}
                {event && (
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button
                                className="cursor-pointer hover:scale-105 hover:bg-red-700"
                                variant="destructive"
                                disabled={isDeletePending || isSubmitting}
                            >
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    this event.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-700 cursor-pointer"
                                    disabled={isDeletePending || isSubmitting}
                                    onClick={() => {
                                        startDeleteTransition(async () => {
                                            try {
                                                await deleteEvent(event.id)
                                                router.push('/events')
                                            } catch (error: any) {
                                                setError("root", {
                                                    message: `There was an error deleting your event: ${error.message}`,
                                                })
                                            }
                                        })
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Cancel Button */}
                <Button
                    disabled={isDeletePending || isSubmitting}
                    type="button"
                    asChild
                    variant="outline"
                >
                    <Link href="/events">Cancel</Link>
                </Button>

                {/* Save Button */}
                <Button
                    className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                    disabled={isDeletePending || isSubmitting}
                    type="submit"
                >
                    Save
                </Button>
            </div>
        </form>
    )
}