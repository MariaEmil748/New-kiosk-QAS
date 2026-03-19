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

const ZK_DEVICE_ENABLED = String(process.env.ZK_DEVICE_ENABLED || 'false').toLowerCase() === 'true';
const ZK_DEVICE_IP = process.env.ZK_DEVICE_IP || '';
const ZK_DEVICE_PORT = Number(process.env.ZK_DEVICE_PORT || 4370);
const ZK_DEVICE_TIMEOUT = Number(process.env.ZK_DEVICE_TIMEOUT || 10000);
const ZK_DEVICE_INPORT = Number(process.env.ZK_DEVICE_INPORT || 5200);

let ZKLib = null;
try {
    ZKLib = require('node-zklib');
} catch (error) {
    ZKLib = null;
}

const lastDeviceScan = {
    timestampMs: 0,
    userId: ''
};

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

function createHttpError(status, payload) {
    const error = new Error(payload?.error || payload?.message || 'Request failed');
    error.status = status;
    error.payload = payload;
    return error;
}

async function findEmployeeById(employeeId) {
    const normalizedEmployeeId = normalizeEmployeeInput(employeeId);

    if (!SAP_SERVICE_URL) {
        const employee = mockEmployees[employeeId] || mockEmployees[normalizedEmployeeId];
        if (!employee) {
            throw createHttpError(404, { error: 'Employee not found (mock mode)' });
        }
        return employee;
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
                    return normalizeSapEmployee(directEmployee, employeeId);
                }
            } catch (candidateError) {
                const status = candidateError.response?.status;
                if (status === 401 || status === 403) {
                    throw createHttpError(401, {
                        error: 'SAP login failed (401) — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                        httpStatus: status
                    });
                }
                if (status && status !== 404) {
                    throw candidateError;
                }
            }
        }

        throw createHttpError(404, {
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
        throw createHttpError(404, { error: 'Employee not found in SAP (filter mode)' });
    }

    return normalizeSapEmployee(results[0], employeeId);
}

function extractAttendanceList(attendanceResponse) {
    if (Array.isArray(attendanceResponse)) return attendanceResponse;
    if (Array.isArray(attendanceResponse?.data)) return attendanceResponse.data;
    if (Array.isArray(attendanceResponse?.attendances)) return attendanceResponse.attendances;
    if (Array.isArray(attendanceResponse?.rows)) return attendanceResponse.rows;
    return [];
}

function parseAttendanceTimestamp(record) {
    const candidates = [
        record?.timestamp,
        record?.recordTime,
        record?.deviceTime,
        record?.time,
        record?.punch_time
    ];

    for (const value of candidates) {
        if (!value) continue;
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date.getTime();
        }
    }

    return 0;
}

function parseAttendanceUserId(record) {
    const candidates = [
        record?.userSn,
        record?.uid,
        record?.userId,
        record?.deviceUserId,
        record?.pin,
        record?.id,
        record?.user_id
    ];

    for (const value of candidates) {
        if (value === undefined || value === null) continue;
        const str = String(value).trim();
        if (str) return str;
    }

    return '';
}

async function getLatestDeviceScan() {
    if (!ZK_DEVICE_ENABLED) {
        throw createHttpError(400, { error: 'ZKTeco device integration is disabled. Set ZK_DEVICE_ENABLED=true in .env.' });
    }

    if (!ZK_DEVICE_IP) {
        throw createHttpError(400, { error: 'ZK_DEVICE_IP is missing in .env.' });
    }

    if (!ZKLib) {
        throw createHttpError(500, { error: 'node-zklib package is not installed. Run: npm install node-zklib' });
    }

    const zk = new ZKLib(ZK_DEVICE_IP, ZK_DEVICE_PORT, ZK_DEVICE_TIMEOUT, ZK_DEVICE_INPORT);

    try {
        await zk.createSocket();
        const attendanceResponse = await zk.getAttendances();
        const attendances = extractAttendanceList(attendanceResponse);

        const candidates = attendances
            .map((record) => ({
                userId: parseAttendanceUserId(record),
                timestampMs: parseAttendanceTimestamp(record),
                raw: record
            }))
            .filter((entry) => entry.userId && entry.timestampMs)
            .sort((a, b) => b.timestampMs - a.timestampMs);

        if (!candidates.length) {
            return null;
        }

        return candidates[0];
    } catch (error) {
        throw createHttpError(500, {
            error: 'Failed to connect/read attendance from ZKTeco device.',
            details: error.message
        });
    } finally {
        try {
            if (typeof zk.disconnect === 'function') {
                await zk.disconnect();
            }
        } catch (disconnectError) {
            // no-op
        }
    }
}

async function waitForNextDeviceScan(timeoutMs = 45000, pollEveryMs = 2500) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const latest = await getLatestDeviceScan();
        if (latest) {
            const isNewScan = latest.timestampMs > lastDeviceScan.timestampMs || latest.userId !== lastDeviceScan.userId;
            if (isNewScan) {
                lastDeviceScan.timestampMs = latest.timestampMs;
                lastDeviceScan.userId = latest.userId;
                return latest;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, pollEveryMs));
    }

    return null;
}

// ============================================
// MAIN ROUTE — get employee data by ID
// ============================================
app.get('/api/employee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        const employee = await findEmployeeById(employeeId);
        return res.json(employee);

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json(error.payload || { error: error.message });
        }

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

app.get('/api/device/status', (req, res) => {
    res.json({
        enabled: ZK_DEVICE_ENABLED,
        libraryLoaded: Boolean(ZKLib),
        ipConfigured: Boolean(ZK_DEVICE_IP),
        ip: ZK_DEVICE_IP || null,
        port: ZK_DEVICE_PORT
    });
});

app.get('/api/employee/from-device', async (req, res) => {
    const timeoutMs = Math.min(Number(req.query.timeoutMs || 45000), 120000);

    try {
        const latestScan = await waitForNextDeviceScan(timeoutMs);

        if (!latestScan) {
            return res.status(404).json({
                error: 'No new fingerprint scan detected before timeout.',
                timeoutMs
            });
        }

        const employee = await findEmployeeById(latestScan.userId);

        return res.json({
            ...employee,
            scan: {
                userId: latestScan.userId,
                timestamp: new Date(latestScan.timestampMs).toISOString()
            }
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json(error.payload || { error: error.message });
        }

        console.error('Device scan route error:', error.message);
        return res.status(500).json({
            error: 'Failed to read scan from ZKTeco device.',
            details: error.message
        });
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});