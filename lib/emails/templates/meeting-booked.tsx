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

const clientPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`;

// --- Shared header / footer ---
function Header() {
  return (
    <Section style={styles.header}>
      <Row>
        <Column style={styles.verticalAlign}>
          <Text style={styles.logoText}>damastery.</Text>
        </Column>
        <Column align="right" style={styles.verticalAlign}>
          <Img
            src={LOGO_URL}
            alt="damastery"
            width="40"
            height="40"
            style={styles.logoImage}
          />
        </Column>
      </Row>
    </Section>
  );
}

function Footer() {
  return (
    <Section style={styles.footer}>
      <Text style={styles.footerText}>damastery.</Text>
    </Section>
  );
}

function Details({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Section style={styles.details}>
      {rows.map((r) => (
        <Row key={r.label} style={{ marginBottom: "12px" }}>
          <Column style={{ width: "100px" }}>
            <Text style={styles.detailLabel}>{r.label}</Text>
          </Column>
          <Column>
            <Text style={styles.detailValue}>{r.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

// --- 1. Email to the CLIENT ---
type MeetingBookedProps = {
  firstName: string;
  time: string; // preformatted, e.g. "Thursday, October 15 at 2:00 PM EDT"
  duration: string; // e.g. "60 minutes"
};

export function MeetingBookedEmail({ firstName, time, duration }: MeetingBookedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your session is booked for {time}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Header />
          <Section style={styles.content}>
            <Heading style={styles.heading}>Your session is booked</Heading>
            <Text style={styles.paragraph}>Hi {firstName},</Text>
            <Text style={styles.paragraph}>
              Your session is confirmed. Here are the details:
            </Text>

            <Details
              rows={[
                { label: "When", value: time },
                { label: "Length", value: duration },
              ]}
            />

            <Section style={styles.buttonContainer}>
              <Button href={clientPortalUrl} style={styles.button}>
                View in your portal
              </Button>
            </Section>

            <Text style={styles.note}>See you then.</Text>
          </Section>
          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// --- 2. Email to the ADMIN (EMAIL_TO) ---
type AdminMeetingBookedProps = {
  clientName: string;
  clientEmail: string;
  time: string;
  duration: string;
};

export function MeetingBookedAdminEmail({
  clientName,
  clientEmail,
  time,
  duration,
}: AdminMeetingBookedProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New booking: {clientName} on {time}
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Header />
          <Section style={styles.content}>
            <Heading style={styles.heading}>New session booked</Heading>
            <Text style={styles.paragraph}>
              {clientName} just booked a session.
            </Text>

            <Details
              rows={[
                { label: "Client", value: clientName },
                { label: "Email", value: clientEmail },
                { label: "When", value: time },
                { label: "Length", value: duration },
              ]}
            />
          </Section>
          <Footer />
        </Container>
      </Body>
    </Html>
  );
}

// --- Premium Inline Styles ---

const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif";

const styles = {
  main: {
    backgroundColor: "#F4F4F5",
    fontFamily,
    padding: "40px 0",
  },
  container: {
    margin: "0 auto",
    maxWidth: "480px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E4E7",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
  },
  header: {
    backgroundColor: "#081F31",
    padding: "32px",
  },
  verticalAlign: {
    verticalAlign: "middle",
  },
  logoText: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#F3EEE3",
    letterSpacing: "-0.5px",
  },
  logoImage: {
    display: "block",
    marginLeft: "auto",
  },
  content: {
    padding: "40px 32px",
  },
  heading: {
    margin: "0 0 20px",
    fontSize: "24px",
    fontWeight: "600",
    color: "#09090B",
    letterSpacing: "-0.5px",
  },
  paragraph: {
    margin: "0 0 16px",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#52525B",
  },
  details: {
    margin: "24px 0 0",
    padding: "20px 20px 8px",
    backgroundColor: "#FAFAFA",
    border: "1px solid #E4E4E7",
    borderRadius: "8px",
  },
  detailLabel: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "24px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#A1A1AA",
  },
  detailValue: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "24px",
    color: "#09090B",
  },
  buttonContainer: {
    margin: "32px 0",
  },
  button: {
    backgroundColor: "#09090B",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "14px 28px",
    borderRadius: "6px",
    display: "inline-block",
  },
  note: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "24px",
    color: "#52525B",
  },
  footer: {
    backgroundColor: "#081F31",
    padding: "24px 32px",
  },
  footerText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "24px",
    color: "#F3EEE3",
    opacity: 0.8,
  },
};