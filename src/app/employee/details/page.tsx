'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { employeeAPI, type Employee } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  MdPerson, MdEmail, MdPhone, MdBusiness, MdCalendarToday, 
  MdAttachMoney, MdWork, MdBadge, MdArrowBack, MdLocationOn, 
  MdCheckCircle, MdContactMail 
} from 'react-icons/md';

// A styled component for each detail item
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => (
  <div className="flex items-center group transition-all duration-200 p-2 -mx-2 rounded-lg hover:bg-slate-100">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg mr-4 border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
      <span className="h-5 w-5 text-indigo-500 transition-colors">{icon}</span>
    </div>
    <div className="flex-grow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-800 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

const EmployeeDetailsPage = () => {
  const searchParams = useSearchParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const employeeId = searchParams.get('id');
    if (employeeId) {
      employeeAPI.getById(parseInt(employeeId, 10)).then((data: Employee) => {
        setEmployee(data);
        setIsLoading(false);
      }).catch((error: any) => {
        console.error("Failed to fetch employee details:", error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-4 text-slate-600">Loading Employee Details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
          <MdPerson size={60} className="text-slate-400 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Employee Not Found</h2>
          <p className="text-slate-500 mb-6">We couldn't find the employee you're looking for.</p>
          <Link href="/employee" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <MdArrowBack className="w-5 h-5 mr-2" />
            Back to Employee List
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-6">
            <Link href="/employee" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 group bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 hover:shadow-md">
              <MdArrowBack className="w-5 h-5 mr-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              Back to Employee List
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/50">
            {/* Header with banner */}
            <div className="relative">
              <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <div className="absolute top-20 left-0 right-0 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg"
                      src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=random&color=fff&size=128`}
                      alt={`${employee.first_name} ${employee.last_name}`}
                    />
                  </div>
                  <div className="mt-4 sm:mt-0 sm:pb-4 flex-grow text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-slate-800">{employee.first_name} {employee.last_name}</h1>
                    <p className="text-md text-slate-500">{employee.designation_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer for header */}
            <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
              {/* Info Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Employment Details Card */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><MdWork className="mr-3 text-indigo-500" /> Employment Details</h3>
                  <div className="space-y-2">
                    <DetailItem icon={<MdBadge />} label="Employee ID" value={employee.employee_id} />
                    <DetailItem icon={<MdBusiness />} label="Department" value={employee.department_name} />
                    <DetailItem icon={<MdLocationOn />} label="Work Location" value={employee.work_location_name} />
                  </div>
                </div>
                
                {/* Contact Details Card */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><MdContactMail className="mr-3 text-indigo-500" /> Contact Details</h3>
                  <div className="space-y-2">
                    <DetailItem icon={<MdEmail />} label="Work Email" value={employee.email} />
                    <DetailItem icon={<MdPhone />} label="Phone Number" value={employee.phone} />
                  </div>
                </div>

                {/* Timeline & Status Card */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><MdCalendarToday className="mr-3 text-indigo-500" /> Timeline & Status</h3>
                  <div className="space-y-2">
                    <DetailItem icon={<MdCalendarToday />} label="Date of Joining" value={new Date(employee.date_of_joining).toLocaleDateString()} />
                    <DetailItem icon={<MdCheckCircle />} label="Status" value={employee.status} />
                  </div>
                </div>

                {/* Compensation Card */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><MdAttachMoney className="mr-3 text-indigo-500" /> Compensation</h3>
                  <div className="space-y-2">
                    <DetailItem icon={<MdAttachMoney />} label="Basic Salary" value={employee.basic_salary} />
                    <DetailItem icon={<MdAttachMoney />} label="Annual CTC" value={employee.annual_ctc} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetailsPage; 