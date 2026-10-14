import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
  Img,
} from "react-email";
import { LOGO_URL } from "../config";

type MeetingBookedProps = {
  firstName: string;
  time: string;
  duration: string;
};

const clientPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`;

export function MeetingBookedEmail({
  firstName,
  time,
  duration,
}: MeetingBookedProps) {
  return;
}
