"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { memberFormSchema, type MemberFormValues } from "@/lib/types";
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

/*
 * Self-service member profile form. Unlike the admin MemberForm, this hides the
 * admin-only fields (role, team, email, cohort year). Those values are kept in
 * form state from defaultValues and passed through unchanged on submit, so the
 * Firestore rules (which forbid a member changing their own role/team) are
 * satisfied.
 */
export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save profile",
}: {
  defaultValues: MemberFormValues;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues,
  });

  const [skillDraft, setSkillDraft] = React.useState("");
  const skills = form.watch("skills");

  function addSkill() {
    const value = skillDraft.trim();
    if (!value) return;
    if (!skills.includes(value)) {
      form.setValue("skills", [...skills, value], { shouldValidate: true });
    }
    setSkillDraft("");
  }

  function removeSkill(skill: string) {
    form.setValue(
      "skills",
      skills.filter((s) => s !== skill),
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
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="yourname"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormDescription>
                  Your public profile lives at /m/{field.value || "username"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <FormControl>
                  <Input placeholder="CSE" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="batchYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Graduation year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="A line or two about you. Max 280 characters."
                  {...field}
                />
              </FormControl>
              <FormDescription>{field.value.length}/280</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                Paste a link to your photo. Direct file upload is coming soon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel htmlFor="skill-input">Skills</FormLabel>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              value={skillDraft}
              placeholder="React, AWS, Python..."
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="hover:text-danger rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </FormItem>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Socials</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["github", "linkedin", "twitter", "website"] as const).map(
              (key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`socials.${key}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{key}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ),
            )}
          </div>
        </fieldset>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-sm border p-4">
              <div className="space-y-0.5">
                <Label>Public profile</Label>
                <FormDescription>
                  When on, anyone can view your profile at your username.
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

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
