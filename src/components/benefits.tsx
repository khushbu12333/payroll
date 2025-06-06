const benefits = [
    {
      icon: "📅",
      title: "Efficient Leave Management"
    },
    {
      icon: "✅",
      title: "Accurate Attendance Tracking"
    },
    {
      icon: "🧾",
      title: "Simplified Payroll Processing"
    }
  ];
  
  export default function Benefits() {
    return (
      <div className="mt-20 bg-gray-50 py-10 rounded-lg">
        <h3 className="text-center text-lg font-semibold mb-6 text-gray-900">Benefits</h3>
        <div className="flex justify-center gap-16">
          {benefits.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="text-3xl">{item.icon}</div>
              <p className="text-gray-700 text-sm text-center">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  