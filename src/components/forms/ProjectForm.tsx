"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { projectFormSchema, type ProjectFormValues } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const EMPTY: ProjectFormValues = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  coverImage: "",
  stack: [],
  contributors: [],
  repoUrl: "",
  liveUrl: "",
  architectureDiagram: "",
  featured: false,
};

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save project",
}: {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const [stackDraft, setStackDraft] = React.useState("");
  const stack = form.watch("stack");

  function addStack() {
    const value = stackDraft.trim();
    if (!value) return;
    if (!stack.includes(value)) {
      form.setValue("stack", [...stack, value], { shouldValidate: true });
    }
    setStackDraft("");
  }

  function removeStack(item: string) {
    form.setValue(
      "stack",
      stack.filter((s) => s !== item),
      { shouldValidate: true },
    );
  }

  const [contributorDraft, setContributorDraft] = React.useState("");
  const contributors = form.watch("contributors");

  function addContributor() {
    const value = contributorDraft.trim();
    if (!value) return;
    if (!contributors.includes(value)) {
      form.setValue("contributors", [...contributors, value], {
        shouldValidate: true,
      });
    }
    setContributorDraft("");
  }

  function removeContributor(uid: string) {
    form.setValue(
      "contributors",
      contributors.filter((c) => c !== uid),
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Cool Project" {...field} />
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
                    placeholder="cool-project"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>Used in URL: /projects/slug</FormDescription>
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
                  placeholder="A brief, catchy description..."
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
                  rows={8}
                  placeholder="Detailed markdown description of the project..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormDescription>
                Optional. Leave blank to use a fallback grid pattern.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="stack-input">Tech Stack</Label>
          <div className="flex gap-2">
            <Input
              id="stack-input"
              value={stackDraft}
              placeholder="React, AWS, Next.js..."
              onChange={(e) => setStackDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addStack();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addStack}>
              Add
            </Button>
          </div>
          {stack.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {stack.map((item) => (
                <Badge key={item} variant="secondary" className="gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeStack(item)}
                    aria-label={`Remove ${item}`}
                    className="hover:text-danger rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contributor-input">Contributors (UIDs)</Label>
          <div className="flex gap-2">
            <Input
              id="contributor-input"
              value={contributorDraft}
              placeholder="Enter member Firebase UID..."
              onChange={(e) => setContributorDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addContributor();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addContributor}>
              Add
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Add member user IDs who contributed to this project.
          </p>
          {contributors.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {contributors.map((uid) => (
                <Badge key={uid} variant="secondary" className="gap-1">
                  {uid}
                  <button
                    type="button"
                    onClick={() => removeContributor(uid)}
                    aria-label={`Remove ${uid}`}
                    className="hover:text-danger rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Links & Architecture</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://github.com/..."
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
              name="liveUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Site URL</FormLabel>
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
              name="architectureDiagram"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Architecture Diagram URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional URL to an architecture diagram image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-sm border p-4">
              <div className="space-y-0.5">
                <FormLabel>Featured Project</FormLabel>
                <FormDescription>
                  When on, this project will appear in the landing page featured
                  section.
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

        <div className={cn("flex gap-3")}>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
