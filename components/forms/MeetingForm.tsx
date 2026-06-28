"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { toZonedTime } from "date-fns-tz"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

// Updated imports to use the new Field components
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { formatDate, formatTimeString, formatTimezoneOffset } from "@/lib/formatters"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { isSameDay } from "date-fns"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import Link from "next/link"
import { meetingFormSchema } from "@/schema/meetings"
import { createMeeting } from "@/server/actions/meetings"
import Booking from "../Booking"

export default function MeetingForm({
  validTimes,
  eventId,
  clerkUserId,
}: {
  validTimes: Date[]
  eventId: string
  clerkUserId: string
}) {
  const router = useRouter()

  const form = useForm<z.infer<typeof meetingFormSchema>>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestName: "",
      guestEmail: "",
      guestNotes: "",
    },
  })

  const timezone = form.watch("timezone")
  const date = form.watch("date")

  const validTimesInTimezone = useMemo(() => {
    return validTimes.map(date => toZonedTime(date, timezone))
  }, [validTimes, timezone])

  async function onSubmit(values: z.infer<typeof meetingFormSchema>) {
    try {
      const meetingData = await createMeeting({
        ...values,
        eventId,
        clerkUserId,
      })

      const path = `/book/${meetingData.clerkUserId}/${meetingData.eventId}/success?startTime=${meetingData.startTime.toISOString()}`;
      router.push(path)

    } catch (error: any) {
      form.setError("root", {
        message: `There was an unknown error saving your event ${error.message}`,
      })
    }
  }

  if (form.formState.isSubmitting) return <Booking />

  return (
    <form
      id="meeting-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex gap-6 flex-col"
    >
      {form.formState.errors.root && (
        <div className="text-destructive text-sm">
          {form.formState.errors.root.message}
        </div>
      )}

      <FieldGroup>
        {/* Timezone selection field */}
        <Controller
          control={form.control}
          name="timezone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="timezone-select">Timezone</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="timezone-select" aria-invalid={fieldState.invalid}>
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

        <div className="flex gap-4 flex-col md:flex-row">
          {/* Date picker field */}
          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="date-picker">Date</FieldLabel>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      id="date-picker"
                      aria-invalid={fieldState.invalid}
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal flex w-full",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date =>
                        !validTimesInTimezone.some(time =>
                          isSameDay(date, time)
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Time selection field */}
          <Controller
            control={form.control}
            name="startTime"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="time-select">Time</FieldLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={value => {
                    if (value == null) return;
                    field.onChange(new Date(Date.parse(value)));
                  }}
                  defaultValue={field.value?.toISOString()}
                >
                  <SelectTrigger id="time-select" aria-invalid={fieldState.invalid}>
                    <SelectValue
                      placeholder={
                        date == null || timezone == null
                          ? "Select a date/timezone first"
                          : "Select a meeting time"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter(time => isSameDay(time, date))
                      .map(time => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
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
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          {/* Guest name input */}
          <Controller
            control={form.control}
            name="guestName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="guest-name">Your Name</FieldLabel>
                <Input
                  {...field}
                  id="guest-name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Guest email input */}
          <Controller
            control={form.control}
            name="guestEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="guest-email">Your Email</FieldLabel>
                <Input
                  {...field}
                  type="email"
                  id="guest-email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Optional notes textarea */}
        <Controller
          control={form.control}
          name="guestNotes"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="guest-notes">Notes</FieldLabel>
              <Textarea
                {...field}
                id="guest-notes"
                className="resize-none"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Cancel and Submit buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          disabled={form.formState.isSubmitting}
          type="button"
          asChild
          variant="outline"
        >
          <Link href={`/book/${clerkUserId}`}>Cancel</Link>
        </Button>
        <Button
          className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
          disabled={form.formState.isSubmitting}
          type="submit"
          form="meeting-form"
        >
          Book Event
        </Button>
      </div>
    </form>
  )
}