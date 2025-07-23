import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AdminEmployeeDetails = () => {
  const [formId, setFormId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formTitle = 'Employee Registration Form'; // Adjust if different

  useEffect(() => {
    const fetchFormId = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/admin/formIdByTitle', { params: { title: formTitle } });
        setFormId(res.data.formId);
      } catch (err) {
        setError('Failed to fetch form ID');
        setLoading(false);
      }
    };
    fetchFormId();
  }, []);

  useEffect(() => {
    if (!formId) return;
    const fetchResponses = async () => {
      try {
        const res = await axios.get(`/api/responses/form/${formId}`);
        setResponses(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch responses');
        setLoading(false);
      }
    };
    fetchResponses();
  }, [formId]);

  const exportToExcel = () => {
    if (responses.length === 0) return;

    // Flatten responses for Excel export
    const data = responses.map((response) => {
      const obj = {};
      response.answers.forEach((answer) => {
        obj[answer.questionId] = answer.value;
      });
      obj['Respondent Email'] = response.respondentEmail || '';
      obj['IP Address'] = response.ipAddress || '';
      obj['User Agent'] = response.userAgent || '';
      obj['Start Time'] = response.startTime || '';
      obj['End Time'] = response.endTime || '';
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EmployeeDetails');
    XLSX.writeFile(workbook, 'EmployeeDetails.xlsx');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Employee Registration Details</h2>
      <button onClick={exportToExcel} style={{ marginBottom: 10 }}>
        Export to Excel
      </button>
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Respondent Email</th>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Start Time</th>
            <th>End Time</th>
            {/* Dynamically add question columns */}
            {responses.length > 0 &&
              Object.keys(
                responses[0].answers.reduce((acc, answer) => {
                  acc[answer.questionId] = true;
                  return acc;
                }, {})
              ).map((qid) => (
                <th key={qid}>{qid}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response._id}>
              <td>{response.respondentEmail || ''}</td>
              <td>{response.ipAddress || ''}</td>
              <td>{response.userAgent || ''}</td>
              <td>{response.startTime ? new Date(response.startTime).toLocaleString() : ''}</td>
              <td>{response.endTime ? new Date(response.endTime).toLocaleString() : ''}</td>
              {Object.keys(
                response.answers.reduce((acc, answer) => {
                  acc[answer.questionId] = answer.value;
                  return acc;
                }, {})
              ).map((qid) => {
                const answer = response.answers.find((a) => a.questionId === qid);
                return <td key={qid}>{answer ? answer.value : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminEmployeeDetails;
