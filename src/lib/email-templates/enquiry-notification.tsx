import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface EnquiryNotificationProps {
  name?: string
  email?: string
  phone?: string
  destination?: string
  subject?: string
  travelDates?: string
  adults?: number | null
  children?: number | null
  budget?: string
  tripType?: string
  accommodationStyle?: string
  experiences?: string[]
  referralSource?: string
  sourceUrl?: string
  message?: string
  kind?: 'Enquiry' | 'Contact'
}

const row = (label: string, value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <Text style={rowStyle} key={label}>
      <strong style={labelStyle}>{label}: </strong>
      <span>{String(value)}</span>
    </Text>
  )
}

const Email = ({
  name,
  email,
  phone,
  destination,
  subject,
  travelDates,
  adults,
  children,
  budget,
  tripType,
  accommodationStyle,
  experiences,
  referralSource,
  sourceUrl,
  message,
  kind = 'Enquiry',
}: EnquiryNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New ${kind.toLowerCase()} from ${name ?? 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New {kind}</Heading>
        <Text style={lead}>
          You've received a new {kind.toLowerCase()} from the website.
        </Text>

        <Section style={card}>
          {row('Name', name)}
          {row('Email', email)}
          {row('Phone', phone)}
          {row('Destination', destination)}
          {row('Subject', subject)}
          {row('Travel dates', travelDates)}
          {row('Adults', adults ?? undefined)}
          {row('Children', children ?? undefined)}
          {row('Budget', budget)}
          {row('Trip type', tripType)}
          {row('Accommodation style', accommodationStyle)}
          {row(
            'Experiences',
            experiences && experiences.length ? experiences.join(', ') : undefined,
          )}
          {row('Referral source', referralSource)}
          {row('Source page', sourceUrl)}
        </Section>

        {message ? (
          <>
            <Hr style={hr} />
            <Text style={labelStyle}>Message</Text>
            <Text style={messageStyle}>{message}</Text>
          </>
        ) : null}

        {email ? (
          <>
            <Hr style={hr} />
            <Text style={footer}>
              Reply directly to{' '}
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>
              .
            </Text>
          </>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New ${data?.kind ?? 'Enquiry'}${data?.name ? ` from ${data.name}` : ''}`,
  displayName: 'Enquiry / Contact notification',
  to: 'info@thebaobabcollective.co.uk',
  previewData: {
    kind: 'Enquiry',
    name: 'Jane Traveller',
    email: 'jane@example.com',
    phone: '+27 00 000 0000',
    destination: 'Botswana',
    travelDates: 'September 2026',
    adults: 2,
    children: 0,
    budget: '$10k+',
    tripType: 'Honeymoon',
    accommodationStyle: 'Luxury tented camps',
    experiences: ['Walking safari', 'Mokoro'],
    sourceUrl: 'https://thebaobabcollective.co.uk/contact',
    message:
      "We're dreaming of a 10-day Botswana safari for our honeymoon. Could you put together some ideas?",
  },
} satisfies TemplateEntry

export default Email

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px 28px', maxWidth: '600px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'normal' as const,
  color: '#1a1a1a',
  margin: '0 0 12px',
  letterSpacing: '0.5px',
}
const lead = { fontSize: '14px', color: '#55575d', margin: '0 0 24px' }
const card = {
  backgroundColor: '#faf7f2',
  border: '1px solid #ece4d7',
  padding: '18px 20px',
  borderRadius: '6px',
}
const rowStyle = {
  fontSize: '14px',
  color: '#2a2a2a',
  margin: '0 0 6px',
  lineHeight: '1.5',
}
const labelStyle = {
  fontSize: '12px',
  color: '#8a6a3b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  fontWeight: 'bold' as const,
}
const messageStyle = {
  fontSize: '14px',
  color: '#2a2a2a',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  margin: '8px 0 0',
}
const hr = { borderColor: '#ece4d7', margin: '24px 0' }
const link = { color: '#8a6a3b', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#55575d', margin: '0' }
