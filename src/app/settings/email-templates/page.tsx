"use client";

import Link from "next/link";
import { defaultTemplates } from "@/types/email-templates";

export default function EmailTemplates() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Email Templates</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(defaultTemplates).map((template) => (
            <Link
              key={template.id}
              href={`/settings/email-templates/${template.type}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {template.title}
              </h3>
              <p className="text-sm text-gray-500">
                Click to edit template
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}