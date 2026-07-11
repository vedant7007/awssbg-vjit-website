"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  roadmapItemSchema,
  type RoadmapItemFormValues,
  ROADMAP_STATUSES,
  ROADMAP_CATEGORIES,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const EMPTY: RoadmapItemFormValues = {
  title: "",
  description: "",
  quarter: "",
  status: "proposed",
  category: "initiative",
};

export function RoadmapItemForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save roadmap item",
}: {
  defaultValues?: Partial<RoadmapItemFormValues>;
  onSubmit: (values: RoadmapItemFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<RoadmapItemFormValues>({
    resolver: zodResolver(roadmapItemSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-8"
        noValidate
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="AWS study group" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="More detail for members to review."
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {ROADMAP_STATUSES.map((status) => (
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
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {ROADMAP_CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="capitalize"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="quarter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quarter</FormLabel>
              <FormControl>
                <Input placeholder="2026-Q3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
          <p className="text-muted-foreground text-sm">
            The roadmap item will be visible to members once created.
          </p>
        </div>
      </form>
    </Form>
  );
}
