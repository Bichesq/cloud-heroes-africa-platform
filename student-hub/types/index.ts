import { DefaultSession } from "next-auth";
export type ApprovedEmailStatus = "approved" | "revoked" | "pending";
export type ApprovedEmailSource = "form" | "manual" | "import";

export type ApprovedEmail = {
  id: string;
  email: string;
  status: ApprovedEmailStatus;
  source: ApprovedEmailSource;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type StudentStatus = "active" | "banned";

export type Student = {
  id: string;
  approvedEmailId: string;          // FK → ApprovedEmail.id
  email: string;
  givenName: string;
  familyName: string;
  legalName?: string;
  displayName?: string;             // TODO: policy not settled
  phone?: string;
  alternateEmail?: string;
  birthDate?: string;               // ISO 8601
  city?: string;
  country?: string;
  track?: string;
  avatarUrl?: string;
  status: StudentStatus;
  lastLogin: string;                // ISO 8601
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      given_name: string;
      family_name: string;
      email: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    given_name?: string;
    family_name?: string;
    email?: string;
    picture?: string;
  }
}

export type AlertType = "info" | "warning" | "success" | "danger";

export type Alert = {
  id: number;
  type: AlertType;
  message: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
};

export type KBArticle = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  url: string;
};