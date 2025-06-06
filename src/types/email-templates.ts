export type TemplateType = 
  | 'payslip'
  | 'payslip-portal-disabled'
  | 'off-cycle-payslip'
  | 'full-final-settlement';

export interface EmailTemplate {
  id: string;
  type: TemplateType;
  title: string;
  subject: string;
  body: string;
}

export const defaultTemplates: Record<TemplateType, EmailTemplate> = {
  'payslip': {
    id: 'payslip',
    type: 'payslip',
    title: 'Payslip Notification',
    subject: 'Your Monthly Payslip for [Month] [Year]',
    body: `Dear [Employee Name],

Your payslip for the month of [Month] [Year] is now available.

Best regards,
HR Team`
  },
  'payslip-portal-disabled': {
    id: 'payslip-portal-disabled',
    type: 'payslip-portal-disabled',
    title: 'Payslip Notification (For Portal Disabled Employees Only)',
    subject: 'Your Monthly Payslip for [Month] [Year]',
    body: `Dear [Employee Name],

Your payslip for the month of [Month] [Year] is attached to this email.

Best regards,
HR Team`
  },
  'off-cycle-payslip': {
    id: 'off-cycle-payslip',
    type: 'off-cycle-payslip',
    title: 'Off Cycle & One-Time Payrolls Payslip Notification',
    subject: 'Off Cycle Payslip Notification',
    body: `Dear [Employee Name],

Your off cycle payslip is now available.

Best regards,
HR Team`
  },
  'full-final-settlement': {
    id: 'full-final-settlement',
    type: 'full-final-settlement',
    title: 'Full & Final Settlement Payslip Notification',
    subject: 'Full and Final Settlement Details',
    body: `Dear [Employee Name],

Your full and final settlement details are now available.

Best regards,
HR Team`
  }
};