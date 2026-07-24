/**
 * Team roster — real data.
 *
 * Faculty, captain, leads and core members are real. Core members are imported
 * from the club sign-up sheet (email/phone deliberately excluded). Some leads
 * are awaiting their branch/year/socials — those fields are empty strings/null
 * and the UI hides them until filled.
 */

export type TeamKey = "tech" | "design" | "production" | "marketing" | "events";

export type Socials = {
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
};

export type RosterMember = {
  id: string;
  name: string;
  /** Their title within the group, e.g. "Tech Lead". */
  role: string;
  team: TeamKey;
  branch: string;
  year: string;
  handle: string;
  bio: string | null;
  /** Longer blurb shown on their profile. */
  about: string | null;
  /** Public path to their portrait; null falls back to initials. */
  photo: string | null;
  socials: Socials;
};

export type Faculty = {
  id: string;
  name: string;
  designation: string;
  department: string;
  /** Public path to their portrait; null renders initials instead. */
  photo: string | null;
};

/* ------------------------------- teams ---------------------------------- */

export type TeamMeta = {
  key: TeamKey;
  label: string;
  /** What this team actually does — shown on the filter and lead cards. */
  charter: string;
  /** Accent colour, matching the palette used by the homepage grid. */
  color: string;
  /** The bracket pair each team is wrapped in. Encodes the craft, not decor. */
  wrap: [string, string];
  /** SVG path for this team's hover-shine glyph, drawn around origin. */
  glyph: string;
  /** Whether the glyph reads as an outline rather than a solid shape. */
  stroke: boolean;
};

export const TEAMS: TeamMeta[] = [
  {
    key: "tech",
    label: "Tech",
    charter: "Runs the workshops, builds the labs, keeps this site deploying.",
    color: "#43B4FF",
    wrap: ["<", "/>"],
    // chevrons
    glyph: "M-11-6 -4 0-11 6M11-6 4 0 11 6",
    stroke: true,
  },
  {
    key: "design",
    label: "Design",
    charter:
      "Posters, decks, and the visual language of everything we put out.",
    color: "#FF57EA",
    wrap: ["{", "}"],
    // pen nib
    glyph: "M0 12-7-4 0-12 7-4Z",
    stroke: false,
  },
  {
    key: "production",
    label: "Production",
    charter:
      "Shoots, edits and ships the recaps, reels and session recordings.",
    color: "#2EE6A0",
    wrap: ["(", ")"],
    // play head
    glyph: "M-6-10 10 0-6 10Z",
    stroke: false,
  },
  {
    key: "marketing",
    label: "Marketing",
    charter: "Brings in speakers, partners and the students who fill the room.",
    color: "#FF9900",
    wrap: ["@", ""],
    // broadcast signal
    glyph:
      "M-11 3a14 14 0 0 1 22 0M-6.5 8a8 8 0 0 1 13 0M-1.7 12.4a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0",
    stroke: true,
  },
  {
    key: "events",
    label: "Event Management",
    charter: "Venue, schedule, check-in — the reason things start on time.",
    color: "#AD5CFF",
    wrap: ["[", "]"],
    // ticket stub
    glyph: "M-12-8h24v5a3 3 0 0 0 0 6v5h-24v-5a3 3 0 0 0 0-6z",
    stroke: true,
  },
];

export const TEAM_BY_KEY: Record<TeamKey, TeamMeta> = TEAMS.reduce(
  (acc, t) => {
    acc[t.key] = t;
    return acc;
  },
  {} as Record<TeamKey, TeamMeta>,
);

/* ------------------------------- faculty -------------------------------- */

export const FACULTY: Faculty[] = [
  {
    id: "f-principal",
    name: "Dr. A. Srujana",
    designation: "Principal",
    department: "Vidya Jyothi Institute of Technology",
    photo: "/team/faculty/principal.jpg",
  },
  {
    id: "f-hod",
    name: "Dr. D. Aruna Kumari",
    designation: "Professor & Head of Department",
    department: "Computer Science & Engineering",
    photo: "/team/faculty/hod.jpg",
  },
  {
    id: "f-advisor-1",
    name: "Mr. P. Rajashekar",
    designation: "Faculty Advisor",
    department: "Computer Science & Engineering",
    photo: "/team/faculty/advisor-1.jpg",
  },
  {
    id: "f-advisor-2",
    name: "Mr. Subbaraya Sarma PKV",
    designation: "Faculty Advisor",
    department: "Computer Science & Engineering",
    photo: "/team/faculty/advisor-2.jpg",
  },
];

/* ------------------------------- captain -------------------------------- */

export const CAPTAIN: RosterMember & { quote: string } = {
  id: "captain",
  name: "Ruthvik",
  role: "Group Leader",
  team: "tech",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  handle: "ruthvik",
  bio: "Started the AWS Student Builder Group at VJIT and runs it end to end — sessions, partnerships, and the core team.",
  about:
    "Started the AWS Student Builder Group at VJIT and runs it end to end — sessions, partnerships, and the core team.",
  quote:
    "A single event can spark curiosity. A strong community can ignite a career. That's the future we're building at AWS SBG VJIT.",
  photo: "/team/ruthvik.png",
  socials: { linkedin: null, github: null, instagram: null },
};

/* -------------------------------- leads --------------------------------- */

/** One lead per team. */
export const LEADS: RosterMember[] = [
  {
    id: "l-tech",
    name: "Vedant M Idlgave",
    role: "Tech Lead",
    team: "tech",
    branch: "CSE",
    year: "3rd Year",
    handle: "vedantidlgave",
    bio: null,
    about: null,
    photo: "/team/members/vedantidlgave.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/vedant-idlgave-1514323063103vtsd",
      github: "https://github.com/vedant7007",
      instagram: "https://www.instagram.com/vedxnt.fr",
    },
  },
  {
    id: "l-design",
    name: "Sai Medha",
    role: "Design Lead",
    team: "design",
    branch: "ECE",
    year: "3rd Year",
    handle: "saimedha",
    bio: null,
    about: null,
    photo: "/team/members/saimedha.jpg",
    socials: { linkedin: null, github: null, instagram: null },
  },
  {
    id: "l-production",
    name: "Jeethendra",
    role: "Production Lead",
    team: "production",
    branch: "",
    year: "",
    handle: "jeethendra",
    bio: null,
    about: null,
    photo: null,
    socials: { linkedin: null, github: null, instagram: null },
  },
  {
    id: "l-marketing",
    name: "Shaik Sameera Tanveer",
    role: "Marketing Lead",
    team: "marketing",
    branch: "CSE",
    year: "3rd Year",
    handle: "shaiksameera",
    bio: null,
    about: "stay iconic ⭐️🪩🧸💿🌙",
    photo: "/team/members/shaiksameera.jpg",
    socials: {
      linkedin: null,
      github: null,
      instagram: "https://instagram.com/samiiifr",
    },
  },
  {
    id: "l-events",
    name: "Sai Srujan",
    role: "Event Management Lead",
    team: "events",
    branch: "IT",
    year: "3rd Year",
    handle: "saisrujan",
    bio: null,
    about: null,
    photo: "/team/members/saisrujan.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/saisrujanpunati",
      github: "https://github.com/saiusesgithub",
      instagram: "https://www.instagram.com/__saisrujan__/",
    },
  },
];

/* ------------------------------ core team ------------------------------- */

/**
 * Real members, imported from the club sign-up sheet. Email and phone from the
 * form are intentionally NOT stored here — only what belongs on a public
 * profile. Regenerate from the sheet when it changes.
 */
export const CORE: RosterMember[] = [
  {
    id: "m-1",
    name: "Tenneti Bhavani Devi",
    role: "Core Member",
    team: "production",
    branch: "IT",
    year: "3rd Year",
    handle: "tennetibhavani",
    bio: null,
    about:
      "Hi, I'm Tenneti Bhavani Devi, a B.Tech IT student at Vidya Jyoti Institute of Technology and a member of the AWS Cloud Production Team. I enjoy working behind the scenes to ensure events run smoothly and believe in teamwork, creativity, and continuous learning.",
    photo: "/team/members/tennetibhavani.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/tenneti-bhavani-devi-a2a24932a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/tennetibhavanidevi",
      instagram: "https://instagram.com/Clicksbyammu",
    },
  },
  {
    id: "m-2",
    name: "D.Jashwanth Sai",
    role: "Core Member",
    team: "events",
    branch: "CSE-DS",
    year: "2nd Year",
    handle: "djashwanthsai",
    bio: null,
    about:
      "I am a friendly guy who believes in giving equal opportunity to everyone and striving hard to achieve my goals",
    photo: null,
    socials: {
      linkedin:
        "https://www.linkedin.com/in/jashwanth-desu-67a476383?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/jashwanth-cmd",
      instagram: "https://instagram.com/Jashu_0830",
    },
  },
  {
    id: "m-3",
    name: "Hanu Verma",
    role: "Core Member",
    team: "tech",
    branch: "IT",
    year: "2nd Year",
    handle: "hanuverma",
    bio: null,
    about: "touching some grass 😌",
    photo: "/team/members/hanuverma.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/hanuverma22/",
      github: "https://github.com/hanuverma537-netizen",
      instagram: "https://instagram.com/idkver._.maric",
    },
  },
  {
    id: "m-4",
    name: "Jaswanth Reddy",
    role: "Core Member",
    team: "tech",
    branch: "CSE",
    year: "3rd Year",
    handle: "jaswanthreddy",
    bio: null,
    about: "I am Jaswanth",
    photo: "/team/members/jaswanthreddy.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/jasreaug/",
      github: "https://github.com/Jaswanth-Reddy-2006",
      instagram: null,
    },
  },
  {
    id: "m-5",
    name: "Abhinav",
    role: "Core Member",
    team: "tech",
    branch: "CSE",
    year: "3rd Year",
    handle: "abhinav",
    bio: null,
    about:
      "I'm a Computer Science undergraduate and frontend developer passionate about building modern, user-friendly web applications. I enjoy working with React, Next.js, and AI-powered technologies to create impactful projects. I'm also an active learner in cloud computing and open-source, always exploring AWS services and collaborating with developer communities through hackathons, events, and real-world projects.",
    photo: "/team/members/abhinav.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/abhinav-nakka-5133b1356?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/Abhinav1480",
      instagram: "https://www.instagram.com/ab_hinav1480",
    },
  },
  {
    id: "m-6",
    name: "Plintoff",
    role: "Core Member",
    team: "events",
    branch: "CSE",
    year: "3rd Year",
    handle: "plintoff",
    bio: null,
    about:
      "AWS is a leading cloud computing platform that provides services such as computing, storage, databases, networking, and AI. It helps businesses build scalable, secure, and cost-effective applications. I am interested in learning AWS because cloud computing is an essential skill for the future, and I want to gain hands-on experience with services like EC2, S3, Lambda, and VPC through the AWS Cloud Club",
    photo: "/team/members/plintoff.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/plintoff-d-435b98332?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      github: "https://github.com/dplintoff",
      instagram: "https://www.instagram.com/plintoff_19",
    },
  },
  {
    id: "m-7",
    name: "Tarunn",
    role: "Core Member",
    team: "production",
    branch: "MECH",
    year: "3rd Year",
    handle: "tarunn",
    bio: null,
    about:
      "I create cinematic edits, public reaction videos, and Instagram Reels, and digital /content creator",
    photo: null,
    socials: {
      linkedin:
        "https://www.linkedin.com/in/tarun-kumar-518961388?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      github: "https://github.com/tarun29345",
      instagram: "https://instagram.com/tarunnmudhirajj69",
    },
  },
  {
    id: "m-8",
    name: "V Thanishka",
    role: "Core Member",
    team: "design",
    branch: "CSE",
    year: "3rd Year",
    handle: "vthanishka",
    bio: null,
    about:
      "plot twist: still figuring it out creating and designing the aws sbg club<3",
    photo: "/team/members/vthanishka.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/v-thanishka-422b85318?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/vthanishka",
      instagram: "https://instagram.com/vthanishkaa",
    },
  },
  {
    id: "m-9",
    name: "R.Sahithi reddy",
    role: "Core Member",
    team: "design",
    branch: "CSE",
    year: "3rd Year",
    handle: "rsahithireddy",
    bio: null,
    about:
      "I'm Sahithi Reddy, a B.Tech student who loves technology, design, and continuous learning. I enjoy creating creative designs, exploring new ideas, and improving my technical skills through projects and teamwork.",
    photo: "/team/members/rsahithireddy.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/sahithi-reddy-70abb0355?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: null,
    },
  },
  {
    id: "m-10",
    name: "Eshwar Sai",
    role: "Core Member",
    team: "events",
    branch: "ECE",
    year: "2nd Year",
    handle: "eshwarsai",
    bio: null,
    about:
      "I am Eshwar sai , a B.Tech student at Vidya Jyothi Institute of Technology (VJIT) and an active member of the AWS Cloud Club VJIT Event Management Team. I am passionate about technology, cloud computing, and organizing impactful technical events. I enjoy working with teams to plan workshops, hackathons, and community initiatives that inspire learning and innovation. I am always eager to develop new skills, take on challenges, and contribute to creating a vibrant tech community.",
    photo: "/team/members/eshwarsai.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/eshwar-sai-7428aa3a7?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/Eshwarsai623",
      instagram: "https://www.instagram.com/eshwarsai4207",
    },
  },
  {
    id: "m-11",
    name: "Addisherla Rushi Keshava",
    role: "Core Member",
    team: "events",
    branch: "ECE",
    year: "2nd Year",
    handle: "addisherlarush",
    bio: null,
    about:
      "I am RUSHI KESHAVA, a B.Tech student at Vidya Jyothi Institute of Technology (VJIT) and an active member of the AWS SBG VJIT Event Management Team. I am passionate about technology, cloud computing, and organizing impactful technical events. I enjoy working with teams to plan workshops, hackathons, and community initiatives that inspire learning and innovation. I am always eager to develop new skills, take on challenges, and contribute to creating a vibrant tech community.",
    photo: "/team/members/addisherlarush.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/addisherla-rushi-keshava-42a18a412?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/Rushikesh-0",
      instagram: "https://www.instagram.com/_rushikesh____01",
    },
  },
  {
    id: "m-13",
    name: "Ayush Kumar",
    role: "Core Member",
    team: "design",
    branch: "CSE-AIML",
    year: "2nd Year",
    handle: "ayushkumar",
    bio: null,
    about: "Designing with purpose and precision",
    photo: "/team/members/ayushkumar.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/ayush-kumar-j",
      github: "https://github.com/ayushkujha",
      instagram: "https://www.instagram.com/ayush_kumar_978",
    },
  },
  {
    id: "m-14",
    name: "Anjana Saripella",
    role: "Core Member",
    team: "design",
    branch: "CSE",
    year: "3rd Year",
    handle: "anjanasaripell",
    bio: null,
    about:
      "I'm Anjana, a CSE student who loves blending creativity with technology. Whether it's designing posters, building projects, or learning something new, I enjoy bringing ideas to life and working with others to create meaningful experiences.",
    photo: "/team/members/anjanasaripell.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/anjana-saripella-846798353",
      github: null,
      instagram: "https://instagram.com/anjanaaa26",
    },
  },
  {
    id: "m-15",
    name: "N.Varsha",
    role: "Core Member",
    team: "events",
    branch: "CSE-AIML",
    year: "2nd Year",
    handle: "nvarsha",
    bio: null,
    about:
      "I'm Varsha, and I'm part of the Event Management team at AWS SBG. I love being involved in creative ideas. I'm someone who enjoys learning, trying new things, and working with people to create meaningful experiences.",
    photo: "/team/members/nvarsha.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/varsha-510090380?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: "https://www.instagram.com/varshhaa.7",
    },
  },
  {
    id: "m-16",
    name: "Akshitha A",
    role: "Core Member",
    team: "marketing",
    branch: "IT",
    year: "2nd Year",
    handle: "akshithaa",
    bio: null,
    about: "Growing through what i go through",
    photo: "/team/members/akshithaa.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/akshitha-a-381117392?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: "https://instagram.com/akshithaa_016",
    },
  },
  {
    id: "m-17",
    name: "Chiluveri Varshith",
    role: "Core Member",
    team: "marketing",
    branch: "CSE",
    year: "2nd Year",
    handle: "chiluverivarsh",
    bio: null,
    about: "Chasing Excellence",
    photo: "/team/members/chiluverivarsh.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/chiluveri-varshith-a98bb3365?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/chvarshith25-bit",
      instagram: "https://instagram.com/Chiluveri_Varshith",
    },
  },
  {
    id: "m-18",
    name: "Vaddineni Akhil",
    role: "Core Member",
    team: "marketing",
    branch: "CSE",
    year: "2nd Year",
    handle: "vaddineniakhil",
    bio: null,
    about:
      "I'm Akhil, a B.Tech Computer Science (CSE) student at Vidya Jyoti Institute of Technology. I'm passionate about AI, full-stack development, hackathons, and building innovative web applications. I enjoy creating modern UI/UX designs, exploring new technologies, and working on real-world projects like AI-powered platforms.My goal is to become a skilled software engineer and build impactful AI solutions.",
    photo: "/team/members/vaddineniakhil.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/v-akhil-0086a4383?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/VAkhil-max",
      instagram: "https://instagram.com/akhil123_9866",
    },
  },
  {
    id: "m-19",
    name: "Laasya Kavuri",
    role: "Core Member",
    team: "tech",
    branch: "ECE",
    year: "2nd Year",
    handle: "laasyakavuri",
    bio: null,
    about:
      "Quietly learning, consistently building, and always looking for ways to turn imagination into meaningful innovation",
    photo: "/team/members/laasyakavuri.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/laasya-kavuri-a297a4374?",
      github: "https://github.com/laasyakavuri",
      instagram: null,
    },
  },
  {
    id: "m-20",
    name: "Mohammed Mohiuddin",
    role: "Core Member",
    team: "marketing",
    branch: "CSE-AIML",
    year: "2nd Year",
    handle: "mohammedmohiud",
    bio: null,
    about:
      "A passionate web developer and AI enthusiast dedicated to building impactful digital experiences through clean design, innovative ideas, and scalable solutions.",
    photo: "/team/members/mohammedmohiud.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/mohammed-mohi-uddin-aa4ba934b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/mohi2006august",
      instagram: "https://instagram.com/Moh_iuddin18",
    },
  },
  {
    id: "m-21",
    name: "Siri beesu",
    role: "Core Member",
    team: "events",
    branch: "CSE",
    year: "3rd Year",
    handle: "siribeesu",
    bio: null,
    about: "tech enthusiast",
    photo: "/team/members/siribeesu.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/siri-beesu-96a6b730a/",
      github: "https://github.com/siribeesu/",
      instagram: "https://www.instagram.com/siri_s95",
    },
  },
  {
    id: "m-22",
    name: "akshithi dudekula",
    role: "Core Member",
    team: "tech",
    branch: "CSE-AIML",
    year: "2nd Year",
    handle: "akshithidudeku",
    bio: null,
    about:
      "I am an aspiring developer part of the AWS Tech team who is good in working with UI/UX. I love to Explore the world of designs, colors and portray them through my work.",
    photo: "/team/members/akshithidudeku.jpg",
    socials: {
      linkedin: null,
      github: "https://github.com/mail2akshithi-ops",
      instagram: null,
    },
  },
  {
    id: "m-23",
    name: "Venkata Sai Bhavya Koduri",
    role: "Core Member",
    team: "marketing",
    branch: "CSE",
    year: "3rd Year",
    handle: "venkatasaibhav",
    bio: null,
    about: "Student",
    photo: null,
    socials: {
      linkedin: "https://www.linkedin.com/in/bhavya-koduri",
      github: null,
      instagram: "https://www.instagram.com/bhavyachowdaryy",
    },
  },
  {
    id: "m-24",
    name: "Ananya L",
    role: "Core Member",
    team: "design",
    branch: "CSE",
    year: "2nd Year",
    handle: "ananyal",
    bio: null,
    about: "professional onion hater",
    photo: "/team/members/ananyal.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/ananya-l-72889539b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/lemonananya13-cell",
      instagram: "https://instagram.com/errorananya404",
    },
  },
  {
    id: "m-25",
    name: "Aarush J",
    role: "Core Member",
    team: "tech",
    branch: "ECE",
    year: "2nd Year",
    handle: "aarushj",
    bio: null,
    about: "In the darkest hours, I shine the brightest ⭐",
    photo: "/team/members/aarushj.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/aarush-jangam-64a452380?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/Aarush-V-J",
      instagram: "https://instagram.com/aarush._j",
    },
  },
  {
    id: "m-26",
    name: "Riya Jha",
    role: "Core Member",
    team: "events",
    branch: "IT",
    year: "2nd Year",
    handle: "riyajha",
    bio: null,
    about: "Orchestrator",
    photo: null,
    socials: {
      linkedin:
        "https://www.linkedin.com/in/riya-jha-b35133306?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: "https://www.instagram.com/riya_jha1204",
    },
  },
  {
    id: "m-27",
    name: "A.Rohan",
    role: "Core Member",
    team: "design",
    branch: "ECE",
    year: "2nd Year",
    handle: "arohan",
    bio: null,
    about: "I like cool stuff !",
    photo: "/team/members/arohan.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/rohan-mudiraj-a291163b0?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: "https://instagram.com/m3rohan",
    },
  },
  {
    id: "m-28",
    name: "A.karan pawar",
    role: "Core Member",
    team: "production",
    branch: "CSE",
    year: "3rd Year",
    handle: "akaranpawar",
    bio: null,
    about:
      "Passionate about creating seamless event experiences through planning, coordination, and execution",
    photo: "/team/members/akaranpawar.jpg",
    socials: {
      linkedin: null,
      github: null,
      instagram: "https://instagram.com/Wtf_.karan",
    },
  },
  {
    id: "m-29",
    name: "Manoj Achari",
    role: "Core Member",
    team: "marketing",
    branch: "IT",
    year: "3rd Year",
    handle: "manojachari",
    bio: null,
    about:
      "I'm Manoj Achari, a B.Tech Information Technology student at VJIT. I enjoy teamwork, communication, and contributing to meaningful activities.",
    photo: "/team/members/manojachari.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/p-manoj-achari-774045356?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: "https://github.com/manojachari0630",
      instagram: "https://instagram.com/mr.manoj_61",
    },
  },
  {
    id: "m-30",
    name: "Bharath Reddy Kodiganti",
    role: "Core Member",
    team: "events",
    branch: "CSE-DS",
    year: "2nd Year",
    handle: "bharathreddyko",
    bio: null,
    about:
      "I am k Bharath reddy a B.Tech student at Vidya Jyothi Institute of Technology (VJIT) and an active member of the AWS Cloud Club VJIT Event Management Team. I am passionate about technology, cloud computing, and organizing impactful technical events. I enjoy working with teams to plan workshops, hackathons, and community initiatives that inspire learning and innovation. I am always eager to develop new skills, take on challenges, and contribute to creating a vibrant tech community.",
    photo: "/team/members/bharathreddyko.jpg",
    socials: {
      linkedin:
        "https://www.linkedin.com/in/bharath-reddy-kodiganti-a0348a3ab?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      github: null,
      instagram: "https://instagram.com/bharathh.reddy14",
    },
  },
  {
    id: "m-31",
    name: "D.Uday Kiran Reddy",
    role: "Core Member",
    team: "marketing",
    branch: "CSE",
    year: "2nd Year",
    handle: "dudaykiranredd",
    bio: null,
    about: "CHASING EXCELLENCE",
    photo: null,
    socials: { linkedin: null, github: null, instagram: null },
  },
];

/* ------------------------------- helpers -------------------------------- */

/** Titles are stripped first, or every faculty member initialises to "DR". */
const HONORIFICS = new Set(["dr", "mr", "mrs", "ms", "prof", "shri", "smt"]);

export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((p) => !HONORIFICS.has(p.replace(/\./g, "").toLowerCase()));
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Placeholder portrait: an inline SVG in the member's team colour. Generated
 * rather than fetched so the page works offline and nothing 404s while we wait
 * on real photos. Swap `avatarUrl` for the uploaded image when it exists.
 */
export function placeholderAvatar(name: string, color: string): string {
  const text = initialsOf(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="560" viewBox="0 0 440 560">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
<stop offset="100%" stop-color="${color}" stop-opacity="0.05"/>
</linearGradient>
</defs>
<rect width="440" height="560" fill="none"/>
<circle cx="220" cy="300" r="150" fill="url(#g)"/>
<circle cx="220" cy="300" r="150" fill="none" stroke="${color}" stroke-opacity="0.5" stroke-width="2"/>
<text x="220" y="300" fill="#fff" fill-opacity="0.92" font-family="ui-monospace, monospace" font-size="96" font-weight="700" letter-spacing="4" text-anchor="middle" dominant-baseline="central">${text}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TEAM_COUNTS = {
  faculty: FACULTY.length,
  leads: LEADS.length,
  core: CORE.length,
} as const;
