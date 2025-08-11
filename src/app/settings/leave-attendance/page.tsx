"use client";
import { useState, useEffect } from "react";
import SettingsLayout from '@/components/SettingsLayout';
import { Calendar, CheckCircle, Clock, CalendarDays, UserPlus, ArrowRight, Plus, Edit, Trash2, CalendarCheck, Users, Settings, Timer, Home, TrendingUp, Bell } from 'lucide-react';

interface Module {
	id: number;
	title: string;
	description: string;
	route: string;
	completed: boolean;
	icon: any;
}

interface LeaveType {
	id: string;
	name: string;
	description: string;
	days_allowed: number;
	is_active: boolean;
}

interface FingerprintLog {
	id: number;
	employee_id: string;
	timestamp: string;
	device_id: string;
	status: string;
}

interface AttendanceSummary {
	date: string;
	check_ins: number;
	check_outs: number;
	present_employees: number;
	logs: FingerprintLog[];
}

export default function LeaveAttendance() {
	const [modules, setModules] = useState<Module[]>([
		{
			id: 1,
			title: "Leave Types",
			description: "Create new leave types or enable default leave types to align with the organisation's specifications.",
			route: "/settings/leave-attendance/leave-types",
			completed: true,
			icon: Calendar,
		},
		{
			id: 2,
			title: "Holiday Management",
			description: "Create new holidays for all your work locations and restrict them for employees, if needed.",
			route: "/settings/leave-attendance/holiday-management",
			completed: true,
			icon: CalendarDays,
		},
		{
			id: 3,
			title: "Attendance Management",
			description: "Customize work shift times, total checked-in hours, workday duration, and attendance regularisation.",
			route: "/settings/leave-attendance/attendance-management",
			completed: true,
			icon: Clock,
		},
		{
			id: 4,
			title: "Setup Preferences",
			description: "Define the attendance cycle, report generation day, and choose to include leave encashment details for pay runs.",
			route: "/settings/leave-attendance/setup-preferences",
			completed: true,
			icon: CheckCircle,
		},
		{
			id: 5,
			title: "Employee Leave Balance",
			description: "Upload your employees' leave balances from your previous records to continue from where you left off.",
			route: "/settings/leave-attendance/employee-leave-balance",
			completed: false,
			icon: UserPlus,
		},
	]);

	const completedCount = modules.filter((module) => module.completed).length;
	const progressPercentage = (completedCount / modules.length) * 100;

	const [activeTab, setActiveTab] = useState<'leave-types' | 'attendance'>('leave-types');
	const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		days_allowed: 0,
		is_active: true
	});

	const [logs, setLogs] = useState<FingerprintLog[]>([]);
	const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
	const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

	if (isLoading) {
		return (
			<SettingsLayout title="Leave & Attendance">
				<div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-black">
					<div className="p-8">
						<div className="flex items-center justify-center h-64">
							<div className="relative">
								<div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-200"></div>
								<div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-600 border-t-transparent absolute top-0 left-0"></div>
							</div>
						</div>
					</div>
				</div>
			</SettingsLayout>
		);
	}

	return (
		<SettingsLayout title="Leave & Attendance">
		
			<div className="p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 min-h-screen">
				{/* Header Section */}
				<div className="bg-yellow-50/80 backdrop-blur-sm border-b border-yellow-200/60 sticky top-0 z-40">
					<div className="max-w-7xl mx-auto px-6 py-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-black-700 to-black-600 bg-clip-text">
									Leave & Attendance
								</h1>
								<p className="mt-1">Manage leave types, attendance settings, and holiday configurations</p>
							</div>
							<div className="flex items-center space-x-4">
								<button className="relative p-2 text-amber-600 hover:text-amber-800 transition-colors">
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
					{/* Navigation Cards with 4 only */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{
								icon: CalendarCheck,
								title: "Leave Types",
								description: "Configure different types of leave policies and regulations",
								href: "/settings/leave-attendance/leave-types",
								gradient: "from-yellow-500 to-amber-500",
								bgGradient: "from-yellow-300/10 to-amber-300/10"
							},
							{
								icon: Timer,
								title: "Attendance Management",
								description: "Set up attendance policies, shifts, and working hours",
								href: "/settings/leave-attendance/attendance-management",
								gradient: "from-yellow-500 to-amber-500",
								bgGradient: "from-yellow-300/10 to-amber-300/10"
							},
							{
								icon: Home,
								title: "Holiday Management",
								description: "Manage company holidays and special occasions",
								href: "/settings/leave-attendance/holiday-management",
								gradient: "from-yellow-500 to-amber-500",
								bgGradient: "from-yellow-300/10 to-amber-300/10"
							}	
						].map((card, index) => (
							<a key={index} href={card.href} className="group block">
								<div className="relative overflow-hidden bg-white border border-yellow-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
									<div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
									<div className="relative h-full flex flex-col">
										<div className="flex items-center justify-between mb-4">
											<div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
												<card.icon className="w-8 h-8 text-white" />
											</div>
											<ArrowRight className="w-5 h-5 text-amber-500 group-hover:text-amber-700 transition-colors duration-300 group-hover:translate-x-1" />
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-semibold group-hover:text-amber-900 transition-colors duration-300 mb-2">
												{card.title}
											</h3>
											<p className="text-sm group-hover:text-amber-800 transition-colors duration-300 leading-relaxed">
												{card.description}
											</p>
										</div>
										<div className="mt-4 pt-4 border-t border-yellow-200/60">
											<div className="flex items-center justify-between">
											</div>
										</div>
									</div>
								</div>
							</a>
						))}
					</div>
				</div>
			</div>
		</SettingsLayout>
	);
}
