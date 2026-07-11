"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Linkedin,
  Github,
  Twitter,
  Globe,
  X,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/constants/routes";
import type { MemberView } from "./page";

// Role-based design tokens using Tailwind utility classes instead of hardcoded hex values
const getRoleColors = (role: string) => {
  const lowercaseRole = role.toLowerCase();
  if (lowercaseRole.includes("captain") || lowercaseRole === "core") {
    return {
      text: "text-orange",
      border: "border-orange/30",
      bg: "bg-orange/5",
    };
  }
  if (lowercaseRole.includes("lead")) {
    return {
      text: "text-blue",
      border: "border-blue/30",
      bg: "bg-blue/5",
    };
  }
  if (lowercaseRole.includes("coordinator")) {
    return {
      text: "text-purple",
      border: "border-purple/30",
      bg: "bg-purple/5",
    };
  }
  return {
    text: "text-muted-foreground",
    border: "border-border/80",
    bg: "bg-paper/40",
  };
};

export function MembersDirectoryClient({
  initialMembers,
}: {
  initialMembers: MemberView[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedMember, setSelectedMember] = useState<MemberView | null>(null);

  // Dynamic branch options derived from active member data
  const branches = Array.from(
    new Set(initialMembers.map((m) => m.branch).filter(Boolean)),
  );
  const branchOptions = ["All", ...branches];

  // Map batch years to current academic study years dynamically
  const getStudyYear = (batchYear: number) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // Assuming academic year changes around July/August (month index 6/7)
    const academicOffset = currentMonth >= 6 ? 1 : 0;
    const yearsLeft = batchYear - (currentYear + academicOffset);

    if (yearsLeft < 0) return "Alumni";
    if (yearsLeft === 0) return "4th Year";
    if (yearsLeft === 1) return "3rd Year";
    if (yearsLeft === 2) return "2nd Year";
    if (yearsLeft === 3) return "1st Year";
    return "Alumni";
  };

  // Dynamic study year options
  const years = Array.from(
    new Set(
      initialMembers.map((m) => getStudyYear(m.batchYear)).filter(Boolean),
    ),
  );
  const yearOptions = ["All", ...years];

  // Search and filter logic
  const filteredMembers = initialMembers.filter((member) => {
    const matchesSearch =
      member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.team &&
        member.team.toLowerCase().includes(searchQuery.toLowerCase())) ||
      member.skills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear =
      selectedYear === "All" || getStudyYear(member.batchYear) === selectedYear;
    const matchesBranch =
      selectedBranch === "All" || member.branch === selectedBranch;

    return matchesSearch && matchesYear && matchesBranch;
  });

  const totalCount = initialMembers.length;

  return (
    <div className="space-y-12">
      {/* ── STATS DASHBOARD ───────────────────────────────── */}
      <div className="flex justify-start">
        <div className="bg-card border-border/80 flex items-center gap-4 rounded-sm border px-6 py-4 backdrop-blur-sm">
          <GraduationCap className="text-orange size-6" />
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold">
              {totalCount}
            </span>
            <span className="text-muted-foreground text-xs">Total Members</span>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH PANEL ─────────────────────────── */}
      <div className="bg-card border-border/80 space-y-4 rounded-sm border p-5 md:p-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, team or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-paper/50 border-border/80 focus:border-orange focus:ring-orange/50 placeholder:text-muted-foreground/60 w-full rounded-sm py-2.5 pr-4 pl-11 text-sm transition-all outline-none focus:ring-1"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1.5 font-mono text-[10px] tracking-wide uppercase">
              Year of Study
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-paper border-border/80 focus:border-orange w-full cursor-pointer rounded-sm border px-3 py-2 text-xs transition-all outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground mb-1.5 font-mono text-[10px] tracking-wide uppercase">
              Branch/Department
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-paper border-border/80 focus:border-orange w-full cursor-pointer rounded-sm border px-3 py-2 text-xs transition-all outline-none"
            >
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b === "All" ? "All Branches" : b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── MEMBER GRID ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filteredMembers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredMembers.map((member) => {
              const roleColors = getRoleColors(member.role);

              return (
                <div key={member.id} className="group relative">
                  <Link
                    href={routes.member(member.username)}
                    className="bg-card hover:border-orange border-border/80 hover:bg-card/95 hover:shadow-orange/5 flex h-full flex-col justify-between rounded-sm border p-4 transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Header: Photo */}
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={`relative flex size-12 items-center justify-center overflow-hidden rounded-full border text-sm font-bold ${roleColors.border} ${roleColors.bg}`}
                        >
                          {member.photoURL ? (
                            <Image
                              src={member.photoURL}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <span className={roleColors.text}>
                              {member.displayName.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Member Identity */}
                      <h3 className="font-display text-ink group-hover:text-orange font-semibold tracking-tight transition-colors">
                        {member.displayName}
                      </h3>
                      <p
                        className={`mt-1 font-mono text-[10px] font-semibold tracking-wide uppercase ${roleColors.text}`}
                      >
                        {member.role === "core" && member.team === "Core"
                          ? "Captain"
                          : member.role}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {getStudyYear(member.batchYear)} &bull; {member.branch}
                      </p>

                      {/* Bio Snip */}
                      <p className="text-muted-foreground mt-3 line-clamp-2 text-xs leading-relaxed">
                        {member.bio}
                      </p>
                    </div>

                    {/* Skills Cloud */}
                    <div className="mt-5 border-t pt-3">
                      <div className="mb-4 flex h-[22px] flex-wrap gap-1 overflow-hidden">
                        {member.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="bg-paper border-border/80 text-muted-foreground rounded-sm border px-1.5 py-0.5 text-[9px]"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-muted-foreground/60 px-1 py-0.5 text-[9px]">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-orange font-mono text-[10px] font-bold tracking-wide group-hover:underline">
                          View profile &rarr;
                        </span>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedMember(member);
                          }}
                          className="text-muted-foreground hover:text-ink border-border hover:border-orange rounded-sm border px-2 py-0.5 font-mono text-[10px] transition-all"
                        >
                          Quick Peek
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border-border/80 mx-auto flex max-w-md flex-col items-center justify-center rounded-sm border p-12 text-center backdrop-blur-sm"
          >
            <AlertCircle className="text-muted-foreground mb-4 size-8" />
            <h3 className="font-display text-ink font-semibold">
              No Members Found
            </h3>
            <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
              We couldn&apos;t find any members matching your current filters.
              Try resetting the criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedYear("All");
                setSelectedBranch("All");
              }}
              className="bg-primary hover:bg-orange/85 text-primary-foreground mt-5 cursor-pointer rounded-sm px-4 py-2 font-mono text-xs tracking-wider uppercase shadow-sm transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DETAILED PROFILE MODAL ────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="bg-ink/80 absolute inset-0 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`member-card-${selectedMember.id}`}
              className="bg-card border-border/80 relative z-10 w-full max-w-lg overflow-hidden rounded-sm border p-6 shadow-2xl sm:p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="text-muted-foreground hover:text-ink hover:bg-paper absolute top-4 right-4 cursor-pointer rounded-sm p-1 transition-colors"
              >
                <X className="size-4" />
              </button>

              {/* Identity Header */}
              <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div
                  className={`relative flex size-16 items-center justify-center overflow-hidden rounded-full border text-2xl font-bold ${getRoleColors(selectedMember.role).border} ${getRoleColors(selectedMember.role).bg}`}
                >
                  {selectedMember.photoURL ? (
                    <Image
                      src={selectedMember.photoURL}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className={getRoleColors(selectedMember.role).text}>
                      {selectedMember.displayName.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="pt-1 text-center sm:text-left">
                  <h3 className="font-display text-ink text-xl leading-none font-bold">
                    {selectedMember.displayName}
                  </h3>
                  <p
                    className={`mt-2 font-mono text-xs font-semibold tracking-wider uppercase ${getRoleColors(selectedMember.role).text}`}
                  >
                    {selectedMember.role === "core" &&
                    selectedMember.team === "Core"
                      ? "Club Captain"
                      : `${selectedMember.role} • ${selectedMember.team}`}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {getStudyYear(selectedMember.batchYear)} &bull;{" "}
                    {selectedMember.branch} &bull; VJIT
                  </p>
                </div>
              </div>

              {/* Bio block */}
              <div className="mb-6 space-y-5">
                <div className="bg-paper/40 border-border/60 rounded-sm border p-4">
                  <h4 className="text-muted-foreground mb-1.5 font-mono text-[9px] font-bold tracking-wide uppercase">
                    Biography
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Core skills cloud */}
                <div>
                  <h4 className="text-muted-foreground mb-2 font-mono text-[9px] font-bold tracking-wide uppercase">
                    Core Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-paper border-border text-muted-foreground hover:border-orange/40 hover:text-ink rounded-sm border px-2.5 py-1 text-xs transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer & socials */}
              <div className="border-border/80 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground/60 font-mono text-[9px] tracking-wide uppercase">
                  AWS Student Builder Group VJIT
                </span>

                <div className="flex items-center gap-2">
                  {selectedMember.socials.github && (
                    <a
                      href={selectedMember.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border hover:border-ink hover:text-ink text-muted-foreground flex size-9 items-center justify-center rounded-sm border transition-colors"
                      aria-label="GitHub Profile"
                    >
                      <Github className="size-4" />
                    </a>
                  )}
                  {selectedMember.socials.linkedin && (
                    <a
                      href={selectedMember.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border hover:border-blue hover:text-blue text-muted-foreground flex size-9 items-center justify-center rounded-sm border transition-colors"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="size-4" />
                    </a>
                  )}
                  {selectedMember.socials.twitter && (
                    <a
                      href={selectedMember.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border text-muted-foreground flex size-9 items-center justify-center rounded-sm border transition-colors hover:border-sky-500 hover:text-sky-500"
                      aria-label="Twitter Profile"
                    >
                      <Twitter className="size-4" />
                    </a>
                  )}
                  {selectedMember.socials.website && (
                    <a
                      href={selectedMember.socials.website}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border hover:border-orange hover:text-orange text-muted-foreground flex size-9 items-center justify-center rounded-sm border transition-colors"
                      aria-label="Personal Website"
                    >
                      <Globe className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
