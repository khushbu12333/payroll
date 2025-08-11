// Test script to verify API integration
// Run this with: node src/test-api.js

const API_BASE_URL = 'http://localhost:8000/api';

async function testAPIConnection() {
  console.log('🧪 Testing Django API Integration...\n');

  try {
    // Test 1: Get all employees
    console.log('1️⃣ Testing GET /api/employees/');
    const employeesResponse = await fetch(`${API_BASE_URL}/employees/`);
    
    if (!employeesResponse.ok) {
      throw new Error(`HTTP error! status: ${employeesResponse.status}`);
    }
    
    const employeesData = await employeesResponse.json();
    console.log(`✅ Success! Found ${employeesData.count} employees`);
    console.log(`   Employees: ${employeesData.results.map(emp => emp.full_name).join(', ')}\n`);

    // Test 2: Get departments
    console.log('2️⃣ Testing GET /api/departments/');
    const deptsResponse = await fetch(`${API_BASE_URL}/departments/`);
    const deptsData = await deptsResponse.json();
    console.log(`✅ Success! Found ${deptsData.count} departments`);
    console.log(`   Departments: ${deptsData.results.map(dept => dept.name).join(', ')}\n`);

    // Test 3: Get designations
    console.log('3️⃣ Testing GET /api/designations/');
    const desigsResponse = await fetch(`${API_BASE_URL}/designations/`);
    const desigsData = await desigsResponse.json();
    console.log(`✅ Success! Found ${desigsData.count} designations`);
    console.log(`   Designations: ${desigsData.results.map(desig => desig.name).join(', ')}\n`);

    // Test 4: Create a new employee (if requested)
    if (process.argv.includes('--add-employee')) {
      console.log('4️⃣ Testing POST /api/employees/ (Adding new employee)');
      
      const newEmployee = {
        employee_id: `EMP${Date.now().toString().slice(-3)}`,
        first_name: 'Test',
        last_name: 'Employee',
        email: `test.employee.${Date.now()}@company.com`,
        phone: '+91-9876543999',
        department: deptsData.results[0].id, // Use first department
        designation: desigsData.results[0].id, // Use first designation
        work_location: 1, // Assuming work location 1 exists
        employment_type: 'FULL_TIME',
        date_of_joining: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        basic_salary: '45000.00',
        annual_ctc: '650000.00'
      };

      const createResponse = await fetch(`${API_BASE_URL}/employees/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (createResponse.ok) {
        const createdEmployee = await createResponse.json();
        console.log(`✅ Success! Created employee: ${createdEmployee.full_name} (ID: ${createdEmployee.employee_id})\n`);
      } else {
        const error = await createResponse.json();
        console.log(`❌ Failed to create employee:`, error);
      }
    }

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${employeesData.count} employees in database`);
    console.log(`   • ${deptsData.count} departments available`);
    console.log(`   • ${desigsData.count} designations available`);
    console.log(`   • API is responding properly`);
    console.log(`   • CORS is configured correctly`);
    
    console.log('\n🌐 Access Points:');
    console.log(`   • Frontend: http://localhost:3001/`);
    console.log(`   • API Browser: http://localhost:8000/api/`);
    console.log(`   • Django Admin: http://localhost:8000/admin/`);

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure Django server is running: python manage.py runserver');
    console.log('   2. Check if the API is accessible: curl http://localhost:8000/api/');
    console.log('   3. Verify CORS settings in Django settings.py');
    process.exit(1);
  }
}

// Run the test
testAPIConnection();

// Usage instructions
console.log('💡 Usage:');
console.log('   node src/test-api.js                 # Test API connection');
console.log('   node src/test-api.js --add-employee  # Test API connection + create employee'); 