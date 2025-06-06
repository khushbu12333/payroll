'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MdEdit, MdEmail, MdPhone, MdCalendarToday, MdBusiness, MdLocationOn, MdMoreVert } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import EditEmployeeForm from '@/components/EditEmployeeForm';

interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  workEmail: string;
  dateOfJoining: string;
  mobileNumber: string;
  isDirector: boolean;
  gender: string;
  workLocation: string;
  designation: string;
  department: string;
  annualCTC: number;
  basicPercent: number;
  hraPercent: number;
  conveyanceAmount: number;
  mealAllowance: number;
  medicalAllowance: number;
  personalPay: number;
  professionTax: number;
  advances: number;
  dob: string;
  address: string;
  paymentMethod: string;
  enablePortalAccess: boolean;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'salary', label: 'Salary Details' },
  { id: 'payslips', label: 'Payslips & Forms' },
];

const SalaryDetailsContent = ({ employeeData, onEdit }: { employeeData: EmployeeData; onEdit: () => void }) => {
  const monthlyCtc = Math.round(employeeData.annualCTC / 12);
  const basicMonthly = Math.round((monthlyCtc * employeeData.basicPercent) / 100);
  const hraMonthly = Math.round((basicMonthly * employeeData.hraPercent) / 100);
  const conveyanceMonthly = employeeData.conveyanceAmount;
  const mealAllowanceMonthly = employeeData.mealAllowance;
  const medicalAllowanceMonthly = employeeData.medicalAllowance;
  const personalPayMonthly = employeeData.personalPay;
  const totalEarnings = basicMonthly + hraMonthly + conveyanceMonthly + mealAllowanceMonthly + medicalAllowanceMonthly + personalPayMonthly;
  const totalDeductions = employeeData.professionTax + employeeData.advances;
  const netPayable = totalEarnings - totalDeductions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
            Salary Details
            <button onClick={onEdit} className="ml-2 text-gray-400 hover:text-gray-600">
              <MdEdit className="w-5 h-5" />
            </button>
          </h2>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MdMoreVert className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-sm text-gray-600">ANNUAL CTC</div>
          <div className="text-xl font-semibold text-black">₹{employeeData.annualCTC.toLocaleString('en-IN')} per year</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">MONTHLY CTC</div>
          <div className="text-xl font-semibold text-black">₹{monthlyCtc.toLocaleString('en-IN')} per month</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-3 gap-4 p-4 border-b">
          <div className="text-sm font-medium text-black">SALARY COMPONENTS</div>
          <div className="text-sm font-medium text-black">MONTHLY AMOUNT</div>
          <div className="text-sm font-medium text-black">ANNUAL AMOUNT</div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div className="text-sm font-medium text-black mb-4">Earnings</div>
            
            {/* Basic */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div>
                <div className="text-sm text-black">Basic</div>
                <div className="text-xs text-gray-500">({employeeData.basicPercent}% of Annual CTC)</div>
              </div>
              <div className="text-sm text-black">₹ {basicMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(basicMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* HRA */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div>
                <div className="text-sm text-black">House Rent Allowance</div>
                <div className="text-xs text-gray-500">({employeeData.hraPercent}% of Basic Amount)</div>
              </div>
              <div className="text-sm text-black">₹ {hraMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(hraMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Conveyance */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Conveyance Allowance</div>
              <div className="text-sm text-black">₹ {conveyanceMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(conveyanceMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Meal Allowance */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Meal Allowance</div>
              <div className="text-sm text-black">₹ {mealAllowanceMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(mealAllowanceMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Medical Allowance */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Medical Allowance</div>
              <div className="text-sm text-black">₹ {medicalAllowanceMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(medicalAllowanceMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Personal Pay */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Personal Pay</div>
              <div className="text-sm text-black">₹ {personalPayMonthly.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(personalPayMonthly * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Total Earnings */}
            <div className="grid grid-cols-3 gap-4 py-2 mt-4 bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-black">Total Earnings</div>
              <div className="text-sm font-medium text-black">₹ {totalEarnings.toLocaleString('en-IN')}</div>
              <div className="text-sm font-medium text-black">₹ {(totalEarnings * 12).toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Deductions Section */}
          <div>
            <div className="text-sm font-medium text-black mb-4">Deductions</div>

            {/* Professional Tax */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Professional Tax</div>
              <div className="text-sm text-black">₹ {employeeData.professionTax.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(employeeData.professionTax * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Advances */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-sm text-black">Advances</div>
              <div className="text-sm text-black">₹ {employeeData.advances.toLocaleString('en-IN')}</div>
              <div className="text-sm text-black">₹ {(employeeData.advances * 12).toLocaleString('en-IN')}</div>
            </div>

            {/* Total Deductions */}
            <div className="grid grid-cols-3 gap-4 py-2 mt-4 bg-red-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-black">Total Deductions</div>
              <div className="text-sm font-medium text-black">₹ {totalDeductions.toLocaleString('en-IN')}</div>
              <div className="text-sm font-medium text-black">₹ {(totalDeductions * 12).toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Net Payable */}
          <div className="grid grid-cols-3 gap-4 py-2 bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-black">Net Payable</div>
            <div className="text-sm font-medium text-black">₹ {netPayable.toLocaleString('en-IN')}</div>
            <div className="text-sm font-medium text-black">₹ {(netPayable * 12).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EmployeeDetailsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get employee data from localStorage
    const storedData = localStorage.getItem('currentEmployee');
    if (storedData) {
      setEmployeeData(JSON.parse(storedData));
    } else {
      // If no data, redirect back to add employee page
      router.push('/employee/add');
    }
  }, []);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleSave = (updatedData: EmployeeData) => {
    setEmployeeData(updatedData);
    localStorage.setItem('currentEmployee', JSON.stringify(updatedData));
    setShowEditForm(false);
  };

  if (!employeeData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="relative">
                  <div className="absolute top-0 left-0 bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                    {employeeData.enablePortalAccess ? 'PORTAL ENABLED' : 'PORTAL DISABLED'}
                  </div>
                  <button 
                    onClick={handleEdit}
                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
                  >
                    <MdEdit className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="text-xs text-gray-500 mb-1">
                    {employeeData.isDirector ? 'DIRECTOR LEVEL' : 'EMPLOYEE'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {employeeData.firstName} {employeeData.lastName} ({employeeData.employeeId})
                  </h2>
                  <div className="text-gray-500">{employeeData.department}</div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">BASIC INFORMATION</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <MdEmail className="w-5 h-5 mr-3" />
                      <span>{employeeData.workEmail}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdPhone className="w-5 h-5 mr-3" />
                      <span>{employeeData.mobileNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdBusiness className="w-5 h-5 mr-3" />
                      <span>{employeeData.gender}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdCalendarToday className="w-5 h-5 mr-3" />
                      <span>{employeeData.dateOfJoining} (Date of Joining)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdBusiness className="w-5 h-5 mr-3" />
                      <span>{employeeData.designation}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdLocationOn className="w-5 h-5 mr-3" />
                      <span>{employeeData.workLocation}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Portal Access</span>
                      <div className="flex items-center">
                        <span className="text-gray-700">Disabled</span>
                        <button className="ml-2 text-blue-600 hover:text-blue-700">(Enable)</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <button 
                        onClick={handleEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Date of Birth</div>
                        <div className="text-gray-900">{employeeData.dob || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Father's Name</div>
                        <div className="text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">PAN</div>
                        <div className="text-gray-900">-</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Personal Email Address</div>
                        <div className="text-gray-900">{employeeData.workEmail || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Residential Address</div>
                        <div className="text-gray-900">{employeeData.address || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                      <button 
                        onClick={handleEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Payment Mode</div>
                      <div className="text-gray-900">{employeeData.paymentMethod || 'Cash'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'salary' ? (
            <SalaryDetailsContent employeeData={employeeData} onEdit={handleEdit} />
          ) : null}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <EditEmployeeForm
          employeeData={employeeData}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </>
  );
} 