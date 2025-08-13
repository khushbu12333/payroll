"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { Mail, Edit, Eye, Plus, Trash2, Settings, Paperclip, X, Upload, FileText, FileSpreadsheet, File, RefreshCw } from 'lucide-react';
import SettingsLayout from '@/components/SettingsLayout';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { employeeAPI } from '@/lib/api';

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface Template {
  id: string;
  title: string;
  subject: string;
  category: string;
}

interface TemplateDict {
  [key: string]: Template;
}

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string; // For URL/link attachments
  file?: File; // For file uploads
  isLink: boolean; // To distinguish between file upload and URL
}

interface Employee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  // Add other employee properties as needed
}

const defaultTemplates: TemplateDict = {
  payslip: {
    id: 'payslip',
    title: 'Monthly Payslip',
    subject: 'Your Payslip for [Month] [Year]',
    category: 'Payroll Notifications'
  },
  'off-cycle-payslip': {
    id: 'off-cycle-payslip',
    title: 'Off-Cycle Payslip',
    subject: 'Off-Cycle Payment - [Employee Name]',
    category: 'Payroll Notifications'
  },
  'full-final-settlement': {
    id: 'full-final-settlement',
    title: 'Full & Final Settlement',
    subject: 'Final Settlement Details - [Employee Name]',
    category: 'Employee Lifecycle'
  },
  'warning-letter': {
    id: 'warning-letter',
    title: 'Warning Letter',
    subject: 'Official Warning - [Employee Name]',
    category: 'Employee Lifecycle'
  },
  'appointment-letter': {
    id: 'appointment-letter',
    title: 'Appointment Letter',
    subject: 'Your Appointment at [Company Name]',
    category: 'Employee Lifecycle'
  },
  'offer-letter': {
    id: 'offer-letter',
    title: 'Offer Letter',
    subject: 'Job Offer from [Company Name]',
    category: 'Employee Lifecycle'
  },
  'terminate-letter': {
    id: 'terminate-letter',
    title: 'Termination Letter',
    subject: 'Employment Termination - [Employee Name]',
    category: 'Employee Lifecycle'
  },
  'experience-letter': {
    id: 'experience-letter',
    title: 'Experience Letter',
    subject: 'Experience Certificate - [Employee Name]',
    category: 'Employee Lifecycle'
  },
  'resignation-acceptance': {
    id: 'resignation-acceptance',
    title: 'Resignation Acceptance Letter',
    subject: 'Acceptance of Your Resignation',
    category: 'Employee Lifecycle'
  }
};

const templateCategories = [
  {
    title: 'Payroll Notifications',
    description: 'Email templates for payslip and salary related communications',
    templates: ['payslip', 'off-cycle-payslip'],
    icon: '💰'
  },
  {
    title: 'Employee Lifecycle',
    description: 'Templates for employee onboarding, exit, and settlements',
    templates: [
      'full-final-settlement',
      'warning-letter',
      'appointment-letter',
      'offer-letter',
      'terminate-letter',
      'experience-letter',
      'resignation-acceptance'
    ],
    icon: '📋'
  }
];

// Supported file types
const SUPPORTED_FILE_TYPES = {
  // Documents
  'application/pdf': { icon: FileText, color: 'text-red-600', name: 'PDF' },
  'application/msword': { icon: FileText, color: 'text-blue-600', name: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-600', name: 'DOCX' },
  
  // Spreadsheets
  'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-600', name: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-600', name: 'XLSX' },
  'text/csv': { icon: FileSpreadsheet, color: 'text-green-600', name: 'CSV' },
  
  // Images
  'image/jpeg': { icon: File, color: 'text-purple-600', name: 'JPEG' },
  'image/jpg': { icon: File, color: 'text-purple-600', name: 'JPG' },
  'image/png': { icon: File, color: 'text-purple-600', name: 'PNG' },
  'image/gif': { icon: File, color: 'text-purple-600', name: 'GIF' },
  
  // Text files
  'text/plain': { icon: FileText, color: 'text-gray-600', name: 'TXT' },
  
  // Default
  'default': { icon: File, color: 'text-gray-600', name: 'FILE' }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 5;

// Default sender email
const DEFAULT_SENDER_EMAIL = "officeexellar@gmail.com";

export default function EmailTemplatesUI() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<TemplateDict>(defaultTemplates);
  const [categories, setCategories] = useState(templateCategories);
  
  // Employee data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  
  // Universal email send modal states
  const [showEmailSendModal, setShowEmailSendModal] = useState(false);
  const [currentEmailTemplate, setCurrentEmailTemplate] = useState<Template | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [emailBody, setEmailBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [senderEmail, setSenderEmail] = useState(DEFAULT_SENDER_EMAIL);
  const [sending, setSending] = useState(false);

  // Attachment states
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);

  const initialFormState = { id: '', title: '', subject: '', category: '' };
  const [formState, setFormState] = useState<Omit<Template, 'id'> & { id?: string }>({ title: '', subject: '', category: '' });

  // Hoisted function to avoid TDZ when called from useEffect
  async function fetchEmployees() {
    try {
      setLoadingEmployees(true);
      setEmployeeError(null);
      
      // Use the central API client which targets Django backend
      const apiEmployees = await employeeAPI.getAll();
      const transformedEmployees: Employee[] = apiEmployees.map((emp: any) => transformEmployee(emp));

      setEmployees(transformedEmployees);
      
      // Set the first employee as default selected if available
      if (transformedEmployees.length > 0) {
        setSelectedEmployee(transformedEmployees[0]);
      }

      console.log(`Successfully loaded ${transformedEmployees.length} employees`);
      
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employees';
      setEmployeeError(errorMessage);
      
      // Fallback to sample data for development/testing
      console.log('Using fallback employee data');
      const fallbackEmployees: Employee[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@company.com",
          employee_id: "EMP001"
        },
        {
          id: "2", 
          name: "Jane Smith",
          email: "jane.smith@company.com",
          employee_id: "EMP002"
        },
        {
          id: "3",
          name: "Mike Johnson", 
          email: "mike.johnson@company.com",
          employee_id: "EMP003"
        }
      ];
      setEmployees(fallbackEmployees);
      setSelectedEmployee(fallbackEmployees[0]);
    } finally {
      setLoadingEmployees(false);
    }
  }

  // Fetch employees data on component mount
  useEffect(() => {
    setHasMounted(true);
    fetchEmployees();
  }, []);

  if (!hasMounted) {
    return null;
  }

  // Helper function to transform employee data from different formats
  function transformEmployee(emp: any): Employee {
    const id = emp.id?.toString() || emp.pk?.toString() || emp.employee_id?.toString();
    const name = emp.name || emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.username || 'Unknown Employee';
    const email = emp.email || emp.email_address || emp.work_email || 'no-email@company.com';
    const employee_id = emp.employee_id || emp.emp_id || emp.staff_id || emp.id?.toString() || 'N/A';
    return { id, name, email, employee_id };
  }

  // Helper function to get CSRF token
  const getCsrfToken = (): string => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  const handleRefreshEmployees = () => {
    fetchEmployees();
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (templateId: string) => {
    const templateToEdit = templates[templateId];
    if (templateToEdit) {
      setEditingTemplate(templateToEdit);
      setFormState(templateToEdit);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const templateToDelete = templates[templateId];
      if (!templateToDelete) return;

      const newTemplates = { ...templates };
      delete newTemplates[templateId];
      setTemplates(newTemplates);

      const updatedCategories = categories.map(cat => {
        if (cat.title === templateToDelete.category) {
          return {
            ...cat,
            templates: cat.templates.filter(id => id !== templateId)
          };
        }
        return cat;
      });
      setCategories(updatedCategories);
    }
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templates[templateId]);
  };

  const closePreview = () => setPreviewTemplate(null);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formState.title || !formState.subject || !formState.category) {
      alert('Please fill all fields.');
      return;
    }

    if (editingTemplate) {
      // Editing existing template
      const updatedTemplate = { ...editingTemplate, ...formState };
      setTemplates({ ...templates, [editingTemplate.id]: updatedTemplate });
    } else {
      // Creating new template
      const newId = formState.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newTemplate: Template = { ...formState, id: newId };

      setTemplates({ ...templates, [newId]: newTemplate });

      const categoryExists = categories.some(c => c.title === newTemplate.category);
      if (categoryExists) {
        setCategories(categories.map(cat => 
          cat.title === newTemplate.category 
            ? { ...cat, templates: [...cat.templates, newId] }
            : cat
        ));
      }
    }
    handleCloseModal();
  };

  // Universal email send handler
  const handleEmailSend = (templateId: string) => {
    const template = templates[templateId];
    if (template) {
      setCurrentEmailTemplate(template);
      setSelectedEmployee(employees.length > 0 ? employees[0] : null);
      setEmailSubject(template.subject);
      setEmailBody(getDefaultEmailBody(template));
      setSenderEmail(DEFAULT_SENDER_EMAIL); // Set default sender email
      setAttachments([]); // Reset attachments
      setShowEmailSendModal(true);
    }
  };

  // Generate default email body based on template type
  const getDefaultEmailBody = (template: Template): string => {
    const defaultBodies: { [key: string]: string } = {
      'payslip': `<p>Dear [Employee Name],</p>
        <p>Please find attached your payslip for the month of [Month] [Year].</p>
        <p>If you have any questions regarding your payslip, please feel free to contact the HR department.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'off-cycle-payslip': `<p>Dear [Employee Name],</p>
        <p>Please find attached your off-cycle payment details.</p>
        <p>This payment has been processed as per the approved request.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'full-final-settlement': `<p>Dear [Employee Name],</p>
        <p>Please find attached your Full & Final Settlement details.</p>
        <p>This document contains all the settlement calculations and final amounts due.</p>
        <p>Thank you for your service with our organization.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'warning-letter': `<p>Dear [Employee Name],</p>
        <p>Please find attached an official warning letter regarding your recent conduct/performance.</p>
        <p>We expect immediate improvement and adherence to company policies.</p>
        <p>Please acknowledge receipt of this letter.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'appointment-letter': `<p>Dear [Employee Name],</p>
        <p>Congratulations! Please find attached your official appointment letter.</p>
        <p>We look forward to welcoming you to our team.</p>
        <p>Please review the terms and conditions and sign the acceptance copy.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'offer-letter': `<p>Dear [Employee Name],</p>
        <p>We are pleased to extend this job offer to you. Please find attached the detailed offer letter.</p>
        <p>We believe your skills and experience will be valuable additions to our team.</p>
        <p>Please review and respond by the specified deadline.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'terminate-letter': `<p>Dear [Employee Name],</p>
        <p>Please find attached your employment termination letter.</p>
        <p>This letter outlines the terms and conditions of your employment termination.</p>
        <p>Please ensure all company property is returned as mentioned in the letter.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'experience-letter': `<p>Dear [Employee Name],</p>
        <p>Please find attached your experience certificate as requested.</p>
        <p>This letter confirms your employment tenure and role with our organization.</p>
        <p>We wish you all the best for your future endeavors.</p>
        <p>Best regards,<br/>HR Team</p>`,
      
      'resignation-acceptance': `<p>Dear [Employee Name],</p>
        <p>Please find attached the acceptance letter for your resignation.</p>
        <p>This letter confirms the acceptance of your resignation and outlines the next steps.</p>
        <p>We appreciate your contributions to the organization.</p>
        <p>Best regards,<br/>HR Team</p>`
    };

    return defaultBodies[template.id] || `<p>Dear [Employee Name],</p>
      <p>Please find attached the ${template.title} document.</p>
      <p>Best regards,<br/>HR Team</p>`;
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const emp = employees.find(emp => emp.id === e.target.value);
    if (emp) setSelectedEmployee(emp);
  };

  // Attachment handling functions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      alert(`Maximum ${MAX_ATTACHMENTS} attachments allowed.`);
      return;
    }

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const newAttachment: AttachmentFile = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        isLink: false
      };

      setAttachments(prev => [...prev, newAttachment]);
    }
    
    setUploading(false);
    // Clear the input
    e.target.value = '';
  };

  const handleAddLink = () => {
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (!attachmentUrl.trim()) {
      alert('Please enter a valid URL.');
      return;
    }

    if (!urlPattern.test(attachmentUrl)) {
      alert('Please enter a valid URL (e.g., https://example.com/file.pdf).');
      return;
    }

    if (attachments.length >= MAX_ATTACHMENTS) {
      alert(`Maximum ${MAX_ATTACHMENTS} attachments allowed.`);
      return;
    }

    const fileName = attachmentName.trim() || extractFileNameFromUrl(attachmentUrl);
    const fileType = getFileTypeFromUrl(attachmentUrl);

    const newAttachment: AttachmentFile = {
      id: Date.now().toString(),
      name: fileName,
      size: 0, // Unknown size for URLs
      type: fileType,
      url: attachmentUrl,
      isLink: true
    };

    setAttachments(prev => [...prev, newAttachment]);
    setAttachmentUrl("");
    setAttachmentName("");
    setShowAttachmentModal(false);
  };

  const extractFileNameFromUrl = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const fileName = pathname.split('/').pop() || 'Link';
      return fileName.includes('.') ? fileName : `${fileName}.link`;
    } catch {
      return 'Attachment Link';
    }
  };

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return typeMap[extension || ''] || 'application/octet-stream';
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES] || SUPPORTED_FILE_TYPES['default'];
    const Icon = typeInfo.icon;
    return <Icon className={`w-4 h-4 ${typeInfo.color}`} />;
  };

  const getFileTypeName = (fileType: string): string => {
    const typeInfo = SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES] || SUPPORTED_FILE_TYPES['default'];
    return typeInfo.name;
  };

  // Notification helper functions
  const showNotification = (message: string, type: 'success' | 'error') => {
    const notificationDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' 
      ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
      : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>';
    
    notificationDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notificationDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          ${icon}
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notificationDiv);
    setTimeout(() => {
      if (document.body.contains(notificationDiv)) {
        document.body.removeChild(notificationDiv);
      }
    }, 5000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderEmail || !emailSubject || !emailBody || !selectedEmployee) {
      alert('Please fill in all required fields.');
      return;
    }

    setSending(true);
    
    try {
      // Prepare attachments data
      const attachmentsData = await Promise.all(attachments.map(async (attachment) => {
        if (attachment.isLink) {
          return {
            type: 'link',
            name: attachment.name,
            url: attachment.url,
            fileType: attachment.type
          };
        } else if (attachment.file) {
          // Convert file to base64 for upload
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(attachment.file!);
          });
          
          return {
            type: 'file',
            name: attachment.name,
            data: base64,
            fileType: attachment.type,
            size: attachment.size
          };
        }
        return null;
      }));

      // Replace placeholders in email content
      let processedSubject = emailSubject;
      let processedBody = emailBody;
      
      if (selectedEmployee) {
        processedSubject = processedSubject.replace(/\[Employee Name\]/g, selectedEmployee.name);
        processedBody = processedBody.replace(/\[Employee Name\]/g, selectedEmployee.name);
      }

      // Add current date placeholders
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear().toString();
      
      processedSubject = processedSubject.replace(/\[Month\]/g, currentMonth);
      processedSubject = processedSubject.replace(/\[Year\]/g, currentYear);
      processedBody = processedBody.replace(/\[Month\]/g, currentMonth);
      processedBody = processedBody.replace(/\[Year\]/g, currentYear);

      // Use the single Next.js email API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
          from: senderEmail,
          to: selectedEmployee.email,
          subject: processedSubject,
          body: processedBody,
          template: currentEmailTemplate?.id,
          employeeName: selectedEmployee.name,
          employeeId: selectedEmployee.employee_id,
          attachments: attachmentsData.filter(Boolean)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Email sending failed');
      }

      setSending(false);
      setShowEmailSendModal(false);
      setAttachments([]); // Clear attachments
      
      showNotification(
        `${currentEmailTemplate?.title} sent successfully to ${selectedEmployee.name}!`, 
        'success'
      );
    } catch (error) {
      setSending(false);
      console.error('Email sending error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email. Please check your configuration.';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <SettingsLayout title="Email Templates" description="Customize email templates for various notifications and communications">
    <div className="min-h-screen bg-gradient-to-br from-yellow-25 via-yellow-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-xl shadow-lg">
                <Mail className="w-6 h-6 text-yellow-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-black">
                  Email Templates
                </h1>
                <p className="text-black">Customize email templates for various notifications and communications</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {loadingEmployees ? 'Loading employees...' : `${employees.length} employees loaded`}
                  </span>
                  {employeeError && (
                    <span className="text-sm text-red-600">
                      (Using fallback data)
                    </span>
                  )}
                  <span className="text-sm text-blue-600">
                    • Sender: {DEFAULT_SENDER_EMAIL}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshEmployees}
                disabled={loadingEmployees}
                className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingEmployees ? 'animate-spin' : ''}`} />
                Refresh Employees
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800 font-medium rounded-xl hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* API Status Banner */}
        {employeeError && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  API Connection Issue
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Unable to connect to employee API endpoints. Using sample data for testing.</p>
                  <p className="mt-1">
                    <strong>Error:</strong> {employeeError}
                  </p>
                  <p className="mt-1">
                    <strong>Suggested fixes:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ensure your Django server is running</li>
                    <li>Check if the employee API endpoint exists (try: /api/employees/, /employees/api/list/)</li>
                    <li>Verify CORS settings in Django</li>
                    <li>Check Django URL patterns for employee endpoints</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-medium">Total Employees</p>
                <div className="mt-1">
                  {loadingEmployees ? (
                    <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" aria-label="Loading employees"></div>
                  ) : (
                    <p className={`text-3xl font-bold text-black ${employeeError ? 'text-amber-600' : 'text-green-600'}`}>
                      {employees.length}
                    </p>
                  )}
                </div>
                {employeeError && (
                  <p className="text-xs text-amber-600 mt-1">Sample data</p>
                )}
              </div>
              <div className="p-3 bg-green-100/50 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-medium">Active Templates</p>
                <p className="text-3xl font-bold text-black mt-1">{Object.keys(templates).length}</p>
              </div>
              <div className="p-3 bg-blue-100/50 rounded-xl backdrop-blur-sm">
                <Mail className="w-8 h-8 text-blue-700" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-medium">Sender Email</p>
                <p className="text-sm font-bold text-black mt-1 break-all">{DEFAULT_SENDER_EMAIL}</p>
              </div>
              <div className="p-3 bg-purple-100/50 rounded-xl backdrop-blur-sm">
                <Settings className="w-8 h-8 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-25 to-yellow-50 px-6 py-4 border-b border-yellow-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-black">Email Templates</h3>
              <div className="flex items-center space-x-3">
                <button className="text-gray-500 hover:text-gray-700">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-yellow-100">
              <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Template Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-yellow-100">
                {categories.map((cat) =>
                  cat.templates
                    .filter((templateType) => templates[templateType])
                    .map((templateType) => {
                      const template = templates[templateType];
                      return (
                        <tr key={template.id} className="hover:bg-yellow-25 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-2xl mr-3">📧</div>
                              <div>
                                <div className="text-sm font-semibold text-black">{template.title}</div>
                                <div className="text-xs text-black">ID: {template.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-black">
                              {cat.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-black max-w-xs truncate">{template.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                                onClick={() => handleOpenEditModal(template.id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                onClick={() => handleEmailSend(template.id)}
                                disabled={employees.length === 0}
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Email
                              </button>
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                onClick={() => handleDelete(template.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Email Template</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-bold text-black">Title: </span>
                <span className="text-black">{previewTemplate.title}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold text-black">Subject: </span>
                <span className="text-black">{previewTemplate.subject}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold text-black">Category: </span>
                <span className="text-black">{previewTemplate.category}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold text-black">ID: </span>
                <span className="text-black">{previewTemplate.id}</span>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-black">{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-black mb-1">Template Name</label>
                  <input
                    type="text"
                    id="title"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-black mb-1">Category</label>
                  <select
                    id="category"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.title} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-black mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Email Send Modal */}
      {showEmailSendModal && currentEmailTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/30 to-black/60 backdrop-blur-xl">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 border border-yellow-200 flex flex-col max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black flex items-center gap-2">
                <Mail className="w-6 h-6" /> 
                Send {currentEmailTemplate.title}
              </h3>
              <button
                onClick={() => setShowEmailSendModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="space-y-6">
              {/* Employee Loading/Error State */}
              {loadingEmployees ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-800">Loading employees...</span>
                  </div>
                </div>
              ) : employeeError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-amber-800">Using sample employee data (API connection failed)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshEmployees}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : employees.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-yellow-800">No employees found. Please add employees first or check your employee API endpoint.</span>
                  </div>
                </div>
              ) : null}

              {/* Sender Email - Pre-filled and read-only */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">From (Sender Email) *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-gray-100 focus:outline-none"
                  value={senderEmail}
                  readOnly
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default sender email configured for your organization
                </div>
              </div>

              {/* Employee Selection */}
              {employees.length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Select Employee *</label>
                    <select
                      className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      value={selectedEmployee?.id || ''}
                      onChange={handleEmployeeChange}
                    >
                      <option value="" disabled>Select an employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employee_id}) - {emp.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employee Details */}
                  {selectedEmployee && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Employee ID</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-gray-100"
                          value={selectedEmployee.employee_id}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">Recipient Email</label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-gray-100"
                          value={selectedEmployee.email}
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email Subject *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  required
                />
              </div>

              {/* Attachments Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Attachments ({attachments.length}/{MAX_ATTACHMENTS})
                </label>
                
                {/* Attachment Controls */}
                <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-25">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {/* File Upload Button */}
                    <label className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif"
                        disabled={attachments.length >= MAX_ATTACHMENTS}
                      />
                    </label>
                    
                    {/* Add Link Button */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      disabled={attachments.length >= MAX_ATTACHMENTS}
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Add Link
                    </button>
                  </div>

                  {/* Supported Formats Info */}
                  <div className="text-xs text-gray-600 mb-3">
                    Supported: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF (Max 10MB per file)
                  </div>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-black">Attached Files:</h4>
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(attachment.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-black truncate">
                                  {attachment.name}
                                </span>
                                {attachment.isLink && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Link
                                  </span>
                                )}
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {getFileTypeName(attachment.type)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {attachment.isLink ? (
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                    {attachment.url}
                                  </a>
                                ) : (
                                  formatFileSize(attachment.size)
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploading && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading files...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email Body *</label>
                <div className="border border-yellow-300 rounded-lg">
                  <SunEditor
                    setContents={emailBody}
                    onChange={setEmailBody}
                    setOptions={{
                      height: "200px",
                      buttonList: [
                        ['undo', 'redo'],
                        ['bold', 'underline', 'italic'],
                        ['fontColor', 'hiliteColor'],
                        ['align', 'list'],
                        ['table', 'link'],
                        ['showBlocks', 'codeView']
                      ],
                      placeholder: "Enter your email content here..."
                    }}
                  />
                </div>
              </div>

              {/* Template Info Card */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-black mb-2">📋 Template Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-black">Template:</span>
                    <span className="ml-2 text-gray-700">{currentEmailTemplate.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Category:</span>
                    <span className="ml-2 text-gray-700">{currentEmailTemplate.category}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  💡 Tip: You can use placeholders like [Employee Name], [Month], [Year], [Company Name] in your content.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEmailSendModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={sending || !senderEmail || !emailSubject || !emailBody || !selectedEmployee}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send {currentEmailTemplate.title}
                      {attachments.length > 0 && (
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          +{attachments.length} files
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-black">Add Link Attachment</h3>
              <button 
                onClick={() => setShowAttachmentModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">File URL *</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Supported: Google Drive, Dropbox, OneDrive, direct file links
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Display Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Custom file name (optional)"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
              <button 
                type="button" 
                onClick={() => setShowAttachmentModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleAddLink}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                disabled={!attachmentUrl.trim()}
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </SettingsLayout>
  );
}