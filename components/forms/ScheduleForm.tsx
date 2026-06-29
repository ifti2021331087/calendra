"use client"

import { DAYS_OF_WEEK_IN_ORDER } from "@/constants"
import { timeToFloat } from "@/lib/utils"
import { scheduleFormSchema } from "@/schema/schedule"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { formatTimezoneOffset } from "@/lib/formatters"
import { Fragment } from "react"
import { Button } from "../ui/button"
import { Plus, X } from "lucide-react"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { saveSchedule } from "@/server/actions/schedule"

// Import the custom field components based on your example
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

type Availability = {
    startTime: string
    endTime: string
    dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number]
}

export function ScheduleForm({
    schedule,
}: {
    schedule?: {
        timezone: string
        availabilities: Availability[]
    }
}) {
    const form = useForm<z.infer<typeof scheduleFormSchema>>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            availabilities: schedule?.availabilities.toSorted((a, b) => {
                return timeToFloat(a.startTime) - timeToFloat(b.startTime)
            }),
        },
    })

    const {
        append: addAvailability,
        remove: removeAvailability,
        fields: availabilityFields,
    } = useFieldArray({ name: "availabilities", control: form.control })

    const groupedAvailabilityFields = Object.groupBy(
        availabilityFields.map((field, index) => ({ ...field, index })),
        availability => availability.dayOfWeek
    )

    async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
        try {
            await saveSchedule(values)
            toast("Schedule saved successfully.", {
                duration: 5000,
                className: '!rounded-3xl !py-8 !px-5 !justify-center !text-green-400 !font-black',
            })
        } catch (error: any) {
            form.setError("root", {
                message: `There was an error saving your schedule: ${error.message}`,
            })
        }
    }

    return (
        <form
            className="flex gap-6 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
        >
            {/* Show form-level error if any */}
            {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium">
                    {form.formState.errors.root.message}
                </div>
            )}

            <FieldGroup>
                {/* Timezone selection */}
                <Controller
                    name="timezone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Timezone</FieldLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger aria-invalid={fieldState.invalid}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Intl.supportedValuesOf("timeZone").map(timezone => (
                                        <SelectItem key={timezone} value={timezone}>
                                            {timezone}
                                            {` (${formatTimezoneOffset(timezone)})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>

            {/* Availability form grid grouped by day */}
            <div className="grid grid-cols-[auto_auto] gap-y-6">
                {DAYS_OF_WEEK_IN_ORDER.map(dayOfWeek => (
                    <Fragment key={dayOfWeek}>
                        {/* Day label */}
                        <div className="capitalize text-sm font-semibold pt-2">
                            {dayOfWeek.substring(0, 3)}
                        </div>

                        {/* Add availability for a specific day */}
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                className="size-6 p-1 cursor-pointer hover:scale-110"
                                variant="outline"
                                onClick={() => {
                                    addAvailability({
                                        dayOfWeek,
                                        startTime: "9:00",
                                        endTime: "17:00",
                                    })
                                }}
                            >
                                <Plus color="red" />
                            </Button>

                            {/* Render availability entries for this day */}
                            {groupedAvailabilityFields[dayOfWeek]?.map(
                                (field, labelIndex) => (
                                    <div className="flex flex-col gap-1" key={field.id}>
                                        <div className="flex gap-2 items-start">
                                            
                                            {/* Start time input */}
                                            <Controller
                                                name={`availabilities.${field.index}.startTime`}
                                                control={form.control}
                                                render={({ field: inputField, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                                                        <Input
                                                            className="w-24"
                                                            aria-label={`${dayOfWeek} Start Time ${labelIndex + 1}`}
                                                            aria-invalid={fieldState.invalid}
                                                            {...inputField}
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                            
                                            <span className="mt-2 text-muted-foreground">-</span>
                                            
                                            {/* End time input */}
                                            <Controller
                                                name={`availabilities.${field.index}.endTime`}
                                                control={form.control}
                                                render={({ field: inputField, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                                                        <Input
                                                            className="w-24"
                                                            aria-label={`${dayOfWeek} End Time ${labelIndex + 1}`}
                                                            aria-invalid={fieldState.invalid}
                                                            {...inputField}
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />

                                            {/* Remove availability */}
                                            <Button
                                                type="button"
                                                className="size-6 p-1 mt-0.5 cursor-pointer hover:bg-red-900"
                                                variant="destructive"
                                                onClick={() => removeAvailability(field.index)}
                                            >
                                                <X />
                                            </Button>
                                        </div>

                                        {/* Show safe field-level validation messages for row-level conflicts */}
                                        {form.formState.errors.availabilities?.[field.index]?.root?.message && (
                                            <p className="text-[0.8rem] font-medium text-destructive mt-1">
                                                {form.formState.errors.availabilities[field.index]?.root?.message}
                                            </p>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </Fragment>
                ))}
            </div>

            {/* Save button */}
            <div className="flex gap-2 justify-start pt-4">
                <Button
                    className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                    disabled={form.formState.isSubmitting}
                    type="submit"
                >
                    Save
                </Button>
            </div>
        </form>
    )
}