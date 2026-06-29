import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { eq, relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";


const createdAt = timestamp("created_at").notNull().defaultNow();
const updatedAt = timestamp("updated_at")
    .notNull().defaultNow().$onUpdate(() => new Date());

export const EventTable = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    durationInMinutes: integer("duration_in_minutes").notNull(),
    clerkUserId: text("clerk_user_id").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt,
    updatedAt
},
    table => ([
        index("clerkUserIdIndex").on(table.clerkUserId)
    ])
)

export const ScheduleTable = pgTable("schedules", {
    id: uuid("id").primaryKey().defaultRandom(),
    timezone: text("timezone").notNull(),
    clerkUserId: text("clerk_user_id").unique().notNull(),
    createdAt,
    updatedAt,
})

export const scheduleRelations=relations(ScheduleTable,({many})=>({
    availabilities:many(ScheduleAvailabilityTable),
}))

export const scheduleDayOfWeekEnum = pgEnum("day", DAYS_OF_WEEK_IN_ORDER)

export const ScheduleAvailabilityTable = pgTable("schedule_availabilities", {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id").references(() => ScheduleTable.id, { onDelete: "cascade" }),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    dayOfWeek: scheduleDayOfWeekEnum("day_of_week").notNull(),
},
    table => [
        index("scheduleIdIndex").on(table.scheduleId)
    ]
)

export const ScheduleAvailabilityRelations=relations(ScheduleAvailabilityTable,({one})=>({
    schedule:one(ScheduleTable,{
        fields:[ScheduleAvailabilityTable.scheduleId],
        references:[ScheduleTable.id]
    })
})) 