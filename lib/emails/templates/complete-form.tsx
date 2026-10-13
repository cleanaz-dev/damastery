import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Tailwind,
  pixelBasedPreset,
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
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                primary: "#081F31",
                "primary-foreground": "#F3EEE3",
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Thank you for completing {formName}</Preview>
        <Body className="bg-zinc-50 font-sans text-zinc-900">
          <Container className="mx-auto my-[40px] max-w-[480px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {/* Header with logo */}
            <Section className="bg-primary px-[32px] py-[24px]">
              <Row>
                <Column align="left">
                  <Text className="m-0 text-[20px] font-bold text-primary-foreground">
                    Damastery
                  </Text>
                </Column>
                <Column align="left">
                  <Img
                    src={LOGO_URL}
                    alt="Damastery"
                    height="32"
                    style={{ display: "block", marginLeft: "auto" }}
                  />
                </Column>
              </Row>
            </Section>

            {/* Content */}
            <Section className="px-[32px] py-[32px]">
              <Heading className="m-0 mb-[16px] p-0 text-[24px] font-semibold tracking-tight text-zinc-950">
                Well done, {firstName}
              </Heading>

              <Text className="text-[15px] leading-[24px] text-zinc-600">
                Thank you for taking the time to complete the {formName}. Showing up
                honestly for this kind of work isn't easy, and it's a great step forward.
              </Text>

              <Text className="mt-[16px] text-[15px] leading-[24px] text-zinc-600">
                Real change starts with clarity, and you just gave yourself some. We'll
                review your responses and be in touch with what comes next.
              </Text>

              <Text className="mt-[16px] text-[15px] leading-[24px] text-zinc-600">
                In the meantime, you can view your client portal any time using the
                button below.
              </Text>

              <Section className="my-[32px]">
                <Button
                  href={clientPortalUrl}
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-[14px] font-medium text-white no-underline"
                >
                  View your client portal
                </Button>
              </Section>

              <Text className="m-0 text-[15px] leading-[24px] text-zinc-600">
                Proud of you for starting.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-primary px-[32px] py-[20px]">
              <Text className="m-0 text-[13px] leading-[24px] text-primary-foreground">
                © 2026 Damastery. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}