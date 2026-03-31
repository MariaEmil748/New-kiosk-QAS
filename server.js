// ============================================
// REQUIRED PACKAGES
// ============================================
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

function normalizeServiceUrl(value) {
    return String(value || '')
        .replace(/tbtd-sandbox\.tbtd-eg:8061/i, 'tbtd-sandbox.tbtd-egypt.com:8061')
        .replace(/\/?\?.*$/, '')
        .replace(/\/$/, '');
}

const SAP_SERVICE_URL = normalizeServiceUrl(process.env.SAP_SERVICE_URL || '');
const SAP_EMPLOYEE_ENTITY = process.env.SAP_EMPLOYEE_ENTITY || 'EmployeeSet';
const SAP_EMPLOYEE_ID_FIELD = process.env.SAP_EMPLOYEE_ID_FIELD || 'EmployeeID';
const SAP_EMPLOYEE_LOOKUP_MODE = (process.env.SAP_EMPLOYEE_LOOKUP_MODE || 'filter').toLowerCase();
const SAP_CLIENT = process.env.SAP_CLIENT || '200';
const SAP_PHOTO_SERVICE_URL = normalizeServiceUrl(process.env.SAP_PHOTO_SERVICE_URL || '');
const SAP_PHOTO_ENTITY = process.env.SAP_PHOTO_ENTITY || 'EmployeeProfileSet';
const SAP_LEAVE_ENTITY = process.env.SAP_LEAVE_ENTITY || 'LeaveOverview';
const SAP_LEAVE_EMPLOYEE_FIELD = process.env.SAP_LEAVE_EMPLOYEE_FIELD || 'EmployeeId';
const SAP_KIOSK3_SERVICE_URL = normalizeServiceUrl(process.env.SAP_KIOSK3_SERVICE_URL || '');
const SAP_KIOSK3_ABSENCE_ENTITY = process.env.SAP_KIOSK3_ABSENCE_ENTITY || 'AbsencequotareturntableSet';
const SAP_KIOSK3_HOLIDAYS_ENTITY = process.env.SAP_KIOSK3_HOLIDAYS_ENTITY || 'HolidaysSet';
const SAP_KIOSK3_LEAVE_OVERVIEW_ENTITY = process.env.SAP_KIOSK3_LEAVE_OVERVIEW_ENTITY || 'LeaveOverviewSet';
const SAP_KIOSK3_LEAVE_TYPES_ENTITY = process.env.SAP_KIOSK3_LEAVE_TYPES_ENTITY || 'LeaveTypesSet';
const SAP_KIOSK3_LEAVES_ENTITY = process.env.SAP_KIOSK3_LEAVES_ENTITY || 'LeavesSet';
const SAP_KIOSK3_NEW_LEAVES_ENTITY = process.env.SAP_KIOSK3_NEW_LEAVES_ENTITY || 'NewLeavesSet';

const ZK_DEVICE_ENABLED = String(process.env.ZK_DEVICE_ENABLED || 'false').toLowerCase() === 'true';
const ZK_DEVICE_IP = process.env.ZK_DEVICE_IP || '';
const ZK_DEVICE_PORT = Number(process.env.ZK_DEVICE_PORT || 4370);
const ZK_DEVICE_TIMEOUT = Number(process.env.ZK_DEVICE_TIMEOUT || 10000);
const ZK_DEVICE_INPORT = Number(process.env.ZK_DEVICE_INPORT || 5200);
const ZK_ATTENDANCE_USER_FIELD = (process.env.ZK_ATTENDANCE_USER_FIELD || '').trim();

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

function isLikelyPlaceholderBase64(value) {
    if (typeof value !== 'string') return false;
    const compact = value.replace(/\s/g, '').replace(/=+$/, '');
    if (compact.length < 100) return false;
    return /^A+$/.test(compact);
}

function toImageDataUrl(value, mimeType = 'image/jpeg') {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:image/')) return trimmed;
    if (isLikelyPlaceholderBase64(trimmed)) return '';
    if (trimmed.length < 100) return '';
    return `data:${mimeType};base64,${trimmed}`;
}

function normalizeSapEmployee(sapEmployee, requestedId, photoOverride = '') {
    const employeeName = pickFirst(sapEmployee, ['EmployeeName', 'FullName', 'Name', 'ENAME'], 'Employee');
    const employeeId = String(pickFirst(sapEmployee, ['EmployeeId', 'EmployeeID', 'HRCode', 'PERNR', 'EmpCode'], requestedId));
    const base64FromSap = pickFirst(sapEmployee, ['PhotoBase64', 'PHOTO_BASE64', 'Line', 'Photo', 'Image'], '');
    const photoFromBase64 = toImageDataUrl(base64FromSap);
    const photoUrlFromSap = pickFirst(sapEmployee, ['PhotoUrl', 'AvatarUrl'], '');
    const finalPhoto = photoOverride || photoFromBase64 || photoUrlFromSap || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=1d4ed8&color=fff&size=512`;
    const hasPhoto = Boolean(photoOverride || photoFromBase64 || photoUrlFromSap);

    return {
        name: employeeName,
        hrCode: employeeId,
        title: pickFirst(sapEmployee, ['Position', 'JobTitle', 'Designation'], 'Employee'),
        location: pickFirst(sapEmployee, ['OrgUnit', 'Location', 'Plant', 'Site', 'Department'], 'N/A'),
        photo: finalPhoto,
        hasPhoto,
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

function parseSapDateValue(value) {
    if (!value) return '';
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split('T')[0];
    }

    const text = String(value);
    const match = text.match(/\/Date\((\d+)/);
    if (match) {
        const date = new Date(Number(match[1]));
        if (!Number.isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return text;
}

function getDefaultLeaveTypes(pernr) {
    return [
        { Pernr: pernr, Subty: 'EXIN', Description: 'Excuse - IN', Type: 'Period' },
        { Pernr: pernr, Subty: 'EXOT', Description: 'Excuse - Out', Type: 'Period' },
        { Pernr: pernr, Subty: 'MISN', Description: 'Mission', Type: 'Period' },
        { Pernr: pernr, Subty: '0001', Description: 'Annual Vacation', Type: 'Period' },
        { Pernr: pernr, Subty: 'MIN', Description: 'Mission In', Type: 'Event' },
        { Pernr: pernr, Subty: 'MOUT', Description: 'Mission Out', Type: 'Event' }
    ];
}

function getDefaultNewLeaves(pernr) {
    return [
        { Pernr: pernr, Subty: '0002', Description: 'Maternity Leave', Type: 'Period' },
        { Pernr: pernr, Subty: '0003', Description: 'Haj Leave', Type: 'Period' },
        { Pernr: pernr, Subty: '0004', Description: 'Military Leave', Type: 'Period' },
        { Pernr: pernr, Subty: '0005', Description: 'Condolences Leave', Type: 'Period' },
        { Pernr: pernr, Subty: '0006', Description: 'Marriage Leave', Type: 'Period' },
        { Pernr: pernr, Subty: '0007', Description: 'Unpaid Leave', Type: 'Period' }
    ];
}

function mapLegacyRecordToLeavesSetShape(record) {
    const raw = record?.raw || {};
    return {
        Pernr: record.employeeId || pickFirst(raw, ['Pernr', 'EmployeeId'], ''),
        RequestId: pickFirst(raw, ['RequestId'], ''),
        Status: record.status || pickFirst(raw, ['Status'], ''),
        Endda: parseSapDateValue(pickFirst(raw, ['Endda', 'EndDate'], record.toDate || '')),
        Begda: parseSapDateValue(pickFirst(raw, ['Begda', 'StartDate'], record.fromDate || '')),
        Subty: pickFirst(raw, ['Subty'], ''),
        AttabsHours: pickFirst(raw, ['AttabsHours'], ''),
        SubtypeDescription: record.leaveType || pickFirst(raw, ['SubtypeDescription'], ''),
        Deduction: pickFirst(raw, ['Deduction'], ''),
        ProcName: pickFirst(raw, ['ProcName'], ''),
        CurrNotice: pickFirst(raw, ['CurrNotice'], ''),
        BeginTime: pickFirst(raw, ['BeginTime'], ''),
        EndTime: pickFirst(raw, ['EndTime'], '')
    };
}

function normalizeLeaveOverviewItem(item) {
    const requestedValue = Number.parseFloat(pickFirst(item, ['Requested'], '0'));
    const requestedDays = Number.isFinite(requestedValue) ? requestedValue : 0;
    const hasRequestedField = item && Object.prototype.hasOwnProperty.call(item, 'Requested');
    const fromDateRaw = pickFirst(item, ['FromDate', 'StartDate', 'Begda', 'Startda'], '');
    const toDateRaw = pickFirst(item, ['ToDate', 'EndDate', 'Endda'], '');

    return {
        employeeId: String(pickFirst(item, ['EmployeeId', 'EmployeeID', 'PERNR', 'Pernr'], '')),
        leaveType: pickFirst(item, ['LeaveType', 'AbsenceType', 'Type', 'SubtypeDescription', 'Subty'], hasRequestedField ? 'Requested' : ''),
        totalDays: Number(pickFirst(item, ['TotalDays', 'Quota', 'AnnualLeave'], requestedDays)) || 0,
        usedDays: Number(pickFirst(item, ['UsedDays', 'Consumed', 'TakenDays'], requestedDays)) || 0,
        remainingDays: Number(pickFirst(item, ['RemainingDays', 'Balance', 'RemainingLeave'], 0)) || 0,
        fromDate: parseSapDateValue(fromDateRaw),
        toDate: parseSapDateValue(toDateRaw),
        status: pickFirst(item, ['Status'], ''),
        raw: item
    };
}

function createHttpError(status, payload) {
    const error = new Error(payload?.error || payload?.message || 'Request failed');
    error.status = status;
    error.payload = payload;
    return error;
}

function getSapAuth() {
    return process.env.SAP_USERNAME && process.env.SAP_PASSWORD
        ? { username: process.env.SAP_USERNAME, password: process.env.SAP_PASSWORD }
        : undefined;
}

function getSapHeaders() {
    return {
        Accept: 'application/json',
        'sap-client': SAP_CLIENT
    };
}

function getKiosk3ServiceUrl() {
    if (SAP_KIOSK3_SERVICE_URL) return SAP_KIOSK3_SERVICE_URL;
    if (!SAP_SERVICE_URL) return '';

    const hostMatch = SAP_SERVICE_URL.match(/^(https?:\/\/[^/]+)/i);
    if (!hostMatch) return '';
    return `${hostMatch[1]}/sap/opu/odata/SAP/ZDATA_KIOSK3_SRV`;
}

async function fetchKiosk3Collection(entitySetName, normalizedEmployeeId, options = {}) {
    const serviceUrl = getKiosk3ServiceUrl();
    if (!serviceUrl) return [];

    const shortId = String(Number(normalizedEmployeeId));
    const pernrCandidates = [...new Set([normalizedEmployeeId, shortId])].filter(Boolean);
    const allowUnfilteredFallback = options.allowUnfilteredFallback !== false;

    for (const pernr of pernrCandidates) {
        try {
            const response = await axios.get(`${serviceUrl}/${entitySetName}`, {
                params: {
                    '$format': 'json',
                    '$filter': `Pernr eq '${pernr}'`
                },
                auth: getSapAuth(),
                headers: getSapHeaders(),
                timeout: 15000
            });

            const rows = extractODataResults(response.data);
            if (rows.length) return rows;
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 || status === 404) {
                continue;
            }
            throw error;
        }
    }

    if (!allowUnfilteredFallback) {
        return [];
    }

    try {
        const response = await axios.get(`${serviceUrl}/${entitySetName}`, {
            params: {
                '$format': 'json',
                '$top': 200
            },
            auth: getSapAuth(),
            headers: getSapHeaders(),
            timeout: 15000
        });

        const rows = extractODataResults(response.data);
        if (!rows.length) return [];

        const hasPernrField = rows.some((row) => Object.prototype.hasOwnProperty.call(row || {}, 'Pernr') || Object.prototype.hasOwnProperty.call(row || {}, 'PERNR'));
        if (!hasPernrField) {
            return rows;
        }

        return rows.filter((row) => {
            const pernrValue = String(pickFirst(row, ['Pernr', 'PERNR', 'EmployeeId', 'EmployeeID'], '')).trim();
            return pernrCandidates.includes(pernrValue);
        });
    } catch (error) {
        const status = error.response?.status;
        if (status === 400 || status === 404) {
            return [];
        }
        throw error;
    }
}

async function fetchKiosk3LeaveOverview(entitySetName, normalizedEmployeeId) {
    const serviceUrl = getKiosk3ServiceUrl();
    if (!serviceUrl) return [];

    const shortId = String(Number(normalizedEmployeeId));
    const keyCandidates = [...new Set([shortId, normalizedEmployeeId])].filter(Boolean);

    for (const key of keyCandidates) {
        try {
            const response = await axios.get(`${serviceUrl}/${entitySetName}('${key}')`, {
                params: { '$format': 'json' },
                auth: getSapAuth(),
                headers: getSapHeaders(),
                timeout: 15000
            });

            const payload = response.data?.d || response.data?.value || response.data;
            if (Array.isArray(payload)) return payload;
            if (payload && typeof payload === 'object') return [payload];
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 || status === 404) {
                continue;
            }
            throw error;
        }
    }

    return [];
}

async function fetchLegacyLeaveOverviewRecords(normalizedEmployeeId) {
    if (!SAP_SERVICE_URL) return [];

    const response = await axios.get(`${SAP_SERVICE_URL}/${SAP_LEAVE_ENTITY}`, {
        params: {
            '$format': 'json',
            '$filter': `${SAP_LEAVE_EMPLOYEE_FIELD} eq '${normalizedEmployeeId}'`
        },
        auth: getSapAuth(),
        headers: getSapHeaders(),
        timeout: 15000
    });

    return extractODataResults(response.data).map(normalizeLeaveOverviewItem);
}

async function resolvePhotoFromDedicatedApi(employeeId) {
    if (!SAP_PHOTO_SERVICE_URL) {
        return '';
    }

    const normalizedEmployeeId = normalizeEmployeeInput(employeeId);
    const idCandidates = [...new Set([String(employeeId || '').trim(), normalizedEmployeeId])].filter(Boolean);

    for (const idCandidate of idCandidates) {
        try {
            const response = await axios.get(`${SAP_PHOTO_SERVICE_URL}/${SAP_PHOTO_ENTITY}('${idCandidate}')`, {
                params: {
                    '$format': 'json',
                    'FORMAT': 'JSON'
                },
                auth: getSapAuth(),
                headers: getSapHeaders(),
                timeout: 15000
            });

            const payload = response.data?.d || response.data?.value || response.data;
            const photoBase64Value = pickFirst(payload, ['PhotoBase64', 'PHOTO_BASE64', 'Line', 'Photo', 'Image'], '');
            const photoDataUrl = toImageDataUrl(photoBase64Value);
            if (photoDataUrl) return photoDataUrl;

            const urlValue = pickFirst(payload, ['PhotoUrl', 'AvatarUrl'], '');
            if (urlValue) {
                return String(urlValue);
            }
        } catch (error) {
            // Try next candidate.
        }
    }

    return '';
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

    const auth = getSapAuth();
    const sapHeaders = getSapHeaders();

    if (SAP_EMPLOYEE_LOOKUP_MODE === 'key') {
        const idCandidates = [...new Set([normalizedEmployeeId, employeeId])];
        const skippedCandidates = [];

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
                    const photoOverride = await resolvePhotoFromDedicatedApi(employeeId);
                    return normalizeSapEmployee(directEmployee, employeeId, photoOverride);
                }
            } catch (candidateError) {
                const status = candidateError.response?.status;
                if (status === 401 || status === 403) {
                    throw createHttpError(401, {
                        error: 'SAP login failed (401) — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                        httpStatus: status
                    });
                }
                // Some SAP backends return 400 for invalid key shape; try next candidate before failing.
                if (status === 400 || status === 404) {
                    skippedCandidates.push({
                        idCandidate,
                        status,
                        message: candidateError.response?.data?.error?.message?.value || candidateError.message
                    });
                    continue;
                }

                if (status) {
                    throw candidateError;
                }

                throw candidateError;
            }
        }

        throw createHttpError(404, {
            error: 'Employee not found in SAP (key mode)',
            searched: idCandidates,
            skippedCandidates
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

    const photoOverride = await resolvePhotoFromDedicatedApi(employeeId);
    return normalizeSapEmployee(results[0], employeeId, photoOverride);
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
    const manualFieldValue = ZK_ATTENDANCE_USER_FIELD ? record?.[ZK_ATTENDANCE_USER_FIELD] : undefined;

    // Prefer stable enrollment/user code fields first; keep event/log counters as last fallback only.
    const candidates = [
        manualFieldValue,
        record?.userId,
        record?.deviceUserId,
        record?.pin,
        record?.enrollNumber,
        record?.enrollNo,
        record?.employeeId,
        record?.empCode,
        record?.user_id,
        record?.userSn,
        record?.uid,
        record?.id
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
app.get('/api/employee/:id', async (req, res, next) => {
    const employeeId = req.params.id;

    // Allow the dedicated scan route to handle /api/employee/from-device.
    if (employeeId === 'from-device') {
        return next();
    }

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
    let latestScan = null;

    try {
        latestScan = await waitForNextDeviceScan(timeoutMs);

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
            return res.status(error.status).json({
                ...(error.payload || { error: error.message }),
                scan: latestScan
                    ? {
                        userId: latestScan.userId,
                        timestamp: new Date(latestScan.timestampMs).toISOString()
                    }
                    : null
            });
        }

        const sapStatus = error.response?.status;
        if (sapStatus) {
            return res.status(sapStatus).json({
                error: 'SAP rejected lookup for scanned user ID.',
                details: error.message,
                sapStatus,
                sapError: error.response?.data || null,
                scan: latestScan
                    ? {
                        userId: latestScan.userId,
                        timestamp: new Date(latestScan.timestampMs).toISOString()
                    }
                    : null
            });
        }

        console.error('Device scan route error:', error.message);
        return res.status(500).json({
            error: 'Failed to read scan from ZKTeco device.',
            details: error.message
        });
    }
});

app.get('/api/kiosk3/overview/:id', async (req, res) => {
    const employeeId = req.params.id;
    const normalizedEmployeeId = normalizeEmployeeInput(employeeId);

    try {
        const serviceUrl = getKiosk3ServiceUrl();
        if (!serviceUrl) {
            return res.json({
                employeeId,
                normalizedEmployeeId,
                serviceUrl: '',
                records: [],
                absenceQuota: [],
                holidays: [],
                leaveOverview: [],
                leaveTypes: [],
                leaves: [],
                newLeaves: []
            });
        }

        let [absenceQuota, holidays, leaveOverviewRaw, leaveTypes, leaves, newLeaves, legacyLeaveRecords] = await Promise.all([
            fetchKiosk3Collection(SAP_KIOSK3_ABSENCE_ENTITY, normalizedEmployeeId),
            fetchKiosk3Collection(SAP_KIOSK3_HOLIDAYS_ENTITY, normalizedEmployeeId),
            fetchKiosk3LeaveOverview(SAP_KIOSK3_LEAVE_OVERVIEW_ENTITY, normalizedEmployeeId),
            fetchKiosk3Collection(SAP_KIOSK3_LEAVE_TYPES_ENTITY, normalizedEmployeeId),
            fetchKiosk3Collection(SAP_KIOSK3_LEAVES_ENTITY, normalizedEmployeeId),
            fetchKiosk3Collection(SAP_KIOSK3_NEW_LEAVES_ENTITY, normalizedEmployeeId),
            fetchLegacyLeaveOverviewRecords(normalizedEmployeeId).catch(() => [])
        ]);

        const leaveOverview = leaveOverviewRaw.map(normalizeLeaveOverviewItem);
        const requestedTotal = leaveOverviewRaw.reduce((sum, row) => {
            const value = Number.parseFloat(pickFirst(row, ['Requested'], '0'));
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
        const mergedByKey = new Map();
        for (const record of [...leaveOverview, ...legacyLeaveRecords]) {
            const dedupeKey = [
                record.employeeId,
                record.leaveType,
                record.fromDate,
                record.toDate,
                record.status
            ].join('|');
            if (!mergedByKey.has(dedupeKey)) {
                mergedByKey.set(dedupeKey, record);
            }
        }
        const combinedLeaveOverview = [...mergedByKey.values()];

        if (!leaveTypes.length) {
            leaveTypes = getDefaultLeaveTypes(normalizedEmployeeId);
        }

        if (!newLeaves.length) {
            newLeaves = getDefaultNewLeaves(normalizedEmployeeId);
        }

        if (!leaves.length && legacyLeaveRecords.length) {
            leaves = legacyLeaveRecords.map(mapLegacyRecordToLeavesSetShape);
        }

        const annualQuotaRows = absenceQuota.filter((row) => {
            const quotaType = String(pickFirst(row, ['Quotatype'], '')).trim();
            const quotaText = String(pickFirst(row, ['Quotatext'], '')).toLowerCase();
            return quotaType === '01' || quotaText.includes('annual');
        });

        const quotaRowsForTotals = annualQuotaRows.length ? annualQuotaRows : absenceQuota;
        const totalVacations = quotaRowsForTotals.reduce((sum, row) => {
            const value = Number.parseFloat(pickFirst(row, ['Entitle'], '0'));
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);
        const remainingVacations = quotaRowsForTotals.reduce((sum, row) => {
            const value = Number.parseFloat(pickFirst(row, ['Rest'], '0'));
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);

        return res.json({
            employeeId,
            normalizedEmployeeId,
            serviceUrl,
            records: combinedLeaveOverview,
            counts: {
                absenceQuota: absenceQuota.length,
                holidays: holidays.length,
                leaveOverview: combinedLeaveOverview.length,
                leaveTypes: leaveTypes.length,
                leaves: leaves.length,
                newLeaves: newLeaves.length,
                legacyLeaveOverview: legacyLeaveRecords.length
            },
            requestedTotal,
            totalVacations,
            remainingVacations,
            absenceQuota,
            holidays,
            leaveOverview: combinedLeaveOverview,
            leaveTypes,
            leaves,
            newLeaves,
            legacyLeaveOverview: legacyLeaveRecords
        });
    } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            return res.status(401).json({
                error: 'SAP login failed (401) — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                httpStatus: status
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch ZDATA_KIOSK3 leave APIs',
            details: error.message,
            hint: 'Check SAP_KIOSK3_SERVICE_URL and SAP credentials'
        });
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

app.get('/api/leave-overview/:id', async (req, res) => {
    const employeeId = req.params.id;
    const normalizedEmployeeId = normalizeEmployeeInput(employeeId);

    try {
        if (!SAP_SERVICE_URL) {
            return res.json({
                employeeId,
                records: []
            });
        }

        const auth = process.env.SAP_USERNAME && process.env.SAP_PASSWORD
            ? { username: process.env.SAP_USERNAME, password: process.env.SAP_PASSWORD }
            : undefined;

        const sapHeaders = {
            Accept: 'application/json',
            'sap-client': SAP_CLIENT
        };

        const sapResponse = await axios.get(`${SAP_SERVICE_URL}/${SAP_LEAVE_ENTITY}`, {
            params: {
                '$format': 'json',
                '$filter': `${SAP_LEAVE_EMPLOYEE_FIELD} eq '${normalizedEmployeeId}'`
            },
            auth,
            headers: sapHeaders,
            timeout: 15000
        });

        const records = extractODataResults(sapResponse.data).map(normalizeLeaveOverviewItem);

        return res.json({
            employeeId,
            normalizedEmployeeId,
            count: records.length,
            records
        });
    } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            return res.status(401).json({
                error: 'SAP login failed (401) — add SAP_USERNAME and SAP_PASSWORD to your .env file',
                httpStatus: status
            });
        }

        if (status === 404) {
            return res.status(404).json({
                error: 'LeaveOverview entity was not found in SAP service. Check SAP_LEAVE_ENTITY in .env.',
                entity: SAP_LEAVE_ENTITY
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch leave overview from SAP',
            details: error.message,
            hint: 'Check SAP_SERVICE_URL, SAP_LEAVE_ENTITY, SAP_LEAVE_EMPLOYEE_FIELD and credentials'
        });
    }
});