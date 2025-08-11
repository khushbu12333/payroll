// src/app/employee/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_URL = 'http://127.0.0.1:8000/api/employees/';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [form, setForm] = useState({
    name: '',
    email: '',
    // Add other fields as needed
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch employee data
  useEffect(() => {
    fetch(`${API_URL}${id}/`)
      .then(res => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            // Add other fields as needed
          });
          setLoading(false);
        }
      });
  }, [id]);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    // Redirect to employee list page after update
    router.push('/employee');
  };

  if (loading) return <div>Loading...</div>;
  if (notFound) return <div>Employee not found.</div>;

  return (
    <div>
      <h1>Edit Employee</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        {/* Add more fields as needed */}
        <button type="submit">Update Employee</button>
      </form>
    </div>
  );
}
