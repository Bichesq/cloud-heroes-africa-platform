import { DefaultSession } from "next-auth";

export type Student = {
  email: string;
  given_name: string;
  family_name: string;
  legal_name?: string;
  display_name?: string;       // TODO: policy not settled — include or drop?
  phone?: string;
  alternate_email?: string;
  birth_date?: string;           // ISO 8601
  city: string;
  country: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      given_name: string;
      family_name: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    given_name?: string;
    family_name?: string;
    email?: string;
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