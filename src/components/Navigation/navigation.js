import { Home } from "../../pages/Home";
import { Login } from "../../pages/Login";
import { Members } from "../../pages/Members";
import { MemberAttendances } from "../../pages/MemberAttendances";
import { MemberBeltTests } from "../../pages/MemberBeltTests";
import { MemberPayments } from "../../pages/MemberPayments";
import { MemberSubscriptions } from "../../pages/MemberSubscriptions";
import { Trainers } from "../../pages/Trainers";
import { TrainerBeltTests } from "../../pages/TrainerBeltTests";
import { TrainerKarateClasses } from "../../pages/TrainerKarateClasses";
import { Payments } from "../../pages/Payments";
import { Reports } from "../../pages/Reports";
import { Subscriptions } from "../../pages/Subscriptions";
import { Sessions } from "../../pages/Sessions";
import { SessionAttendances } from "../../pages/SessionAttendances";
import { BeltTests } from "../../pages/BeltTests";
import { Attendances } from "../../pages/Attendances";
import { BeltRanks } from "../../pages/BeltRanks";
import { BeltTestsByRank } from "../../pages/BeltTestsByRank";
import { KarateClasses } from "../../pages/KarateClasses";
import { KarateClassesSessions } from "../../pages/KarateClassesSessions";
import { KarateClassesSubscriptions } from "../../pages/KarateClassesSubscriptions";
import { WebSite } from "../../pages/WebSite";
import { Notifications } from "../../pages/Notifications";
import { Settings } from "../../pages/Settings";
import { Users } from "../../pages/Users";

export const ROLES = {
  ADMIN: "admin",
};

export const nav = [
  {
    path: "/login",
    name: "Login",
    element: <Login />,
    isPrivate: false,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/",
    name: "Home",
    element: <Home />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: "/members",
    name: "Members",
    element: <Members />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/MemberAttendances/:member_id",
    name: "MemberAttendances",
    element: <MemberAttendances />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/MemberBeltTests/:member_id",
    name: "MemberBeltTests",
    element: <MemberBeltTests />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/MemberPayments/:member_id",
    name: "MemberPayments",
    element: <MemberPayments />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/MemberSubscriptions/:member_id",
    name: "MemberSubscriptions",
    element: <MemberSubscriptions />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/users",
    name: "Users",
    element: <Users />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/trainers",
    name: "Trainers",
    element: <Trainers />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: "/TrainerBeltTests/:trainer_id",
    name: "Trainers",
    element: <TrainerBeltTests />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/TrainerKarateClasses/:trainer_id",
    name: "TrainerKarateClasses",
    element: <TrainerKarateClasses />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/attendances",
    name: "Attendances",
    element: <Attendances />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/sessions",
    name: "Sessions",
    element: <Sessions />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/SessionAttendances/:session_id",
    name: "SessionAttendances",
    element: <SessionAttendances />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/belt_tests",
    name: "BeltTests",
    element: <BeltTests />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: "/subscriptions",
    name: "Subscriptions",
    element: <Subscriptions />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/payments",
    name: "Payments",
    element: <Payments />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/reports",
    name: "Reports",
    element: <Reports />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/BeltRanks",
    name: "BeltRanks",
    element: <BeltRanks />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/BeltTestsByRank/:rank_id",
    name: "BeltTestsByRank",
    element: <BeltTestsByRank />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/KarateClasses",
    name: "KarateClasses",
    element: <KarateClasses />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/KarateClassesSessions/:class_id",
    name: "KarateClassesSessions",
    element: <KarateClassesSessions />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/KarateClassesSubscriptions/:class_id",
    name: "KarateClassesSubscriptions",
    element: <KarateClassesSubscriptions />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/OurKarateClub",
    name: "WebSite",
    element: <WebSite />,
    isPrivate: false,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/Notifications",
    name: "Notifications",
    element: <Notifications />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: "/setting",
    name: "Setting",
    element: <Settings />,
    isPrivate: true,
    allowedRoles: [ROLES.ADMIN],
  },
];
