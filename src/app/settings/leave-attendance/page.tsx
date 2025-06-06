"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Module {
	id: number;
	title: string;
	description: string;
	route: string;
	completed: boolean;
}

export default function LeaveAttendance() {
	const router = useRouter();
	const [modules, setModules] = useState<Module[]>([
		{
			id: 1,
			title: "Leave Types",
			description:
				"Create new leave types or enable default leave types to align with the organisation's specifications.",
			route: "/settings/leave-attendance/leave-types",
			completed: true,
		},
		{
			id: 2,
			title: "Holiday Management",
			description:
				"Create new holidays for all your work locations and restrict them for employees, if needed.",
			route: "/settings/leave-attendance/holiday-management",
			completed: true,
		},
		{
			id: 3,
			title: "Attendance Management",
			description:
				"Customize work shift times, total checked-in hours, workday duration, and attendance regularisation.",
			route: "/settings/leave-attendance/attendance-management",
			completed: true,
		},
		{
			id: 4,
			title: "Setup Preferences",
			description:
				"Define the attendance cycle, report generation day, and choose to include leave encashment details for pay runs.",
			route: "/settings/leave-attendance/setup-preferences",
			completed: true,
		},
		{
			id: 5,
			title: "Employee Leave Balance",
			description:
				"Upload your employees' leave balances from your previous records to continue from where you left off.",
			route: "/settings/leave-attendance/employee-leave-balance",
			completed: false,
		},
	]);

	const completedCount = modules.filter((module) => module.completed).length;

	return (
		<div className="min-h-screen bg-white px-6 py-10">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-semibold text-black">
						Setup Leave And Attendance Modules
					</h1>
					<p className="text-gray-600 mt-2">
						Configure the modules based on your organisational requirements.
					</p>
					<div className="mt-4 text-sm text-gray-600">
						{completedCount} / {modules.length} Completed
					</div>
					<div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
						<div
							className="bg-green-500 h-full transition-all duration-500"
							style={{
								width: `${(completedCount / modules.length) * 100}%`,
							}}
						/>
					</div>
				</div>

				<div className="space-y-4">
					{modules.map((module) => (
						<div key={module.id} className="border rounded-lg p-6 relative">
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-4">
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
											module.completed
												? "bg-green-500"
												: "bg-gray-200"
										}`}
									>
										{module.completed && (
											<svg
												className="w-4 h-4 text-white"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</div>
									<div>
										<h2 className="text-lg font-semibold text-black">
											{module.title}
										</h2>
										<p className="text-gray-600 mt-1">
											{module.description}
										</p>
									</div>
								</div>
								<button
									onClick={() => router.push(module.route)}
									className="text-sm bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md active:scale-95"
								>
									Configure Now
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
