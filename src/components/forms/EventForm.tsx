"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import {
  eventFormSchema,
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  type EventFormValues,
  type Event,
} from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

function formatToDatetimeLocal(dateVal: unknown): string {
  if (!dateVal) return "";
  let date: Date | null = null;
  if (dateVal instanceof Date) {
    date = dateVal;
  } else if (
    typeof dateVal === "object" &&
    dateVal !== null &&
    "toDate" in dateVal &&
    typeof (dateVal as { toDate: () => Date }).toDate === "function"
  ) {
    date = (dateVal as { toDate: () => Date }).toDate();
  } else if (typeof dateVal === "string" || typeof dateVal === "number") {
    date = new Date(dateVal);
  } else if (
    typeof dateVal === "object" &&
    dateVal !== null &&
    "seconds" in dateVal
  ) {
    date = new Date((dateVal as { seconds: number }).seconds * 1000);
  }
  if (!date || isNaN(date.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

const EMPTY: Partial<EventFormValues> = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  coverImage: "",
  gallery: [],
  category: "workshop",
  status: "upcoming",
  startAt: "",
  endAt: "",
  venue: "",
  capacity: null,
  registrationOpen: true,
  registrationDeadline: "",
  externalLink: "",
  outcomes: [],
};

export function EventForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save event",
}: {
  defaultValues?:
    | EventFormValues
    | (Partial<Event> & {
        startAt?: unknown;
        endAt?: unknown;
        registrationDeadline?: unknown;
      });
  onSubmit: (values: EventFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  // Convert dates to string format for html datetime-local
  const parsedDefaults = defaultValues
    ? {
        ...defaultValues,
        startAt: formatToDatetimeLocal(defaultValues.startAt),
        endAt: formatToDatetimeLocal(defaultValues.endAt),
        registrationDeadline: formatToDatetimeLocal(
          defaultValues.registrationDeadline,
        ),
        capacity:
          defaultValues.capacity !== null &&
          defaultValues.capacity !== undefined
            ? String(defaultValues.capacity)
            : "",
      }
    : {};

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      ...EMPTY,
      ...parsedDefaults,
    } as unknown as EventFormValues,
  });

  const [galleryDraft, setGalleryDraft] = React.useState("");
  const [outcomeDraft, setOutcomeDraft] = React.useState("");

  const gallery = form.watch("gallery") || [];
  const outcomes = form.watch("outcomes") || [];

  function addGalleryImage() {
    const value = galleryDraft.trim();
    if (!value) return;
    try {
      new URL(value); // simple client url check
      if (!gallery.includes(value)) {
        form.setValue("gallery", [...gallery, value], { shouldValidate: true });
      }
      setGalleryDraft("");
    } catch {
      form.setError("gallery", { message: "Invalid image URL" });
    }
  }

  function removeGalleryImage(url: string) {
    form.setValue(
      "gallery",
      gallery.filter((u) => u !== url),
      { shouldValidate: true },
    );
  }

  function addOutcome() {
    const value = outcomeDraft.trim();
    if (!value) return;
    if (!outcomes.includes(value)) {
      form.setValue("outcomes", [...outcomes, value], { shouldValidate: true });
    }
    setOutcomeDraft("");
  }

  function removeOutcome(outcome: string) {
    form.setValue(
      "outcomes",
      outcomes.filter((o) => o !== outcome),
      { shouldValidate: true },
    );
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8"
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="AWS Cloud Practitioner Essentials"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="aws-cloud-practitioner-essentials"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>Public at /events/slug</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input
                  placeholder="A short catchphrase to grab attention"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Detailed event description. Supports markdown."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {EVENT_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="capitalize"
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  <Input placeholder="Seminar Hall 1 / Online" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Leave blank for unlimited</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Registration Link</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>Optional redirect link</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="registrationDeadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Deadline</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registrationOpen"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-sm border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Open for registration</FormLabel>
                  <FormDescription>
                    Disable this to close registrations manually
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <Label htmlFor="gallery-input">Gallery Image URLs</Label>
          <div className="flex gap-2">
            <Input
              id="gallery-input"
              value={galleryDraft}
              placeholder="https://..."
              onChange={(e) => setGalleryDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGalleryImage();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addGalleryImage}>
              Add
            </Button>
          </div>
          {gallery.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {gallery.map((url) => (
                <Badge
                  key={url}
                  variant="secondary"
                  className="max-w-xs gap-1 truncate"
                >
                  {url}
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    aria-label={`Remove image`}
                    className="hover:text-danger rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </FormItem>

        <FormItem>
          <Label htmlFor="outcome-input">Event Outcomes</Label>
          <div className="flex gap-2">
            <Input
              id="outcome-input"
              value={outcomeDraft}
              placeholder="e.g. Learn the basics of IAM and VPC setup"
              onChange={(e) => setOutcomeDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOutcome();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addOutcome}>
              Add
            </Button>
          </div>
          {outcomes.length > 0 ? (
            <div className="flex flex-col gap-2 pt-1">
              {outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="bg-muted flex items-center gap-2 rounded-sm p-2 text-sm"
                >
                  <span className="flex-1">{outcome}</span>
                  <button
                    type="button"
                    onClick={() => removeOutcome(outcome)}
                    aria-label={`Remove outcome`}
                    className="hover:text-danger rounded-full p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </FormItem>

        <div className={cn("flex gap-3")}>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
