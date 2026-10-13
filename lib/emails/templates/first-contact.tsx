import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from "react-email";

type FirstContactEmailProps = {
  name: string;
  url: string;
};

export function FirstContactEmail({ name, url }: FirstContactEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Continue where you left off</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Georgia, serif" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading as="h1">Hi {name},</Heading>
          <Text>
            Thank you for reaching out. When you're ready, you can pick up
            right where you left off.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "4px",
            }}
          >
            Continue
          </Button>
        </Container>
      </Body>
    </Html>
  );
}