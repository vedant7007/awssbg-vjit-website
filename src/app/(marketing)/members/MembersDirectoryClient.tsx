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
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { Member } from "@/lib/types";

// Role styling map
const getTierColor = (role: string) => {
  const lowercaseRole = role.toLowerCase();
  if (lowercaseRole.includes("captain") || lowercaseRole === "core") return "#FF9900"; // AWS Gold/Orange
  if (lowercaseRole.includes("lead")) return "#4DA6FF"; // Cloud Blue
  if (lowercaseRole.includes("coordinator")) return "#2DD4BF"; // Teal
  return "#8B93A1"; // Muted Slate
};

// Certification styling map
const getCertColor = (cert: string) => {
  const lowercaseCert = cert.toLowerCase();
  if (lowercaseCert.includes("architect")) {
    return {
      bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      badge: "bg-blue-500 text-white",
      label: "SAA",
    };
  }
  if (lowercaseCert.includes("developer")) {
    return {
      bg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      badge: "bg-purple-500 text-white",
      label: "DVA",
    };
  }
  return {
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    badge: "bg-amber-500 text-white",
    label: "CCP",
  };
};

export function MembersDirectoryClient({ initialMembers }: { initialMembers: Member[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Filter Options
  const certOptions = [
    { label: "All Credentials", value: "All" },
    { label: "Cloud Practitioner (CCP)", value: "practitioner" },
    { label: "Solutions Architect (SAA)", value: "architect" },
    { label: "Developer Associate (DVA)", value: "developer" },
    { label: "Cloud Enthusiasts (None)", value: "None" },
  ];

  // Dynamic filter collections
  const branches = Array.from(new Set(initialMembers.map((m) => m.branch).filter(Boolean)));
  const branchOptions = ["All", ...branches];

  // Map batch years to standard display years (e.g. 2027 -> 3rd Year)
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

  const years = Array.from(
    new Set(initialMembers.map((m) => getStudyYear(m.batchYear)).filter(Boolean)),
  );
  const yearOptions = ["All", ...years];

  // Filtering Logic
  const filteredMembers = initialMembers.filter((member) => {
    // Search filter
    const matchesSearch =
      member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.team && member.team.toLowerCase().includes(searchQuery.toLowerCase())) ||
      member.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());

    // Certifications filter
    let matchesCert = true;
    const certList = member.skills.filter((s) =>
      /aws|certified|practitioner|architect|developer/i.test(s),
    );
    if (selectedCert !== "All") {
      if (selectedCert === "None") {
        matchesCert = certList.length === 0;
      } else {
        matchesCert = certList.some((c) => c.toLowerCase().includes(selectedCert.toLowerCase()));
      }
    }

    // Study Year filter
    const matchesYear = selectedYear === "All" || getStudyYear(member.batchYear) === selectedYear;

    // Branch/Department filter
    const matchesBranch = selectedBranch === "All" || member.branch === selectedBranch;

    return matchesSearch && matchesCert && matchesYear && matchesBranch;
  });

  // Dynamic Statistics
  const totalCount = initialMembers.length;
  const certifiedList = initialMembers.filter((m) =>
    m.skills.some((s) => /aws|certified|practitioner|architect|developer/i.test(s)),
  );
  const certifiedCount = certifiedList.length;
  const associateCount = initialMembers.filter((m) =>
    m.skills.some((s) => /architect|developer/i.test(s)),
  ).length;

  return (
    <div className="space-y-12">
      {/* ── STATS DASHBOARD ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Members",
            val: totalCount,
            icon: GraduationCap,
            color: "text-orange",
          },
          {
            label: "Certified Members",
            val: certifiedCount,
            icon: Award,
            color: "text-blue",
          },
          {
            label: "Associate level",
            val: associateCount,
            icon: BookOpen,
            color: "text-purple",
          },
          {
            label: "Cloud Enthusiasts",
            val: totalCount - certifiedCount,
            icon: Sparkles,
            color: "text-magenta",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-card border-border/80 flex flex-col items-center justify-center rounded-sm border p-4 text-center backdrop-blur-sm transition-colors hover:bg-card/85"
          >
            <stat.icon className={`size-5 mb-2 ${stat.color}`} />
            <span className="font-display text-2xl font-bold md:text-3xl">{stat.val}</span>
            <span className="text-muted-foreground mt-1 text-xs">{stat.label}</span>
          </div>
        ))}
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
            className="w-full bg-paper/50 border-border/80 rounded-sm py-2.5 pr-4 pl-11 text-sm outline-none focus:border-orange focus:ring-1 focus:ring-orange/50 transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase mb-1.5">
              Certification
            </span>
            <select
              value={selectedCert}
              onChange={(e) => setSelectedCert(e.target.value)}
              className="w-full bg-paper border border-border/80 rounded-sm py-2 px-3 text-xs outline-none focus:border-orange transition-all cursor-pointer"
            >
              {certOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase mb-1.5">
              Year of Study
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-paper border border-border/80 rounded-sm py-2 px-3 text-xs outline-none focus:border-orange transition-all cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase mb-1.5">
              Branch/Department
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-paper border border-border/80 rounded-sm py-2 px-3 text-xs outline-none focus:border-orange transition-all cursor-pointer"
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
              const tierColor = getTierColor(member.role);
              const certs = member.skills.filter((s) =>
                /aws|certified|practitioner|architect|developer/i.test(s),
              );
              const primaryCert = certs.length > 0 ? certs[0] : null;
              const certTheme = primaryCert ? getCertColor(primaryCert) : null;

              return (
                <motion.div
                  key={member.id}
                  layoutId={`member-card-${member.id}`}
                  onClick={() => setSelectedMember(member)}
                  className="bg-card hover:border-orange border-border/80 group flex cursor-pointer flex-col justify-between rounded-sm border p-4 transition-all hover:bg-card/95 hover:shadow-md hover:shadow-orange/5"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div>
                    {/* Header: Photo and Badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="relative size-12 overflow-hidden rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}05)`,
                          border: `1.5px solid ${tierColor}30`,
                        }}
                      >
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span style={{ color: tierColor }}>
                            {member.displayName.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Certification tag */}
                      {certTheme && (
                        <span
                          className={`font-mono text-[9px] font-semibold px-2 py-0.5 rounded-sm border tracking-wider ${certTheme.bg}`}
                        >
                          {certTheme.label}
                        </span>
                      )}
                    </div>

                    {/* Member Identity */}
                    <h3 className="font-display font-semibold tracking-tight text-ink group-hover:text-orange transition-colors">
                      {member.displayName}
                    </h3>
                    <p
                      className="font-mono text-[10px] tracking-wide uppercase font-semibold mt-1"
                      style={{ color: tierColor }}
                    >
                      {member.role === "core" && member.team === "Core" ? "Captain" : member.role}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {getStudyYear(member.batchYear)} &bull; {member.branch}
                    </p>

                    {/* Bio Snip */}
                    <p className="text-muted-foreground text-xs mt-3 line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Skills Cloud */}
                  <div className="mt-5 pt-3 border-t">
                    <div className="flex flex-wrap gap-1 mb-4 h-[22px] overflow-hidden">
                      {member.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="bg-paper border border-border/80 rounded-sm px-1.5 py-0.5 text-[9px] text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="text-[9px] text-muted-foreground/60 px-1 py-0.5">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Link outs */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-orange tracking-wide group-hover:underline">
                        View profile &rarr;
                      </span>

                      <div className="flex items-center gap-2">
                        {member.socials.github && (
                          <a
                            href={member.socials.github}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground/60 hover:text-ink transition-colors p-1"
                            aria-label="GitHub"
                          >
                            <Github className="size-3.5" />
                          </a>
                        )}
                        {member.socials.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground/60 hover:text-blue transition-colors p-1"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border-border/80 border flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto rounded-sm backdrop-blur-sm"
          >
            <AlertCircle className="size-8 text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-ink">No Members Found</h3>
            <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
              We couldn't find any members matching your current filters. Try resetting the criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCert("All");
                setSelectedYear("All");
                setSelectedBranch("All");
              }}
              className="bg-primary hover:bg-orange/85 text-primary-foreground font-mono text-xs tracking-wider uppercase px-4 py-2 mt-5 rounded-sm shadow-sm transition-colors cursor-pointer"
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`member-card-${selectedMember.id}`}
              className="bg-card border-border/80 relative z-10 w-full max-w-lg overflow-hidden border rounded-sm p-6 sm:p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="text-muted-foreground hover:text-ink absolute top-4 right-4 rounded-sm p-1 transition-colors hover:bg-paper cursor-pointer"
              >
                <X className="size-4" />
              </button>

              {/* Identity Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <div
                  className="size-16 overflow-hidden rounded-full flex items-center justify-center font-bold text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${getTierColor(selectedMember.role)}20, ${getTierColor(selectedMember.role)}05)`,
                    border: `2px solid ${getTierColor(selectedMember.role)}30`,
                  }}
                >
                  {selectedMember.photoURL ? (
                    <img
                      src={selectedMember.photoURL}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span style={{ color: getTierColor(selectedMember.role) }}>
                      {selectedMember.displayName.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="text-center sm:text-left pt-1">
                  <h3 className="font-display font-bold text-xl leading-none text-ink">
                    {selectedMember.displayName}
                  </h3>
                  <p
                    className="font-mono text-xs tracking-wider uppercase font-semibold mt-2"
                    style={{ color: getTierColor(selectedMember.role) }}
                  >
                    {selectedMember.role === "core" && selectedMember.team === "Core"
                      ? "Club Captain"
                      : `${selectedMember.role} • ${selectedMember.team}`}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {getStudyYear(selectedMember.batchYear)} &bull; {selectedMember.branch} &bull; VJIT
                  </p>
                </div>
              </div>

              {/* Bio block */}
              <div className="space-y-5 mb-6">
                <div className="bg-paper/40 border border-border/60 rounded-sm p-4">
                  <h4 className="font-mono text-[9px] font-bold text-muted-foreground tracking-wide uppercase mb-1.5">
                    Biography
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Certifications (if any) */}
                {selectedMember.skills.some((s) =>
                  /aws|certified|practitioner|architect|developer/i.test(s),
                ) && (
                  <div className="bg-paper/40 border border-border/60 rounded-sm p-4">
                    <h4 className="font-mono text-[9px] font-bold text-muted-foreground tracking-wide uppercase mb-2.5">
                      AWS Credentials
                    </h4>
                    <div className="space-y-2">
                      {selectedMember.skills
                        .filter((s) => /aws|certified|practitioner|architect|developer/i.test(s))
                        .map((cert) => {
                          const certTheme = getCertColor(cert);
                          return (
                            <div
                              key={cert}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-semibold ${certTheme.bg}`}
                            >
                              <Award className="size-4 shrink-0" />
                              <span>{cert}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Core skills cloud */}
                <div>
                  <h4 className="font-mono text-[9px] font-bold text-muted-foreground tracking-wide uppercase mb-2">
                    Core Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-paper border border-border rounded-sm px-2.5 py-1 text-xs text-muted-foreground hover:border-orange/40 hover:text-ink transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer & socials */}
              <div className="flex items-center justify-between pt-4 border-t border-border/80">
                <span className="font-mono text-[9px] tracking-wide text-muted-foreground/60 uppercase">
                  AWS Student Builder Group VJIT
                </span>

                <div className="flex items-center gap-2">
                  {selectedMember.socials.github && (
                    <a
                      href={selectedMember.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-border hover:border-ink hover:text-ink text-muted-foreground size-9 rounded-sm flex items-center justify-center transition-colors"
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
                      className="border border-border hover:border-blue hover:text-blue text-muted-foreground size-9 rounded-sm flex items-center justify-center transition-colors"
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
                      className="border border-border hover:border-sky-500 hover:text-sky-500 text-muted-foreground size-9 rounded-sm flex items-center justify-center transition-colors"
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
                      className="border border-border hover:border-orange hover:text-orange text-muted-foreground size-9 rounded-sm flex items-center justify-center transition-colors"
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
