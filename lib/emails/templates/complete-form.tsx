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

type CompleteFormEmailProps = {
  firstName: string;
  formName: string;
};

const clientPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`;

export function CompleteFormEmail({ firstName, formName }: CompleteFormEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Thank you for completing the {formName}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Row>
              <Column align="left" style={styles.verticalAlign}>
                <Text style={styles.logoText}>Damastery</Text>
              </Column>
              <Column align="right" style={styles.verticalAlign}>
                <Img
                  src={LOGO_URL}
                  alt="Damastery"
                  height="32"
                  style={styles.logoImage}
                />
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Well done, {firstName}</Heading>

            <Text style={styles.paragraph}>
              Thank you for taking the time to complete the {formName}. Showing up
              honestly for this kind of work isn't easy, and it's a great step forward.
            </Text>

            <Text style={styles.paragraph}>
              Real change starts with clarity, and you just gave yourself some. We'll
              review your responses and be in touch with what comes next.
            </Text>

            <Text style={styles.paragraph}>
              In the meantime, you can view your client portal any time using the
              button below.
            </Text>

            <Section style={styles.buttonContainer}>
              <Button href={clientPortalUrl} style={styles.button}>
                View your client portal
              </Button>
            </Section>

            <Text style={styles.signOff}>
              Proud of you for starting.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 Damastery. All rights reserved.
            </Text>
          </Section>
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
  signOff: {
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