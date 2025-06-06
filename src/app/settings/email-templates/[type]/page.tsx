"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import { defaultTemplates } from '@/types/email-templates';
import { notFound } from 'next/navigation';

interface Attachment {
  file: string | Blob;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface EmailTemplateForm {
  from: string;
  to: string;  // Add this field
  subject: string;
  body: string;
  attachments: Attachment[];
}

interface Props {
  params: {
    type: string;
  }
}

export default function EditEmailTemplate({ params }: Props) {
  const template = defaultTemplates[params.type as keyof typeof defaultTemplates];
  
  if (!template) {
    notFound();
  }

  const router = useRouter();
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateForm>({
    from: '',
    to: '',
    subject: template.subject,
    body: template.body,
    attachments: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Add email validation
  const [emailError, setEmailError] = useState({
    from: "",
    to: ""
  });

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Update validation handler
  const handleEmailChange = (field: 'from' | 'to', value: string) => {
    setEmailTemplate({ ...emailTemplate, [field]: value });
    if (!value) {
      setEmailError({ ...emailError, [field]: "Email is required" });
    } else if (!validateEmail(value)) {
      setEmailError({ ...emailError, [field]: "Please enter a valid email address" });
    } else {
      setEmailError({ ...emailError, [field]: "" });
    }
  };

  const handleFormatClick = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
    editor?.focus();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Create a new FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment: Attachment = {
            file: file, // Add the file property
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file)
          };
          setAttachments(prev => [...prev, attachment]);
          // Update template attachments as well
          setEmailTemplate(prev => ({
            ...prev,
            attachments: [...prev.attachments, attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Add this function to handle attachment removal
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setEmailTemplate(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSendEmail = async () => {
    try {
      toast.loading('Sending email...', { id: 'sendEmail' });
      
      const formData = new FormData();
      formData.append('from', emailTemplate.from);
      formData.append('to', emailTemplate.to);
      formData.append('subject', emailTemplate.subject);
      formData.append('body', emailTemplate.body);

      // Add attachments
      attachments.forEach((attachment, index) => {
        formData.append(`attachment${index}`, attachment.file);
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email sent successfully!', { id: 'sendEmail' });
        router.push("/settings/email-templates");
      } else {
        toast.error(data.error || 'Failed to send email', { id: 'sendEmail' });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email', { id: 'sendEmail' });
    }
  };

  // Add a preview toggle
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
          <Link
            href="/settings/email-templates"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Back to Templates
          </Link>
        </div>
        
        {/* Form */}
        <div className="max-w-3xl space-y-8">
          {/* From field */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-black mb-2">From</label>
            <input
              type="email"
              value={emailTemplate.from}
              onChange={(e) => handleEmailChange('from', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter sender email address"
            />
            {emailError.from && <p className="mt-1 text-sm text-red-600">{emailError.from}</p>}
          </div>

          {/* To field */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-black mb-2">To</label>
            <input
              type="email"
              value={emailTemplate.to}
              onChange={(e) => handleEmailChange('to', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter recipient email address"
            />
            {emailError.to && <p className="mt-1 text-sm text-red-600">{emailError.to}</p>}
          </div>

          {/* Subject field */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-black mb-2">Subject</label>
            <input
              type="text"
              value={emailTemplate.subject}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Enter email subject"
            />
          </div>

          {/* Email body with rich text editor */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-black">Email Body</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>

            {/* Rich Text Editor Toolbar */}
            <div className="border border-gray-200 rounded-t-md p-2 bg-gray-50 flex flex-wrap items-center gap-2">
              {/* Text Style Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFormatClick('bold')}
                  className="p-2 hover:bg-gray-200 rounded text-black"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => handleFormatClick('italic')}
                  className="p-2 hover:bg-gray-200 rounded text-black"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => handleFormatClick('underline')}
                  className="p-2 hover:bg-gray-200 rounded text-black"
                  title="Underline"
                >
                  <u>U</u>
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Alignment Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFormatClick('justifyLeft')}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Left"
                >
                  ⇤
                </button>
                <button
                  onClick={() => handleFormatClick('justifyCenter')}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Center"
                >
                  ⇔
                </button>
                <button
                  onClick={() => handleFormatClick('justifyRight')}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Align Right"
                >
                  ⇥
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* File Attachment Button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-blue-600"
                  title="Attach File"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm">Attach Files</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="border-x border-b border-gray-200 rounded-b-md">
              {showPreview ? (
                <div
                  dangerouslySetInnerHTML={{ __html: emailTemplate.body }}
                  className="w-full min-h-[400px] p-6 overflow-auto bg-gray-50"
                />
              ) : (
                <div
                  contentEditable
                  onInput={(e) => setEmailTemplate({ ...emailTemplate, body: e.currentTarget.innerHTML })}
                  className="w-full min-h-[400px] p-6 focus:outline-none text-black relative"
                >
                  {!emailTemplate.body && (
                    <span className="absolute top-6 left-6 text-gray-400 pointer-events-none">
                      Compose your email...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="text-sm font-medium text-black mb-2">Attachments ({attachments.length})</div>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-md border border-gray-200"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="ml-2 text-red-500 hover:text-red-600"
                        title="Remove attachment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSendEmail}
              disabled={!emailTemplate.from || !emailTemplate.to || !!emailError.from || !!emailError.to}
              className={`px-6 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium
                ${(!emailTemplate.from || !emailTemplate.to || emailError.from || emailError.to)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
            <Link
              href="/settings/email-templates"
              className="px-6 py-2.5 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}