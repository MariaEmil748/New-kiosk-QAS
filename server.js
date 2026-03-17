// ============================================
// REQUIRED PACKAGES
// ============================================
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

const SAP_SERVICE_URL = (process.env.SAP_SERVICE_URL || '').replace(/\/?\?.*$/, '').replace(/\/$/, '');
const SAP_EMPLOYEE_ENTITY = process.env.SAP_EMPLOYEE_ENTITY || 'EmployeeSet';
const SAP_EMPLOYEE_ID_FIELD = process.env.SAP_EMPLOYEE_ID_FIELD || 'EmployeeID';
const SAP_EMPLOYEE_LOOKUP_MODE = (process.env.SAP_EMPLOYEE_LOOKUP_MODE || 'filter').toLowerCase();
const SAP_CLIENT = process.env.SAP_CLIENT || '200';

const mockEmployees = {
    "1001": {
        name: "Ahmed Mohamed",
        hrCode: "1001",
        title: "Software Engineer",
        location: "Cairo - HQ",
        photo: "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=1d4ed8&color=fff&size=200",
        receivedItems: []
    },
    "1002": {
        name: "Sara Ali",
        hrCode: "1002",
        title: "HR Specialist",
        location: "Giza - Mohandeseen",
        photo: "https://ui-avatars.com/api/?name=Sara+Ali&background=7c3aed&color=fff&size=200",
        receivedItems: []
    }
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));// serves your HTML/CSS/JS files

// ============================================
// TEST ROUTE — to check server is running
// ============================================
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ Server is running!' });
});

// ============================================
// SAP DIAGNOSTIC ROUTE — verify service URL shape
// ============================================
app.get('/api/sap/check', async (req, res) => {
    if (!SAP_SERVICE_URL) {
        return res.status(400).json({
            ok: false,
            message: 'SAP_SERVICE_URL is missing in .env',
            expectedExample: 'https://<sap-host>/sap/opu/odata/sap/ZDATA_KIOSK_SRV'
        });
    }

    try {
        const response = await axios.get(`${SAP_SERVICE_URL}/`, {
            params: { '$format': 'json' },
            auth: process.env.SAP_USERNAME && process.env.SAP_PASSWORD
                ? { username: process.env.SAP_USERNAME, password: process.env.SAP_PASSWORD }
                : undefined,
            headers: { Accept: 'application/json' },
            timeout: 10000
        });

        return res.json({
            ok: true,
            message: 'SAP service root is reachable',
            serviceUrl: SAP_SERVICE_URL,
            employeeEntity: SAP_EMPLOYEE_ENTITY,
            lookupMode: SAP_EMPLOYEE_LOOKUP_MODE,
            status: response.status
        });
    } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            return res.status(401).json({
                ok: false,
                message: 'SAP requires authentication — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                serviceUrl: SAP_SERVICE_URL,
                httpStatus: status
            });
        }
        return res.status(500).json({
            ok: false,
            message: 'Could not reach SAP service root',
            serviceUrl: SAP_SERVICE_URL,
            error: error.message
        });
    }
});

function pickFirst(obj, keys, fallback = '') {
    for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') {
            return obj[key];
        }
    }
    return fallback;
}

function normalizeSapEmployee(sapEmployee, requestedId) {
    const employeeName = pickFirst(sapEmployee, ['EmployeeName', 'FullName', 'Name', 'ENAME'], 'Employee');
    const employeeId = String(pickFirst(sapEmployee, ['EmployeeId', 'EmployeeID', 'HRCode', 'PERNR', 'EmpCode'], requestedId));
    const lineValue = pickFirst(sapEmployee, ['Line'], '');
    const hasImageData = typeof lineValue === 'string' && lineValue.length > 100;

    return {
        name: employeeName,
        hrCode: employeeId,
        title: pickFirst(sapEmployee, ['Position', 'JobTitle', 'Designation'], 'Employee'),
        location: pickFirst(sapEmployee, ['OrgUnit', 'Location', 'Plant', 'Site', 'Department'], 'N/A'),
        photo: pickFirst(
            sapEmployee,
            ['PhotoUrl', 'AvatarUrl'],
            hasImageData
                ? `data:image/jpeg;base64,${lineValue}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=1d4ed8&color=fff&size=200`
        ),
        approver: pickFirst(sapEmployee, ['Approver'], ''),
        receivedItems: []
    };
}

function normalizeEmployeeInput(input) {
    const trimmed = String(input || '').trim();
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (!digitsOnly) return trimmed;
    return digitsOnly.padStart(8, '0');
}

function extractODataResults(payload) {
    if (Array.isArray(payload?.value)) return payload.value;
    if (Array.isArray(payload?.d?.results)) return payload.d.results;
    if (payload?.d && typeof payload.d === 'object') return [payload.d];
    return [];
}

// ============================================
// MAIN ROUTE — get employee data by ID
// ============================================
app.get('/api/employee/:id', async (req, res) => {
    const employeeId = req.params.id;
    const normalizedEmployeeId = normalizeEmployeeInput(employeeId);

    try {
        if (!SAP_SERVICE_URL) {
            const employee = mockEmployees[employeeId];
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found (mock mode)' });
            }
            return res.json(employee);
        }

        const auth = process.env.SAP_USERNAME && process.env.SAP_PASSWORD
            ? { username: process.env.SAP_USERNAME, password: process.env.SAP_PASSWORD }
            : undefined;

        const sapHeaders = {
            Accept: 'application/json',
            'sap-client': SAP_CLIENT
        };

        if (SAP_EMPLOYEE_LOOKUP_MODE === 'key') {
            const idCandidates = [...new Set([normalizedEmployeeId, employeeId])];

            for (const idCandidate of idCandidates) {
                try {
                    const sapResponse = await axios.get(`${SAP_SERVICE_URL}/${SAP_EMPLOYEE_ENTITY}('${idCandidate}')`, {
                        params: { '$format': 'json' },
                        auth,
                        headers: sapHeaders,
                        timeout: 15000
                    });

                    const directEmployee = sapResponse.data?.d || sapResponse.data?.value || sapResponse.data;
                    if (directEmployee && typeof directEmployee === 'object') {
                        return res.json(normalizeSapEmployee(directEmployee, employeeId));
                    }
                } catch (candidateError) {
                    const status = candidateError.response?.status;
                    if (status === 401 || status === 403) {
                        throw candidateError;
                    }
                    if (status !== 404) {
                        throw candidateError;
                    }
                }
            }

            return res.status(404).json({
                error: 'Employee not found in SAP (key mode)',
                searched: idCandidates
            });
        }

        const sapResponse = await axios.get(`${SAP_SERVICE_URL}/${SAP_EMPLOYEE_ENTITY}`, {
            params: {
                '$format': 'json',
                '$top': 1,
                '$filter': `${SAP_EMPLOYEE_ID_FIELD} eq '${normalizedEmployeeId}'`
            },
            auth,
            headers: sapHeaders,
            timeout: 15000
        });

        const results = extractODataResults(sapResponse.data);
        if (!results.length) {
            return res.status(404).json({ error: 'Employee not found in SAP (filter mode)' });
        }

        return res.json(normalizeSapEmployee(results[0], employeeId));

    } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            return res.status(401).json({
                error: 'SAP login failed (401) — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                httpStatus: status
            });
        }
        console.error('SAP API Error:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch employee data from SAP',
            details: error.message,
            hint: 'Check SAP_SERVICE_URL, SAP_EMPLOYEE_ENTITY, SAP_EMPLOYEE_LOOKUP_MODE, SAP_EMPLOYEE_ID_FIELD and credentials'
        });
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});