'use client';

import { useState, useEffect } from 'react';
import { MdKeyboardArrowDown, MdPayments, MdAccountBalance, MdPayment, MdMoney } from 'react-icons/md';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const inputStyles = {
  base: "block w-full px-4 py-2.5 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors",
  label: "block text-sm font-medium mb-1.5 text-gray-700",
  required: "text-red-500 ml-0.5",
  select: "block w-full px-4 py-2.5 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors appearance-none",
  selectWrapper: "relative",
  selectIcon: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5",
  checkbox: "h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-colors",
};

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
}

const SalaryDetailsStep = ({ setActiveStep, employeeData, updateEmployeeData }: { 
  setActiveStep: (step: number) => void;
  employeeData: EmployeeData;
  updateEmployeeData: (data: Partial<EmployeeData>) => void;
}) => {
  const [monthlyCTC, setMonthlyCTC] = useState<number>(Math.round(employeeData.annualCTC / 12));
  const [basicPercent, setBasicPercent] = useState<number>(employeeData.basicPercent);
  const [hraPercent, setHraPercent] = useState<number>(employeeData.hraPercent);
  const [conveyanceAmount, setConveyanceAmount] = useState<number>(employeeData.conveyanceAmount);
  const [mealAllowance, setMealAllowance] = useState<number>(employeeData.mealAllowance || 0);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(employeeData.medicalAllowance || 0);
  const [personalPay, setPersonalPay] = useState<number>(employeeData.personalPay || 0);
  const [professionTax, setProfessionTax] = useState<number>(employeeData.professionTax || 200);
  const [advances, setAdvances] = useState<number>(employeeData.advances || 0);

  // Calculated values
  const [basicMonthly, setBasicMonthly] = useState<number>(0);
  const [hraMonthly, setHraMonthly] = useState<number>(0);
  const [fixedAllowanceMonthly, setFixedAllowanceMonthly] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [totalDeductions, setTotalDeductions] = useState<number>(0);
  const [netPayable, setNetPayable] = useState<number>(0);

  // Calculate all values when dependencies change
  useEffect(() => {
    // Basic calculations
    const basicMonthlyValue = Math.round((monthlyCTC * basicPercent) / 100);
    setBasicMonthly(basicMonthlyValue);

    // HRA calculations
    const hraMonthlyValue = Math.round((basicMonthlyValue * hraPercent) / 100);
    setHraMonthly(hraMonthlyValue);

    // Calculate total earnings
    const totalEarningsValue = basicMonthlyValue + 
                             hraMonthlyValue + 
                             conveyanceAmount + 
                             mealAllowance + 
                             medicalAllowance + 
                             personalPay;
    setTotalEarnings(totalEarningsValue);

    // Calculate total deductions
    const totalDeductionsValue = professionTax + advances;
    setTotalDeductions(totalDeductionsValue);

    // Calculate net payable
    const netPayableValue = totalEarningsValue - totalDeductionsValue;
    setNetPayable(netPayableValue);

    // Fixed Allowance (remaining amount)
    const fixedAllowanceValue = monthlyCTC - (basicMonthlyValue + hraMonthlyValue + conveyanceAmount + mealAllowance + medicalAllowance + personalPay);
    setFixedAllowanceMonthly(fixedAllowanceValue);

    // Update parent component with annual values
    updateEmployeeData({
      annualCTC: monthlyCTC * 12,
      basicPercent,
      hraPercent,
      conveyanceAmount,
      mealAllowance,
      medicalAllowance,
      personalPay,
      professionTax,
      advances
    });
  }, [monthlyCTC, basicPercent, hraPercent, conveyanceAmount, mealAllowance, medicalAllowance, personalPay, professionTax, advances]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Monthly CTC */}
        <div className="flex items-center gap-4">
          <label className="min-w-[150px] text-sm font-medium text-gray-700">
            Monthly CTC<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">₹</span>
            <input
              type="number"
              className={inputStyles.base}
              value={monthlyCTC}
              onChange={(e) => setMonthlyCTC(Number(e.target.value))}
              placeholder="Enter monthly amount"
            />
            <span className="text-gray-600">per month</span>
          </div>
        </div>

        {/* Salary Components Table */}
        <div className="bg-white rounded-lg border">
          <div className="grid grid-cols-3 gap-4 p-4 border-b bg-gray-50">
            <div className="font-medium text-gray-700">SALARY COMPONENTS</div>
            <div className="font-medium text-gray-700">CALCULATION TYPE</div>
            <div className="font-medium text-gray-700">MONTHLY AMOUNT</div>
          </div>

          <div className="p-4 space-y-6">
            {/* Earnings Section */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Earnings</h3>
              
              {/* Basic */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Basic</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={basicPercent}
                    onChange={(e) => setBasicPercent(Number(e.target.value))}
                    placeholder="50.00"
                  />
                  <span className="text-gray-600">% of CTC</span>
                </div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={basicMonthly}
                    readOnly
                  />
                </div>
              </div>

              {/* House Rent Allowance */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">House Rent Allowance</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={hraPercent}
                    onChange={(e) => setHraPercent(Number(e.target.value))}
                    placeholder="50.00"
                  />
                  <span className="text-gray-600">% of Basic</span>
                </div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={hraMonthly}
                    readOnly
                  />
                </div>
              </div>

              {/* Conveyance Allowance */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Conveyance Allowance</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={conveyanceAmount}
                    onChange={(e) => setConveyanceAmount(Number(e.target.value))}
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Meal Allowance */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Meal Allowance</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={mealAllowance}
                    onChange={(e) => setMealAllowance(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Medical Allowance */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Medical Allowance</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={medicalAllowance}
                    onChange={(e) => setMedicalAllowance(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Personal Pay */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Personal Pay</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={personalPay}
                    onChange={(e) => setPersonalPay(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Fixed Allowance */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-gray-700">Fixed Allowance</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={fixedAllowanceMonthly}
                    readOnly
                  />
                </div>
              </div>

              {/* Total Earnings */}
              <div className="grid grid-cols-3 gap-4 mt-4 items-center bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-black">Total Earnings</div>
                <div></div>
                <div className="text-lg font-semibold text-black">₹ {totalEarnings}</div>
              </div>
            </div>

            {/* Deductions Section */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Deductions</h3>

              {/* Professional Tax */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Professional Tax</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={professionTax}
                    onChange={(e) => setProfessionTax(Number(e.target.value))}
                    placeholder="200"
                  />
                </div>
              </div>

              {/* Advances */}
              <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-gray-700">Advances</div>
                <div className="text-gray-700">Fixed amount</div>
                <div>
                  <input
                    type="number"
                    className={inputStyles.base}
                    value={advances}
                    onChange={(e) => setAdvances(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Total Deductions */}
              <div className="grid grid-cols-3 gap-4 mt-4 items-center bg-red-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-black">Total Deductions</div>
                <div></div>
                <div className="text-lg font-semibold text-black">₹ {totalDeductions}</div>
              </div>
            </div>

            {/* Net Payable */}
            <div className="grid grid-cols-3 gap-4 items-center bg-green-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-black">Net Payable</div>
              <div></div>
              <div className="text-lg font-semibold text-black">₹ {netPayable}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const PersonalDetailsStep = ({ setActiveStep, employeeData, updateEmployeeData }: { 
  setActiveStep: (step: number) => void;
  employeeData: EmployeeData;
  updateEmployeeData: (data: Partial<EmployeeData>) => void;
}) => {
  const [dob, setDob] = useState(employeeData.dob);
  const [age, setAge] = useState<string>('');
  const [personalInfo, setPersonalInfo] = useState({
    firstName: employeeData.firstName,
    middleName: '',
    lastName: employeeData.lastName,
    email: employeeData.workEmail,
    phone: employeeData.mobileNumber,
    address: employeeData.address,
  });

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(`${calculatedAge} years`);
    } else {
      setAge('');
    }
  }, [dob]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Update parent component's state
    if (name === 'firstName' || name === 'lastName' || name === 'email' || name === 'phone' || name === 'address') {
      updateEmployeeData({
        [name === 'email' ? 'workEmail' : name === 'phone' ? 'mobileNumber' : name]: value
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-black mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Fields */}
            <div className="space-y-4">
              <div>
                <label className={inputStyles.label}>
                  First Name<span className={inputStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className={inputStyles.label}>
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={personalInfo.middleName}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter middle name"
                />
              </div>

              <div>
                <label className={inputStyles.label}>
                  Last Name<span className={inputStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="space-y-4">
              <div>
                <label className={inputStyles.label}>
                  Email Address<span className={inputStyles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className={inputStyles.label}>
                  Phone Number<span className={inputStyles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={inputStyles.label}>
                  Address<span className={inputStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={personalInfo.address}
                  onChange={handleInputChange}
                  className={inputStyles.base}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Date of Birth and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className={inputStyles.label}>
                Date of Birth<span className={inputStyles.required}>*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  updateEmployeeData({ dob: e.target.value });
                }}
                className={inputStyles.base}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className={inputStyles.label}>
                Age
              </label>
              <input
                type="text"
                value={age}
                className={`${inputStyles.base} bg-gray-50`}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const SuccessPage = ({ 
  employeeName, 
  onAddAnother,
  onViewDetails 
}: { 
  employeeName: string;
  onAddAnother: () => void;
  onViewDetails: () => void;
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <Image
          src="https://static.zohocdn.com/zpayroll/zpayroll//assets/images/empty-states/employee-created-08ef4a2c7f430f5b726f62f459105827.svg"
          alt="Employee Added Successfully"
          width={300}
          height={300}
          className="mx-auto"
        />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        You've successfully added {employeeName} to build
      </h2>
      <p className="text-gray-600 mb-8">
        You can edit your employees' information anytime from the employee details page.
      </p>
      <div className="space-x-4">
        <button
          type="button"
          onClick={onAddAnother}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Another Employee
        </button>
        <button
          type="button"
          onClick={onViewDetails}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go to Employee Details
        </button>
      </div>
    </div>
  );
};

const PaymentInformationStep = ({ setActiveStep, onComplete, employeeData, updateEmployeeData }: { 
  setActiveStep: (step: number) => void;
  onComplete: () => void;
  employeeData: EmployeeData;
  updateEmployeeData: (data: Partial<EmployeeData>) => void;
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(employeeData.paymentMethod);
  const [showNotification, setShowNotification] = useState(false);

  const paymentMethods = [
    {
      id: 'direct_deposit',
      title: 'Direct Deposit (Automated Process)',
      description: 'Initiate payment in Exellar Payroll once the pay run is approved',
      icon: MdPayments,
      configurable: true
    },
    {
      id: 'bank_transfer',
      title: 'Bank Transfer (Manual Process)',
      description: "Download Bank Advice and process the payment through your bank's website",
      icon: MdAccountBalance
    },
    {
      id: 'cheque',
      title: 'Cheque',
      description: '',
      icon: MdPayment
    },
    {
      id: 'cash',
      title: 'Cash',
      description: '',
      icon: MdMoney
    }
  ];

  const handleSaveAndContinue = () => {
    setShowNotification(true);
    // Show notification briefly before completing
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-800 px-6 py-3 rounded-lg shadow-lg border border-green-200 animate-fade-in">
          Successfully added employee!
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-black mb-6">
            How would you like to pay this employee?<span className="text-red-500">*</span>
          </h3>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  <method.icon className={`w-6 h-6 ${
                    selectedPaymentMethod === method.id ? 'text-blue-500' : 'text-gray-500'
                  }`} />
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{method.title}</h4>
                      {method.description && (
                        <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                      )}
                    </div>
                    {method.configurable && selectedPaymentMethod === method.id && (
                      <button
                        type="button"
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        Configure Now
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <div className="text-sm text-red-500">* indicates mandatory fields</div>
        <div className="space-x-4">
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save and Continue
          </button>
          <button
            type="button"
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

const BasicDetailsForm = ({ 
  employeeData, 
  updateEmployeeData 
}: { 
  employeeData: EmployeeData;
  updateEmployeeData: (data: Partial<EmployeeData>) => void;
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className={inputStyles.label}>
              Employee ID<span className={inputStyles.required}>*</span>
            </label>
            <input
              type="text"
              value={employeeData.employeeId}
              onChange={(e) => updateEmployeeData({ employeeId: e.target.value })}
              className={inputStyles.base}
            />
          </div>

          <div>
            <label className={inputStyles.label}>
              First Name<span className={inputStyles.required}>*</span>
            </label>
            <input
              type="text"
              value={employeeData.firstName}
              onChange={(e) => updateEmployeeData({ firstName: e.target.value })}
              className={inputStyles.base}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className={inputStyles.label}>
              Last Name<span className={inputStyles.required}>*</span>
            </label>
            <input
              type="text"
              value={employeeData.lastName}
              onChange={(e) => updateEmployeeData({ lastName: e.target.value })}
              className={inputStyles.base}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className={inputStyles.label}>
              Work Email<span className={inputStyles.required}>*</span>
            </label>
            <input
              type="email"
              value={employeeData.workEmail}
              onChange={(e) => updateEmployeeData({ workEmail: e.target.value })}
              className={inputStyles.base}
              placeholder="Enter work email"
            />
          </div>

          <div>
            <label className={inputStyles.label}>
              Date of Joining<span className={inputStyles.required}>*</span>
            </label>
            <input
              type="date"
              value={employeeData.dateOfJoining}
              onChange={(e) => updateEmployeeData({ dateOfJoining: e.target.value })}
              className={inputStyles.base}
            />
          </div>

          <div>
            <label className={inputStyles.label}>
              Mobile Number
            </label>
            <input
              type="tel"
              value={employeeData.mobileNumber}
              onChange={(e) => updateEmployeeData({ mobileNumber: e.target.value })}
              className={inputStyles.base}
              placeholder="Enter mobile number"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className={inputStyles.label}>
            Gender<span className={inputStyles.required}>*</span>
          </label>
          <select 
            className={inputStyles.select}
            value={employeeData.gender}
            onChange={(e) => updateEmployeeData({ gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={inputStyles.label}>
            Work Location<span className={inputStyles.required}>*</span>
          </label>
          <select 
            className={inputStyles.select}
            value={employeeData.workLocation}
            onChange={(e) => updateEmployeeData({ workLocation: e.target.value })}
          >
            <option value="">Select location</option>
            <option value="head_office">Head Office (college,mumbai...)</option>
          </select>
        </div>

        <div>
          <label className={inputStyles.label}>
            Designation<span className={inputStyles.required}>*</span>
          </label>
          <select 
            className={inputStyles.select}
            value={employeeData.designation}
            onChange={(e) => updateEmployeeData({ designation: e.target.value })}
          >
            <option value="">Select designation</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
          </select>
        </div>

        <div>
          <label className={inputStyles.label}>
            Department<span className={inputStyles.required}>*</span>
          </label>
          <select 
            className={inputStyles.select}
            value={employeeData.department}
            onChange={(e) => updateEmployeeData({ department: e.target.value })}
          >
            <option value="">Select department</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="hr">HR</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => updateEmployeeData({ isDirector: !employeeData.isDirector })}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            checked={employeeData.isDirector}
            onChange={() => updateEmployeeData({ isDirector: !employeeData.isDirector })}
            className={inputStyles.checkbox}
          />
          <span className="text-sm text-gray-700">
            Employee is a Director/person with substantial interest in the company.
          </span>
        </button>
      </div>
    </div>
  );
};

export default function AddEmployeePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeData[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeData>({
    firstName: '',
    lastName: '',
    employeeId: '',
    workEmail: '',
    dateOfJoining: '',
    mobileNumber: '',
    isDirector: false,
    gender: '',
    workLocation: '',
    designation: '',
    department: '',
    annualCTC: 10000,
    basicPercent: 50,
    hraPercent: 50,
    conveyanceAmount: 50,
    mealAllowance: 0,
    medicalAllowance: 0,
    personalPay: 0,
    professionTax: 200,
    advances: 0,
    dob: '',
    address: '',
    paymentMethod: '',
  });

  const handleComplete = () => {
    // Get existing employees from localStorage
    const existingEmployees = localStorage.getItem('employees');
    const employees = existingEmployees ? JSON.parse(existingEmployees) : [];
    
    // Add new employee to the list
    employees.push(currentEmployee);
    
    // Save updated list back to localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // Save individual employee data
    localStorage.setItem(`employee_${currentEmployee.employeeId}`, JSON.stringify(currentEmployee));
    
    setEmployeeList(prev => [...prev, currentEmployee]);
    setIsCompleted(true);
  };

  const handleAddAnother = () => {
    setIsCompleted(false);
    setActiveStep(1);
    setCurrentEmployee({
      firstName: '',
      lastName: '',
      employeeId: '',
      workEmail: '',
      dateOfJoining: '',
      mobileNumber: '',
      isDirector: false,
      gender: '',
      workLocation: '',
      designation: '',
      department: '',
      annualCTC: 10000,
      basicPercent: 50,
      hraPercent: 50,
      conveyanceAmount: 50,
      mealAllowance: 0,
      medicalAllowance: 0,
      personalPay: 0,
      professionTax: 200,
      advances: 0,
      dob: '',
      address: '',
      paymentMethod: '',
    });
  };

  const handleViewDetails = () => {
    // Store the employee data in localStorage before navigation
    localStorage.setItem('currentEmployee', JSON.stringify(currentEmployee));
    router.push('/employee/details');
  };

  // Update current employee data based on form inputs
  const updateEmployeeData = (data: Partial<EmployeeData>) => {
    setCurrentEmployee(prev => ({
      ...prev,
      ...data
    }));
  };

  if (isCompleted) {
    return (
      <SuccessPage 
        employeeName={`${currentEmployee.firstName} ${currentEmployee.lastName}`}
        onAddAnother={handleAddAnother}
        onViewDetails={handleViewDetails}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <h1 className="text-2xl font-semibold text-center mb-8 text-black">Add Employee</h1>

      {/* Progress Steps */}
      <div className="flex justify-center items-center mb-12">
        {[
          { step: 1, label: 'Basic Details' },
          { step: 2, label: 'Salary Details' },
          { step: 3, label: 'Personal Details' },
          { step: 4, label: 'Payment Information' },
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
              ${activeStep >= item.step 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : 'border-gray-300 text-gray-500'}`}
            >
              {item.step}
            </div>
            <div className="text-sm text-gray-600 mx-2">{item.label}</div>
            {index < 3 && (
              <div className={`w-24 h-[2px] mx-2 ${activeStep > item.step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      {activeStep === 1 ? (
        <form className="max-w-4xl mx-auto">
          <BasicDetailsForm
            employeeData={currentEmployee}
            updateEmployeeData={updateEmployeeData}
          />
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      ) : activeStep === 2 ? (
        <SalaryDetailsStep 
          setActiveStep={setActiveStep} 
          employeeData={currentEmployee}
          updateEmployeeData={updateEmployeeData}
        />
      ) : activeStep === 3 ? (
        <PersonalDetailsStep 
          setActiveStep={setActiveStep}
          employeeData={currentEmployee}
          updateEmployeeData={updateEmployeeData}
        />
      ) : activeStep === 4 ? (
        <PaymentInformationStep 
          setActiveStep={setActiveStep} 
          onComplete={handleComplete}
          employeeData={currentEmployee}
          updateEmployeeData={updateEmployeeData}
        />
      ) : null}
    </div>
  );
} 