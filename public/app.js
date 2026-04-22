// ============================================
// MOCK DATA
// ============================================
const mockEmployees = {
    "1001": {
        name: "أحمد محمد",
        hrCode: "HR-1001",
        title: "مهندس برمجيات",
        location: "القاهرة - المقر الرئيسي",
        photo: "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=1d4ed8&color=fff&size=200",
        annualLeave: 21,
        sickLeave: 7,
        remainingLeave: 14,
        events: [
            {
                event: 1001,
                eventDesc: "تدريب أساسي",
                validFrom: "2024-01-15",
                validTo: "2024-01-20",
                confFlag: "X",
                confDate: "2024-01-14",
                confTime: "093000",
                terminalId: "TERM01",
                doneFlag: ""
            },
            {
                event: 1002,
                eventDesc: "حضور المؤتمر السنوي",
                validFrom: "2024-02-01",
                validTo: "2024-02-03",
                confFlag: "X",
                confDate: "2024-01-28",
                confTime: "140500",
                terminalId: "TERM02",
                doneFlag: "X"
            },
            {
                event: 1003,
                eventDesc: "معايرة الأداء",
                validFrom: "2024-03-10",
                validTo: "2024-03-10",
                confFlag: "",
                confDate: "",
                confTime: "",
                terminalId: "",
                doneFlag: ""
            }
        ],
        receivedItems: [
            { name: "لابتوب Dell XPS 15", date: "2024-01-15", status: "received" },
            { name: "هاتف iPhone 14", date: "2024-01-15", status: "received" },
            { name: "بطاقة دخول", date: "2024-01-15", status: "received" },
            { name: "زي موحد (قطعتان)", date: "2024-02-01", status: "received" },
            { name: "كتيب الموظف", date: "2024-01-15", status: "received" }
        ]
    },
    "1002": {
        name: "سارة علي",
        hrCode: "HR-1002",
        title: "أخصائي موارد بشرية",
        location: "الجيزة - فرع المهندسين",
        photo: "https://ui-avatars.com/api/?name=Sara+Ali&background=7c3aed&color=fff&size=200",
        annualLeave: 21,
        sickLeave: 3,
        remainingLeave: 18,
        events: [
            {
                event: 2001,
                eventDesc: "ورشة عمل إدارة الموارد البشرية",
                validFrom: "2024-02-05",
                validTo: "2024-02-07",
                confFlag: "X",
                confDate: "2024-02-03",
                confTime: "100000",
                terminalId: "TERM01",
                doneFlag: ""
            },
            {
                event: 2002,
                eventDesc: "اجتماع إعادة التنظيم",
                validFrom: "2024-03-01",
                validTo: "2024-03-01",
                confFlag: "",
                confDate: "",
                confTime: "",
                terminalId: "",
                doneFlag: ""
            }
        ],
        receivedItems: [
            { name: "لابتوب HP EliteBook", date: "2023-06-10", status: "received" },
            { name: "بطاقة دخول", date: "2023-06-10", status: "received" },
            { name: "شهادة خبرة", date: "2024-01-20", status: "pending" },
            { name: "كتيب الموظف", date: "2023-06-10", status: "received" }
        ]
    },
    "1003": {
        name: "محمد حسن",
        hrCode: "HR-1003",
        title: "محاسب أول",
        location: "القاهرة - المقر الرئيسي",
        photo: "https://ui-avatars.com/api/?name=Mohamed+Hassan&background=059669&color=fff&size=200",
        annualLeave: 21,
        sickLeave: 0,
        remainingLeave: 21,
        events: [],
        receivedItems: [
            { name: "لابتوب Lenovo ThinkPad", date: "2022-09-05", status: "received" },
            { name: "بطاقة دخول", date: "2022-09-05", status: "received" },
            { name: "شاشة إضافية 24 بوصة", date: "2023-03-12", status: "received" },
            { name: "ماوس لاسلكي", date: "2023-03-12", status: "received" },
            { name: "كتيب الموظف", date: "2022-09-05", status: "received" }
        ]
    },
    "4688": {
        name: "maria",
        hrCode: "000046",
        title: "IT",
        location: "HQ ",
        photo: "https://ui-avatars.com/api/?name=Bassem+Hamed&background=1d4ed8&color=fff&size=200",
        approver: "Mohamed ",
        annualLeave: 21,
        sickLeave: 0,
        remainingLeave: 21,
        events: [],
        annualLeave: 21,
        sickLeave: 0,
        remainingLeave: 21,
        receivedItems: [
            { name: "بطاقة دخول", date: "2024-01-01", status: "received" },
            { name: "لابتوب", date: "2024-01-01", status: "received" }
        ]
    }
};

const fallbackEvents = [
    {
        event: 9001,
        eventDesc: "برنامج تهيئة الموظفين",
        validFrom: "2026-04-20",
        validTo: "2026-04-22",
        confFlag: "X",
        confDate: "2026-04-19",
        confTime: "090000",
        terminalId: "TERM01",
        doneFlag: ""
    },
    {
        event: 9002,
        eventDesc: "جلسة تحديث السياسات",
        validFrom: "2026-04-25",
        validTo: "2026-04-25",
        confFlag: "",
        confDate: "",
        confTime: "",
        terminalId: "",
        doneFlag: ""
    }
];

function normalizeEmployeeId(value) {
    return String(value || '')
        .replace(/\D/g, '')
        .replace(/^0+/, '');
}

function findMockEmployeeByAnyId(employeeId) {
    const raw = String(employeeId || '').trim();
    const normalized = normalizeEmployeeId(raw);
    const padded = normalized ? normalized.padStart(8, '0') : '';

    if (mockEmployees[raw]) return mockEmployees[raw];
    if (mockEmployees[normalized]) return mockEmployees[normalized];
    if (mockEmployees[padded]) return mockEmployees[padded];

    const matchedByHrCode = Object.values(mockEmployees).find((employee) => {
        const hrCodeNormalized = normalizeEmployeeId(employee.hrCode);
        return hrCodeNormalized && hrCodeNormalized === normalized;
    });

    return matchedByHrCode || null;
}

const EVENT_STORE_KEY = 'kiosk-events-store';

function loadEventsStore() {
    try {
        const raw = localStorage.getItem(EVENT_STORE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function saveEventsStore(store) {
    try {
        localStorage.setItem(EVENT_STORE_KEY, JSON.stringify(store || {}));
    } catch (error) {
        // Ignore storage errors in kiosk mode.
    }
}

function getEmployeeIdForEvents(employee) {
    if (!employee) return '';
    return normalizeEmployeeId(employee.hrCode || employee.employeeId || employee.pernr || '');
}

function getEmployeeEvents(employee) {
    const id = getEmployeeIdForEvents(employee);
    const store = loadEventsStore();
    if (id && Array.isArray(store[id]) && store[id].length > 0) {
        return store[id].map((event) => ({ ...event }));
    }

    if (Array.isArray(employee?.events) && employee.events.length > 0) {
        return employee.events.map((event) => ({ ...event }));
    }

    const mock = findMockEmployeeByAnyId(id);
    if (Array.isArray(mock?.events) && mock.events.length > 0) {
        return mock.events.map((event) => ({ ...event }));
    }

    return fallbackEvents.map((event) => ({ ...event }));
}

function setEmployeeEvents(employee, events) {
    const safeEvents = Array.isArray(events) ? events.map((event) => ({ ...event })) : [];
    if (employee) {
        employee.events = safeEvents;
    }

    const id = getEmployeeIdForEvents(employee);
    if (id) {
        const store = loadEventsStore();
        store[id] = safeEvents;
        saveEventsStore(store);
    }

    const mock = findMockEmployeeByAnyId(id);
    if (mock) {
        mock.events = safeEvents.map((event) => ({ ...event }));
    }
}

// Current logged in employee
let currentEmployee = null;
let currentLanguage = 'ar';
let currentLeaveRecords = [];
let currentLeaveBundle = null;

// Auto-logout timer variables
let logoutTimer = null;
const AUTO_LOGOUT_SECONDS = 180;
let timerSeconds = AUTO_LOGOUT_SECONDS;
let timerInterval = null;

const translations = {
    ar: {
        pageTitle: 'TBTD — بوابة الموظفين',
        logoSub: 'بوابة الموظفين',
        status: 'النظام يعمل',
        waitingTitle: 'NEW KIOSK',
        waitingSubtitle: 'ضع إصبعك على الماسح الضوئي للوصول إلى معلوماتك',
        inputPlaceholder: 'الرقم الوظيفي',
        scanButton: 'قراءة البصمة من الجهاز',
        scanWaiting: 'جاري انتظار البصمة من الجهاز...',
        scanTimeout: 'لم يتم اكتشاف بصمة جديدة. حاول مرة أخرى.',
        scanFailed: 'تعذر قراءة البصمة من الجهاز.',
        timerPrefix: 'سيتم تسجيل الخروج تلقائياً خلال',
        timerSuffix: 'ثانية',
        verified: 'تم التحقق',
        logout: 'خروج',
        labelEmployeeId: 'الرقم الوظيفي',
        labelPosition: 'المسمى الوظيفي',
        labelOrgUnit: 'الإدارة / الوحدة',
        labelApprover: 'المدير المباشر',
        leaveHistoryTitle: 'سجل الإجازات',
        leaveLoading: 'جاري تحميل سجل الإجازات...',
        leaveNoData: 'لا توجد بيانات إجازات لهذا الموظف.',
        eventsTitle: 'الأحداث والتدريبات',
        eventsLoading: 'جاري تحميل الأحداث...',
        eventsNoData: 'لا توجد أحداث لهذا الموظف.',
        eventsLoadFailed: 'تعذر تحميل الأحداث.',
        eventsHdrEvent: 'الحدث',
        eventsHdrDescription: 'الوصف',
        eventsHdrFrom: 'من',
        eventsHdrTo: 'إلى',
        eventsHdrStatus: 'الحالة',
        eventsHdrConfirmed: 'تأكيد',
        eventsDone: 'مكتمل',
        eventsAccepted: 'مقبول',
        eventsPending: 'قيد الانتظار',
        eventsConfirm: 'تأكيد',
        eventsSave: 'حفظ التأكيدات',
        eventsSaveSuccess: 'تم حفظ التأكيدات بنجاح',
        eventsSaveFailed: 'تعذر حفظ التأكيدات',
        leaveLoadFailed: 'تعذر تحميل سجل الإجازات.',
        leaveHdrType: 'نوع الإجازة',
        leaveHdrTotal: 'الإجمالي',
        leaveHdrUsed: 'المستخدم',
        leaveHdrRemaining: 'المتبقي',
        leaveHdrStatus: 'الحالة',
        leaveHdrFrom: 'من',
        leaveHdrTo: 'إلى',
        leaveRequestsTitle: 'طلبات الموظف',
        leaveRequestedTotal: 'إجمالي الأيام المطلوبة',
        leaveTotalVacations: 'إجمالي رصيد الإجازات',
        leaveUsedVacations: 'المستنفذ من رصيد الإجازات',
        leaveRemainingVacations: 'المتبقي من رصيد الإجازات',
        leaveQuotaMissing: 'لا توجد بيانات رصيد إجازات (Entitle/Deduct/Rest) من SAP لهذا الموظف.',
        leaveAbsenceQuotaTitle: 'رصيد الإجازات',
        leaveHolidaysTitle: 'العطلات الرسمية',
        leaveTypesTitle: 'أنواع الإجازات',
        leaveLeavesTitle: 'طلبات الإجازة',
        leaveNewLeavesTitle: 'طلبات الإجازة الجديدة',
        leaveSubmitFailed: 'تعذر إرسال طلب الإجازة.',
        leaveRequiredFields: 'يرجى اختيار نوع الإجازة وإدخال التاريخ من وإلى.',
        sectionTitle: 'الخدمات المتاحة',
        futureSectionTitle: 'الخدمات القادمة',
        unavailable: 'غير متوفر',
        noPhotoInSap: 'لا توجد صورة في SAP',
        employeeNotFound: 'الرقم الوظيفي غير موجود.',
        successTitle: 'تم إرسال الطلب بنجاح',
        successMessageStart: 'تم تقديم طلب "',
        successMessageEnd: '" بنجاح وسيتم مراجعته من قبل المختص',
        acknowledge: 'تأكيد الاطلاع',
        received: 'تم الاستلام',
        pending: 'قيد الانتظار',
        actions: {
            'late-permission': 'اذن تأخير',
            'early-leave': 'اذن انصراف',
            'leave-request': 'طلبات',
            'leave-annual': 'إجازة سنوية',
            'leave-excuse-in': 'إذن دخول',
            'leave-excuse-out': 'إذن خروج',
            'leave-mission-in': 'مأمورية دخول',
            'leave-mission-out': 'مأمورية خروج',
            'leave-mission': 'مأمورية',
            'work-from-home': 'طلب عمل من المنزل',
            'review-report': 'تقرير مراجعة الطلبات',
            'mission-checkout': 'تسجيل خروج مأمورية',
            'full-day-mission': 'مأمورية يوم كامل',
            'mission-return': 'تسجيل عودة من مأمورية',
            'contract-renewal': 'تجديد عقد',
            'received-items': 'استلامات متعلقة'
        }
    },
    en: {
        pageTitle: 'TBTD — Employee Portal',
        logoSub: 'Employee Portal',
        status: 'System online',
        waitingTitle: 'NEW KIOSK',
        waitingSubtitle: 'Place your finger on the scanner to access your information',
        inputPlaceholder: 'Employee ID',
        scanButton: 'Read fingerprint from device',
        scanWaiting: 'Waiting for a new fingerprint scan from the device...',
        scanTimeout: 'No new fingerprint scan detected. Please try again.',
        scanFailed: 'Unable to read fingerprint from device.',
        timerPrefix: 'Automatic logout in',
        timerSuffix: 'seconds',
        verified: 'Verified',
        logout: 'Logout',
        labelEmployeeId: 'Employee ID',
        labelPosition: 'Position',
        labelOrgUnit: 'Org unit / department',
        labelApprover: 'Direct approver',
        leaveHistoryTitle: 'Leave history',
        leaveLoading: 'Loading leave history...',
        leaveNoData: 'No leave data found for this employee.',
        eventsTitle: 'Events and Training',
        eventsLoading: 'Loading events...',
        eventsNoData: 'No events found for this employee.',
        eventsLoadFailed: 'Unable to load events.',
        eventsHdrEvent: 'Event',
        eventsHdrDescription: 'Description',
        eventsHdrFrom: 'From',
        eventsHdrTo: 'To',
        eventsHdrStatus: 'Status',
        eventsHdrConfirmed: 'Confirmed',
        eventsDone: 'Done',
        eventsAccepted: 'Accepted',
        eventsPending: 'Pending',
        eventsConfirm: 'Confirm',
        eventsSave: 'Save confirmations',
        eventsSaveSuccess: 'Confirmations saved successfully',
        eventsSaveFailed: 'Unable to save confirmations',
        leaveLoadFailed: 'Unable to load leave history.',
        leaveHdrType: 'Leave type',
        leaveHdrTotal: 'Total',
        leaveHdrUsed: 'Used',
        leaveHdrRemaining: 'Remaining',
        leaveHdrStatus: 'Status',
        leaveHdrFrom: 'From',
        leaveHdrTo: 'To',
        leaveRequestsTitle: 'Employee requests',
        leaveRequestedTotal: 'Requested total days',
        leaveTotalVacations: 'Total vacation balance',
        leaveUsedVacations: 'Used vacation balance',
        leaveRemainingVacations: 'Remaining vacation balance',
        leaveQuotaMissing: 'No SAP quota data (Entitle/Deduct/Rest) was returned for this employee.',
        leaveAbsenceQuotaTitle: 'Absence quota',
        leaveHolidaysTitle: 'Holidays',
        leaveTypesTitle: 'Leave types',
        leaveLeavesTitle: 'Leaves',
        leaveNewLeavesTitle: 'New leaves',
        leaveSubmitFailed: 'Unable to submit leave request.',
        leaveRequiredFields: 'Please select leave type and both from/to dates.',
        sectionTitle: 'Available services',
        futureSectionTitle: 'Coming Soon',
        unavailable: 'Not available',
        noPhotoInSap: 'No photo in SAP',
        employeeNotFound: 'Employee ID was not found.',
        successTitle: 'Request submitted successfully',
        successMessageStart: 'Your request "',
        successMessageEnd: '" was submitted successfully and will be reviewed.',
        acknowledge: 'Acknowledge',
        received: 'Received',
        pending: 'Pending',
        actions: {
            'late-permission': 'Late permission',
            'early-leave': 'Early leave',
            'leave-request': 'Leave request',
            'leave-annual': 'Annual',
            'leave-excuse-in': 'Excuse In',
            'leave-excuse-out': 'Excuse Out',
            'leave-mission-in': 'Mission In',
            'leave-mission-out': 'Mission Out',
            'leave-mission': 'Mission',
            'work-from-home': 'Work from home',
            'review-report': 'Request review report',
            'mission-checkout': 'Mission checkout',
            'full-day-mission': 'Full day mission',
            'mission-return': 'Mission return',
            'contract-renewal': 'Contract renewal',
            'received-items': 'Received items'
        }
    }
};

// ============================================
// ACTION DEFINITIONS
// ============================================
const actions = {
    'late-permission': true,
    'early-leave': true,
    'leave-request': true,
    'leave-annual': true,
    'leave-excuse-in': true,
    'leave-excuse-out': true,
    'leave-mission-in': true,
    'leave-mission-out': true,
    'leave-mission': true,
    'work-from-home': true,
    'review-report': true,
    'mission-checkout': true,
    'full-day-mission': true,
    'mission-return': true,
    'contract-renewal': true,
    'received-items': true
};

const LEAVE_ACTION_CONFIG = {
    'leave-request': {
        fixedSubtype: '',
        requiresTime: true,
        singleDay: false,
        timeMode: 'both'
    },
    'leave-annual': {
        fixedSubtype: '0001',
        requiresTime: false,
        singleDay: false,
        timeMode: 'none'
    },
    'leave-excuse-in': {
        fixedSubtype: 'EXIN',
        requiresTime: true,
        singleDay: true,
        timeMode: 'start'
    },
    'leave-excuse-out': {
        fixedSubtype: 'EXOT',
        requiresTime: true,
        singleDay: true,
        timeMode: 'end'
    },
    'leave-mission-in': {
        fixedSubtype: 'MISN',
        requiresTime: true,
        singleDay: true,
        timeMode: 'both'
    },
    'leave-mission-out': {
        fixedSubtype: 'MISN',
        requiresTime: true,
        singleDay: true,
        timeMode: 'both'
    },
    'leave-mission': {
        fixedSubtype: 'MISN',
        requiresTime: true,
        singleDay: false,
        timeMode: 'both'
    }
};

function getLeaveActionConfig(actionKey) {
    return LEAVE_ACTION_CONFIG[actionKey] || LEAVE_ACTION_CONFIG['leave-request'];
}

function t(key) {
    return translations[currentLanguage][key];
}

function actionLabel(actionKey) {
    return translations[currentLanguage].actions[actionKey];
}

function formField(label, control) {
    return `
        <div class="form-group">
            <label class="form-label">${label}</label>
            ${control}
        </div>
    `;
}
 
function formRow(first, second) {
    return `
        <div class="form-row">
            <div class="form-group">${first}</div>
            <div class="form-group">${second}</div>
        </div>
    `;
}

function getLeaveTypeOptionsHtml() {
    const placeholder = currentLanguage === 'ar' ? 'اختر نوع الاجازة' : 'Select leave type';
    const combined = [
        ...(Array.isArray(currentLeaveBundle?.leaveTypes) ? currentLeaveBundle.leaveTypes : []),
        ...(Array.isArray(currentLeaveBundle?.newLeaves) ? currentLeaveBundle.newLeaves : [])
    ];

    const options = [];
    const seen = new Set();

    for (const row of combined) {
        const code = String(row?.Subty || '').trim();
        if (!code || seen.has(code)) continue;
        seen.add(code);

        const description = String(row?.Description || row?.SubtypeDescription || code).trim();
        options.push({ code, description });
    }

    if (!options.length) {
        options.push(
            { code: '0001', description: currentLanguage === 'ar' ? 'اجازة سنوية' : 'Annual leave' },
            { code: '0002', description: currentLanguage === 'ar' ? 'اجازة أمومة' : 'Maternity leave' },
            { code: '0003', description: currentLanguage === 'ar' ? 'اجازة حج' : 'Haj leave' },
            { code: '0004', description: currentLanguage === 'ar' ? 'اجازة عسكرية' : 'Military leave' },
            { code: '0005', description: currentLanguage === 'ar' ? 'اجازة عزاء' : 'Condolences leave' },
            { code: '0006', description: currentLanguage === 'ar' ? 'اجازة زواج' : 'Marriage leave' },
            { code: '0007', description: currentLanguage === 'ar' ? 'اجازة بدون مرتب' : 'Unpaid leave' }
        );
    }

    const optionLines = options
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((item) => `<option value="${escapeHtml(item.code)}">${escapeHtml(`${item.description} (${item.code})`)}</option>`)
        .join('');

    return `<option value="">${escapeHtml(placeholder)}</option>${optionLines}`;
}

function getLeaveTypeRecord(subtype) {
    const code = String(subtype || '').trim().toUpperCase();
    if (!code) return null;

    const combined = [
        ...(Array.isArray(currentLeaveBundle?.leaveTypes) ? currentLeaveBundle.leaveTypes : []),
        ...(Array.isArray(currentLeaveBundle?.newLeaves) ? currentLeaveBundle.newLeaves : [])
    ];

    return combined.find((row) => String(row?.Subty || '').trim().toUpperCase() === code) || null;
}

function isEventLeaveType(subtype) {
    return String(getLeaveTypeRecord(subtype)?.Type || '').trim().toLowerCase() === 'event';
}

function isLeaveRequestAction(actionKey) {
    return [
        'leave-request',
        'leave-annual',
        'leave-excuse-in',
        'leave-excuse-out',
        'leave-mission-in',
        'leave-mission-out',
        'leave-mission'
    ].includes(actionKey);
}

function isFixedLeaveSubtypeAction(actionKey) {
    return [
        'leave-annual',
        'leave-excuse-in',
        'leave-excuse-out',
        'leave-mission-in',
        'leave-mission-out',
        'leave-mission'
    ].includes(actionKey);
}

function calculateLeaveDeduction(fromDate, toDate, begti = '', endti = '') {
    const start = new Date(`${String(fromDate || '').trim()}T00:00:00`);
    const end = new Date(`${String(toDate || '').trim()}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return '';
    }

    const dayDiff = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000)) + 1;
    const hasTimeWindow = String(fromDate || '').trim() === String(toDate || '').trim() && begti && endti;

    if (hasTimeWindow) {
        const startDigits = String(begti).replace(/\D/g, '').padEnd(6, '0').slice(0, 6);
        const endDigits = String(endti).replace(/\D/g, '').padEnd(6, '0').slice(0, 6);
        const startMinutes = (Number(startDigits.slice(0, 2)) * 60) + Number(startDigits.slice(2, 4));
        const endMinutes = (Number(endDigits.slice(0, 2)) * 60) + Number(endDigits.slice(2, 4));
        const minutes = Math.max(0, endMinutes - startMinutes);

        if (minutes > 0) {
            return (minutes / (24 * 60)).toFixed(2);
        }
    }

    return Number(dayDiff).toFixed(2);
}

function autoSelectLeaveSubtype(actionKey) {
    const typeSelect = document.getElementById('f-type');
    if (!typeSelect) return;

    const keywordMap = {
        'leave-annual': ['annual', 'سنوي', 'سنوية'],
        'leave-excuse-in': ['excuse in', 'اذن دخول', 'دخول'],
        'leave-excuse-out': ['excuse out', 'اذن خروج', 'انصراف', 'خروج'],
        'leave-mission-in': ['mission in', 'مأمورية دخول', 'بداية مأمورية'],
        'leave-mission-out': ['mission out', 'مأمورية خروج', 'نهاية مأمورية', 'عودة من مأمورية'],
        'leave-mission': ['mission', 'مأمورية']
    };

    const keywords = keywordMap[actionKey];
    if (!keywords || !keywords.length) {
        updateLeaveTypeHelp(typeSelect.value || '');
        return;
    }

    const options = Array.from(typeSelect.options || []);
    const loweredKeywords = keywords.map((entry) => String(entry).toLowerCase());
    const matched = options.find((option) => {
        const text = String(option.textContent || option.innerText || '').toLowerCase();
        return loweredKeywords.some((keyword) => text.includes(keyword));
    });

    if (matched) {
        typeSelect.value = matched.value;
    }

    updateLeaveTypeHelp(typeSelect.value || '');
}

function lockLeaveSubtypeSelection(actionKey) {
    const typeSelect = document.getElementById('f-type');
    if (!typeSelect) return;

    const shouldLock = isFixedLeaveSubtypeAction(actionKey);
    typeSelect.disabled = shouldLock;
}

function updateLeaveTypeHelp(subtype) {
    const helper = document.getElementById('leave-type-helper');
    if (!helper) return;

    if (isEventLeaveType(subtype)) {
        helper.textContent = currentLanguage === 'ar'
            ? 'هذا النوع يحتاج وقت من وإلى.'
            : 'This type needs from/to time.';
        return;
    }

    helper.textContent = currentLanguage === 'ar'
        ? 'يمكن ترك الوقت الافتراضي.'
        : 'Time can stay at the default value.';
}

function renderLeaveRequestForm(actionKey, submitText) {
    const leaveConfig = getLeaveActionConfig(actionKey);
    const isFixedSubtype = Boolean(leaveConfig.fixedSubtype);

    const leaveTypeControl = isFixedSubtype
        ? `
            <input type="text" class="form-input" value="${escapeHtml(actionLabel(actionKey))}" readonly />
            <input type="hidden" id="f-type" value="${escapeHtml(leaveConfig.fixedSubtype)}" />
        `
        : `
            <select class="form-select" id="f-type" onchange="updateLeaveTypeHelp(this.value)">
                ${getLeaveTypeOptionsHtml()}
            </select>
        `;

    const dateFieldsHtml = leaveConfig.singleDay
        ? `${formField(currentLanguage === 'ar' ? 'التاريخ' : 'Date', '<input type="date" class="form-input" id="f-from" />')}<input type="hidden" id="f-to" />`
        : `
            <div class="form-row form-row-spacious">
                ${formField(currentLanguage === 'ar' ? 'من تاريخ' : 'From date', '<input type="date" class="form-input" id="f-from" />')}
                ${formField(currentLanguage === 'ar' ? 'إلى تاريخ' : 'To date', '<input type="date" class="form-input" id="f-to" />')}
            </div>
        `;

    const timeMode = leaveConfig.timeMode || (leaveConfig.requiresTime ? 'both' : 'none');
    const timeFieldsHtml = !leaveConfig.requiresTime
        ? ''
        : (timeMode === 'start'
            ? `
                ${formField(currentLanguage === 'ar' ? 'وقت الدخول' : 'Entry time', '<input type="time" class="form-input" id="f-begti" />')}
                <input type="hidden" id="f-endti" value="" />
                <div class="form-helper" id="leave-type-helper">${currentLanguage === 'ar' ? 'يرجى إدخال وقت الدخول.' : 'Please enter entry time.'}</div>
            `
            : (timeMode === 'end'
                ? `
                    ${formField(currentLanguage === 'ar' ? 'وقت الخروج' : 'Exit time', '<input type="time" class="form-input" id="f-endti" />')}
                    <input type="hidden" id="f-begti" value="" />
                    <div class="form-helper" id="leave-type-helper">${currentLanguage === 'ar' ? 'يرجى إدخال وقت الخروج.' : 'Please enter exit time.'}</div>
                `
                : `
                    <div class="form-row form-row-spacious">
                        ${formField(currentLanguage === 'ar' ? 'من وقت' : 'From time', '<input type="time" class="form-input" id="f-begti" />')}
                        ${formField(currentLanguage === 'ar' ? 'إلى وقت' : 'To time', '<input type="time" class="form-input" id="f-endti" />')}
                    </div>
                    <div class="form-helper" id="leave-type-helper">
                        ${currentLanguage === 'ar'
                            ? 'يرجى إدخال الوقت من وإلى لهذا النوع.'
                            : 'Please enter from/to time for this type.'}
                    </div>
                `));

    return `
        <div class="leave-request-form">
            ${formField(currentLanguage === 'ar' ? 'نوع الاجازة' : 'Leave type', leaveTypeControl)}
            ${dateFieldsHtml}
            ${timeFieldsHtml}
            ${formField(currentLanguage === 'ar' ? 'ملاحظات' : 'Notes', `<textarea class="form-textarea form-textarea-large" id="f-notes" placeholder="${currentLanguage === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}"></textarea>`)}
            <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
        </div>
    `;
}

function renderActionForm(actionKey) {
    const submitText = currentLanguage === 'ar' ? 'إرسال الطلب' : 'Submit request';
    const showReportText = currentLanguage === 'ar' ? 'عرض التقرير' : 'Show report';
    const checkoutText = currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Check out';
    const returnText = currentLanguage === 'ar' ? 'تسجيل العودة' : 'Record return';

    switch (actionKey) {
        case 'late-permission':
            return `
                ${formField(currentLanguage === 'ar' ? 'تاريخ التأخير' : 'Late date', '<input type="date" class="form-input" id="f-date" />')}
                ${formField(currentLanguage === 'ar' ? 'وقت الوصول الفعلي' : 'Actual arrival time', '<input type="time" class="form-input" id="f-time" />')}
                ${formField(currentLanguage === 'ar' ? 'سبب التأخير' : 'Reason for delay', `<textarea class="form-textarea" id="f-reason" placeholder="${currentLanguage === 'ar' ? 'اكتب سبب التأخير...' : 'Write the reason for delay...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
            `;
        case 'leave-request':
        case 'leave-annual':
        case 'leave-excuse-in':
        case 'leave-excuse-out':
        case 'leave-mission-in':
        case 'leave-mission-out':
        case 'leave-mission':
            return renderLeaveRequestForm(actionKey, submitText);
        case 'work-from-home':
            return `
                <div class="form-row">
                    ${formField(currentLanguage === 'ar' ? 'من تاريخ' : 'From date', '<input type="date" class="form-input" id="f-from" />')}
                    ${formField(currentLanguage === 'ar' ? 'إلى تاريخ' : 'To date', '<input type="date" class="form-input" id="f-to" />')}
                </div>
                ${formField(currentLanguage === 'ar' ? 'المهام المخطط إنجازها' : 'Planned tasks', `<textarea class="form-textarea" id="f-tasks" placeholder="${currentLanguage === 'ar' ? 'اكتب المهام المخططة...' : 'Write the planned tasks...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
            `;
        case 'review-report':
            return `
                ${formField(currentLanguage === 'ar' ? 'الفترة الزمنية' : 'Time period', `
                    <select class="form-select" id="f-period">
                        <option value="month">${currentLanguage === 'ar' ? 'الشهر الحالي' : 'Current month'}</option>
                        <option value="quarter">${currentLanguage === 'ar' ? 'الربع الحالي' : 'Current quarter'}</option>
                        <option value="year">${currentLanguage === 'ar' ? 'السنة الحالية' : 'Current year'}</option>
                        <option value="custom">${currentLanguage === 'ar' ? 'فترة مخصصة' : 'Custom period'}</option>
                    </select>
                `)}
                ${formField(currentLanguage === 'ar' ? 'نوع الطلبات' : 'Request type', `
                    <select class="form-select" id="f-type">
                        <option value="all">${currentLanguage === 'ar' ? 'جميع الطلبات' : 'All requests'}</option>
                        <option value="approved">${currentLanguage === 'ar' ? 'الطلبات الموافق عليها' : 'Approved requests'}</option>
                        <option value="pending">${currentLanguage === 'ar' ? 'الطلبات المعلقة' : 'Pending requests'}</option>
                        <option value="rejected">${currentLanguage === 'ar' ? 'الطلبات المرفوضة' : 'Rejected requests'}</option>
                    </select>
                `)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${showReportText}</button>
            `;
        case 'mission-checkout':
            return `
                ${formField(currentLanguage === 'ar' ? 'وجهة المأمورية' : 'Mission destination', `<input type="text" class="form-input" id="f-destination" placeholder="${currentLanguage === 'ar' ? 'أدخل وجهة المأمورية' : 'Enter mission destination'}" />`)}
                ${formField(currentLanguage === 'ar' ? 'وقت الخروج' : 'Checkout time', '<input type="time" class="form-input" id="f-time" />')}
                ${formField(currentLanguage === 'ar' ? 'الغرض من المأمورية' : 'Mission purpose', `<textarea class="form-textarea" id="f-purpose" placeholder="${currentLanguage === 'ar' ? 'اكتب غرض المأمورية...' : 'Write the mission purpose...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${checkoutText}</button>
            `;
        case 'full-day-mission':
            return `
                ${formField(currentLanguage === 'ar' ? 'تاريخ المأمورية' : 'Mission date', '<input type="date" class="form-input" id="f-date" />')}
                ${formField(currentLanguage === 'ar' ? 'وجهة المأمورية' : 'Mission destination', `<input type="text" class="form-input" id="f-destination" placeholder="${currentLanguage === 'ar' ? 'أدخل وجهة المأمورية' : 'Enter mission destination'}" />`)}
                ${formField(currentLanguage === 'ar' ? 'الغرض من المأمورية' : 'Mission purpose', `<textarea class="form-textarea" id="f-purpose" placeholder="${currentLanguage === 'ar' ? 'اكتب غرض المأمورية...' : 'Write the mission purpose...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
            `;
        case 'mission-return':
            return `
                ${formField(currentLanguage === 'ar' ? 'وقت العودة' : 'Return time', '<input type="time" class="form-input" id="f-time" />')}
                ${formField(currentLanguage === 'ar' ? 'ملاحظات المأمورية' : 'Mission notes', `<textarea class="form-textarea" id="f-notes" placeholder="${currentLanguage === 'ar' ? 'ملاحظات أو نتائج المأمورية...' : 'Mission notes or results...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${returnText}</button>
            `;
        case 'contract-renewal':
            return `
                ${formField(currentLanguage === 'ar' ? 'نوع العقد' : 'Contract type', `
                    <select class="form-select" id="f-type">
                        <option value="">${currentLanguage === 'ar' ? 'اختر نوع العقد' : 'Select contract type'}</option>
                        <option value="permanent">${currentLanguage === 'ar' ? 'عقد دائم' : 'Permanent contract'}</option>
                        <option value="fixed-term">${currentLanguage === 'ar' ? 'عقد محدد المدة' : 'Fixed-term contract'}</option>
                        <option value="temporary">${currentLanguage === 'ar' ? 'عقد مؤقت' : 'Temporary contract'}</option>
                        <option value="part-time">${currentLanguage === 'ar' ? 'عقد دوام جزئي' : 'Part-time contract'}</option>
                    </select>
                `)}
                <div class="form-row">
                    ${formField(currentLanguage === 'ar' ? 'تاريخ البداية' : 'Start date', '<input type="date" class="form-input" id="f-start" />')}
                    ${formField(currentLanguage === 'ar' ? 'تاريخ النهاية' : 'End date', '<input type="date" class="form-input" id="f-end" />')}
                </div>
                ${formField(currentLanguage === 'ar' ? 'ملاحظات' : 'Notes', `<textarea class="form-textarea" id="f-notes" placeholder="${currentLanguage === 'ar' ? 'أي ملاحظات أو شروط خاصة...' : 'Any notes or special conditions...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
            `;
        default:
            return '';
    }
}

function applyTranslations() {
    const dictionary = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.title = dictionary.pageTitle;

    document.getElementById('logo-sub').textContent = dictionary.logoSub;
    document.getElementById('status-text').textContent = dictionary.status;
    document.getElementById('waiting-title').textContent = dictionary.waitingTitle;
    document.getElementById('waiting-subtitle').textContent = dictionary.waitingSubtitle;
    document.getElementById('emp-id-input').placeholder = dictionary.inputPlaceholder;
    document.getElementById('device-scan-btn-text').textContent = dictionary.scanButton;
    document.getElementById('timer-prefix').textContent = dictionary.timerPrefix;
    document.getElementById('timer-suffix').textContent = dictionary.timerSuffix;
    document.getElementById('verified-text').textContent = dictionary.verified;
    document.getElementById('logout-text').textContent = dictionary.logout;
    document.getElementById('label-employee-id').textContent = dictionary.labelEmployeeId;
    document.getElementById('label-position').textContent = dictionary.labelPosition;
    document.getElementById('label-org-unit').textContent = dictionary.labelOrgUnit;
    document.getElementById('label-approver').textContent = dictionary.labelApprover;
    document.getElementById('leave-history-title').textContent = dictionary.leaveHistoryTitle;
    document.getElementById('events-title').textContent = dictionary.eventsTitle;
    document.getElementById('section-title').textContent = dictionary.sectionTitle;
    const futureSectionTitle = document.getElementById('future-section-title');
    if (futureSectionTitle) {
        futureSectionTitle.textContent = dictionary.futureSectionTitle;
    }

    Object.keys(dictionary.actions).forEach((actionKey) => {
        const target = document.getElementById(`action-${actionKey}`);
        if (target) {
            target.textContent = dictionary.actions[actionKey];
        }
    });

    document.getElementById('lang-ar').classList.toggle('active', currentLanguage === 'ar');
    document.getElementById('lang-en').classList.toggle('active', currentLanguage === 'en');

    renderLeaveHistory(currentLeaveRecords);

    if (currentEmployee) {
        displayEmployee(currentEmployee, false);
        fetchAndDisplayEvents();
    }
}

function setLanguage(language) {
    currentLanguage = language;
    applyTranslations();
}

// ============================================
// FETCH EMPLOYEE
// ============================================
async function fetchEmployee() {
    const empId = document.getElementById('emp-id-input').value.trim();
    if (!empId) return;

    document.getElementById('loading').classList.remove('hidden');

    try {
        const response = await fetch(`/api/employee/${encodeURIComponent(empId)}`);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || `API returned ${response.status}`);
        }

        let employee = await response.json();
        
        currentEmployee = employee;
        displayEmployee(employee);
    } catch (apiError) {
        // Fallback to mock data when SAP is unavailable
        const mock = findMockEmployeeByAnyId(empId);
        if (mock) {
            currentEmployee = mock;
            displayEmployee(mock);
        } else {
            showError(t('employeeNotFound'));
        }
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

async function fetchEmployeeFromDevice() {
    const scanButton = document.getElementById('device-scan-btn');
    const previousText = document.getElementById('device-scan-btn-text').textContent;

    scanButton.disabled = true;
    document.getElementById('device-scan-btn-text').textContent = t('scanWaiting');
    document.getElementById('loading').classList.remove('hidden');

    try {
        const response = await fetch('/api/employee/from-device?timeoutMs=45000');
        let payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(t('scanTimeout'));
            }
            throw new Error(payload.error || t('scanFailed'));
        }

        currentEmployee = payload;
        document.getElementById('emp-id-input').value = payload.hrCode || '';
        displayEmployee(payload);
    } catch (error) {
        showError(error.message || t('scanFailed'));
    } finally {
        document.getElementById('loading').classList.add('hidden');
        scanButton.disabled = false;
        document.getElementById('device-scan-btn-text').textContent = previousText;
    }
}

// ============================================
// DISPLAY EMPLOYEE
// ============================================
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderGenericLeaveSection(title, rows) {
    const safeRows = Array.isArray(rows) ? rows : [];
    if (!safeRows.length) {
        return `
            <div class="leave-subsection">
                <div class="leave-subsection-title">${escapeHtml(title)}</div>
                <div class="leave-history-message">${t('leaveNoData')}</div>
            </div>
        `;
    }

    const first = safeRows[0] || {};
    const keys = Object.keys(first)
        .filter((key) => key !== '__metadata' && key !== 'raw')
        .slice(0, 6);

    if (!keys.length) {
        return `
            <div class="leave-subsection">
                <div class="leave-subsection-title">${escapeHtml(title)}</div>
                <div class="leave-history-message">${t('leaveNoData')}</div>
            </div>
        `;
    }

    const headerHtml = keys.map((key) => `<th>${escapeHtml(key)}</th>`).join('');
    const bodyHtml = safeRows.slice(0, 20).map((row) => {
        const cells = keys.map((key) => `<td>${escapeHtml(row?.[key] ?? '-')}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `
        <div class="leave-subsection">
            <div class="leave-subsection-title">${escapeHtml(title)}</div>
            <table class="leave-history-table">
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </div>
    `;
}

function getRequestedTotal(bundle, records) {
    if (bundle && Number.isFinite(Number(bundle.requestedTotal))) {
        return Number(bundle.requestedTotal);
    }

    const safeRecords = Array.isArray(records) ? records : [];
    return safeRecords.reduce((sum, row) => sum + (Number(row.usedDays) || 0), 0);
}

function getVacationSummary(bundle) {
    const total = bundle && Number.isFinite(Number(bundle.totalVacations)) ? Number(bundle.totalVacations) : 0;
    const used = bundle && Number.isFinite(Number(bundle.usedVacations)) ? Number(bundle.usedVacations) : 0;
    const remaining = bundle && Number.isFinite(Number(bundle.remainingVacations)) ? Number(bundle.remainingVacations) : 0;
    return { total, used, remaining };
}

function renderLeaveHistory(records, bundle = currentLeaveBundle) {
    const content = document.getElementById('leave-history-content');
    if (!content) return;

    const safeRecords = Array.isArray(records) ? records : [];
    const requestedTotal = getRequestedTotal(bundle, safeRecords);
    const vacationSummary = getVacationSummary(bundle);
    const hasQuotaRows = bundle && Array.isArray(bundle.absenceQuota) && bundle.absenceQuota.length > 0;
    const overviewTitleHtml = `<div class="leave-subsection-title">${t('leaveRequestsTitle')}</div>`;
    const overviewHtml = safeRecords.length
        ? `
        
            ${overviewTitleHtml}
            <table class="leave-history-table">
                <thead>
                    <tr>
                        <th>${t('leaveHdrType')}</th>
                        <th>${t('leaveHdrStatus')}</th>
                        <th>${t('leaveHdrFrom')}</th>
                        <th>${t('leaveHdrTo')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${safeRecords.map((record) => `
                        <tr>
                            <td>${escapeHtml(record.leaveType || '-')}</td>
                            <td>${escapeHtml(record.status || '-')}</td>
                            <td>${escapeHtml(record.fromDate || '-')}</td>
                            <td>${escapeHtml(record.toDate || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        : `${overviewTitleHtml}<div class="leave-history-message">${t('leaveNoData')}</div>`;

    const extraSections = '';

    content.innerHTML = `
        <div class="leave-summary-row">
            <div class="leave-summary-badge">${t('leaveTotalVacations')}: <strong>${escapeHtml(vacationSummary.total.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveUsedVacations')}: <strong>${escapeHtml(vacationSummary.used.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveRemainingVacations')}: <strong>${escapeHtml(vacationSummary.remaining.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveRequestedTotal')}: <strong>${escapeHtml(requestedTotal.toFixed(2))}</strong></div>
        </div>
        ${hasQuotaRows ? '' : `<div class="leave-history-message">${t('leaveQuotaMissing')}</div>`}
        ${overviewHtml}
        ${extraSections}
    `;
}

async function loadLeaveHistory(employeeId) {
    const content = document.getElementById('leave-history-content');
    if (!content) return;

    content.innerHTML = `<div class="leave-history-message">${t('leaveLoading')}</div>`;

    try {
        const response = await fetch(`/api/kiosk3/overview/${encodeURIComponent(employeeId)}`);
        if (!response.ok) {
            throw new Error(`Leave API returned ${response.status}`);
        }

        const payload = await response.json();
        currentLeaveBundle = payload;
        currentLeaveRecords = Array.isArray(payload.leaveOverview)
            ? payload.leaveOverview
            : (Array.isArray(payload.records) ? payload.records : []);
        renderLeaveHistory(currentLeaveRecords, currentLeaveBundle);
    } catch (error) {
        currentLeaveRecords = [];
        currentLeaveBundle = null;
        content.innerHTML = `<div class="leave-history-message">${t('leaveLoadFailed')}</div>`;
    }
}

function displayEmployee(employee, shouldLoadLeaveHistory = true) {
    const safeName = employee.name || t('unavailable');
    const safeId = employee.hrCode || '-';
    const safeTitle = employee.title || t('unavailable');
    const safeLocation = employee.location || t('unavailable');
    const safeApprover = employee.approver || t('unavailable');
    const fallbackPhoto = 'https://ui-avatars.com/api/?name=Employee&background=1d4ed8&color=fff&size=512';
    const photoSource = employee.photo || (employee.hrCode ? `/api/employee/${encodeURIComponent(employee.hrCode)}/photo` : '');
    const safePhoto = photoSource ? `${photoSource}${photoSource.includes('?') ? '&' : '?'}v=${Date.now()}` : fallbackPhoto;

    // Set profile data
    console.log('[DEBUG] displayEmployee - setting photo URL:', safePhoto);
    document.getElementById('emp-photo').src = safePhoto;
    document.getElementById('emp-photo').onerror = () => console.error('[DEBUG] Photo failed to load:', safePhoto);
    document.getElementById('emp-photo').onload = () => console.log('[DEBUG] Photo loaded successfully:', safePhoto);
    document.getElementById('emp-name').textContent = safeName;
    document.getElementById('emp-hr-code').textContent = safeId;
    document.getElementById('emp-title').textContent = safeTitle;
    document.getElementById('emp-location').textContent = safeLocation;
    document.getElementById('emp-approver').textContent = safeApprover;
    document.getElementById('photo-status').textContent = employee.hasPhoto === false ? t('noPhotoInSap') : '';

    // Switch screens
    document.getElementById('waiting-screen').classList.add('hidden');
    document.getElementById('data-screen').classList.remove('hidden');

    // Start auto-logout timer
    startLogoutTimer();

    if (shouldLoadLeaveHistory) {
        const leaveLookupId = String(employee.hrCode || '').trim();
        if (leaveLookupId) {
            loadLeaveHistory(leaveLookupId);
            fetchAndDisplayEvents(); // Load events
        } else {
            currentLeaveRecords = [];
            currentLeaveBundle = null;
            renderLeaveHistory(currentLeaveRecords, currentLeaveBundle);
        }
    }
}

// ============================================
// HANDLE ACTION BUTTON CLICK
// ============================================
function handleAction(actionKey) {
    resetLogoutTimer(); // Reset timer on any activity

    const action = actions[actionKey];
    if (!action) return;

    document.getElementById('modal-title').textContent = actionLabel(actionKey);

    // Special handling for received-items
    if (actionKey === 'received-items') {
        const items = currentEmployee.receivedItems || [];
        const itemsHtml = items.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-status ${item.status === 'received' ? 'status-received' : 'status-pending'}">
                        ${item.status === 'received' ? t('received') : t('pending')}
                    </span>
                </div>
                <div class="item-details">
                    <span class="item-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${item.date}
                    </span>
                </div>
            </div>
        `).join('');

        document.getElementById('modal-body').innerHTML = `
            <div class="items-list">
                ${itemsHtml}
            </div>
            <button class="submit-btn" onclick="submitAction('${actionKey}')">${t('acknowledge')}</button>
        `;
    } else {
        document.getElementById('modal-body').innerHTML = renderActionForm(actionKey);

        // Set today's date as default for date inputs
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.form-input[type="date"]').forEach(el => {
            if (!el.value) el.value = today;
        });

        if (isLeaveRequestAction(actionKey)) {
            autoSelectLeaveSubtype(actionKey);
            lockLeaveSubtypeSelection(actionKey);
        }
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}

// ============================================
// SUBMIT ACTION
// ============================================
async function submitAction(actionName) {
    if (isLeaveRequestAction(actionName)) {
        await submitLeaveRequest(actionName);
        return;
    }

    // Show success message
    document.getElementById('modal-body').innerHTML = `
        <div class="success-msg">
            <div class="success-icon">✅</div>
            <h4>${t('successTitle')}</h4>
            <p>${t('successMessageStart')}${actionLabel(actionName)}${t('successMessageEnd')}</p>
        </div>
    `;
    setTimeout(() => closeModal(), 2500);
}

async function submitLeaveRequest(actionName = 'leave-request') {
    const leaveConfig = getLeaveActionConfig(actionName);
    const timeMode = leaveConfig.timeMode || (leaveConfig.requiresTime ? 'both' : 'none');
    const selectedSubtype = document.getElementById('f-type')?.value?.trim();
    const subty = (leaveConfig.fixedSubtype || selectedSubtype || '').trim();
    const fromDate = document.getElementById('f-from')?.value?.trim();
    const explicitToDate = document.getElementById('f-to')?.value?.trim();
    const toDate = leaveConfig.singleDay ? fromDate : explicitToDate;
    const begtiInput = document.getElementById('f-begti')?.value?.trim() || '';
    const endtiInput = document.getElementById('f-endti')?.value?.trim() || '';
    const begti = leaveConfig.requiresTime ? begtiInput : '';
    const endti = leaveConfig.requiresTime ? endtiInput : '';
    const note = document.getElementById('f-notes')?.value?.trim() || '';
    const employeeId = String(currentEmployee?.hrCode || '').trim();
    const employeeName = String(currentEmployee?.name || '').trim();
    const approver = String(currentEmployee?.approver || '').trim();
    const normalizedBegti = timeMode === 'end' ? (endti || begti) : begti;
    const normalizedEndti = timeMode === 'start' ? (begti || endti) : endti;
    const requestedDays = calculateLeaveDeduction(fromDate, toDate, normalizedBegti, normalizedEndti);
    const hasRequiredTime = !leaveConfig.requiresTime
        || (timeMode === 'start' && Boolean(normalizedBegti))
        || (timeMode === 'end' && Boolean(normalizedEndti))
        || (timeMode === 'both' && Boolean(normalizedBegti && normalizedEndti));

    if (!employeeId || !subty || !fromDate || !toDate || !hasRequiredTime) {
        showError(t('leaveRequiredFields'));
        return;
    }

    document.getElementById('loading').classList.remove('hidden');

    try {
        const response = await fetch('/api/leave-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId,
                subty,
                begda: fromDate,
                endda: toDate,
                begti: normalizedBegti,
                endti: normalizedEndti,
                note,
                deduction: requestedDays,
                employeeName,
                approver,
                leaveAction: actionName
            })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false || payload.status === 1) {
            const message = payload.error || payload.hint || t('leaveSubmitFailed');
            throw new Error(message);
        }

        const deduction = payload.deduction ? `<p>${escapeHtml(payload.deduction)}</p>` : '';
        document.getElementById('modal-body').innerHTML = `
            <div class="success-msg">
                <div class="success-icon">✅</div>
                <h4>${t('successTitle')}</h4>
                <p>${t('successMessageStart')}${actionLabel(actionName)}${t('successMessageEnd')}</p>
                ${deduction}
            </div>
        `;

        setTimeout(() => {
            closeModal();
            if (employeeId) {
                loadLeaveHistory(employeeId);
            }
        }, 2500);
    } catch (error) {
        showError(error.message || t('leaveSubmitFailed'));
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

// ============================================
// MODAL CONTROLS
// ============================================
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    resetLogoutTimer(); // Reset timer when closing modal
}

// ============================================
// GO BACK
// ============================================
function goBack() {
    stopLogoutTimer(); // Stop timer when logging out
    document.getElementById('waiting-screen').classList.remove('hidden');
    document.getElementById('data-screen').classList.add('hidden');
    document.getElementById('emp-id-input').value = '';
    currentLeaveRecords = [];
    currentLeaveBundle = null;
    currentEvents = [];
    renderLeaveHistory(currentLeaveRecords, currentLeaveBundle);
    currentEmployee = null;
}

// ============================================
// ERROR DISPLAY
// ============================================
function showError(msg) {
    const input = document.getElementById('emp-id-input');
    input.style.color = '#ef4444';
    input.placeholder = msg;
    input.value = '';
    setTimeout(() => {
        input.style.color = '';
        input.placeholder = t('inputPlaceholder');
    }, 3000);
}

// ============================================
// AUTO-LOGOUT TIMER FUNCTIONS
// ============================================
function startLogoutTimer() {
    timerSeconds = AUTO_LOGOUT_SECONDS;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            stopLogoutTimer();
            goBack();
        }
    }, 1000);
}

function stopLogoutTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetLogoutTimer() {
    if (timerInterval) {
        stopLogoutTimer();
        startLogoutTimer();
    }
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer-seconds');
    const timerBar = document.getElementById('timer-bar');
    
    if (timerElement) {
        timerElement.textContent = timerSeconds;
    }
    
    if (timerBar) {
        const percentage = (timerSeconds / AUTO_LOGOUT_SECONDS) * 100;
        timerBar.style.width = percentage + '%';
    }
}

// ============================================
// ACTIVITY LISTENERS (Reset timer on interaction)
// ============================================
document.addEventListener('click', () => {
    if (!document.getElementById('data-screen').classList.contains('hidden')) {
        resetLogoutTimer();
    }
});

document.addEventListener('keydown', () => {
    if (!document.getElementById('data-screen').classList.contains('hidden')) {
        resetLogoutTimer();
    }
});

// Enter key
document.getElementById('emp-id-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') fetchEmployee();
});

// ============================================
// EMPLOYEE EVENTS FUNCTIONS
// ============================================

// Store current events data
let currentEvents = [];

async function fetchAndDisplayEvents() {
    if (!currentEmployee) {
        return;
    }

    const eventsContainer = document.getElementById('events-content');
    if (!eventsContainer) return;

    try {
        eventsContainer.innerHTML = `<div class="loading">${t('eventsLoading')}</div>`;

        const employeeId = currentEmployee.hrCode || currentEmployee.employeeId || currentEmployee.pernr || '';
        const response = await fetch(`/api/events/${encodeURIComponent(employeeId)}`);
        if (!response.ok) {
            throw new Error(`Events API returned ${response.status}`);
        }

        const payload = await response.json();
        const sourceRows = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload.events) ? payload.events : []);

        currentEvents = sourceRows.map((row) => ({
                pernr: row.pernr || row.PERNR || employeeId,
                event: row.event || row.EVENT,
                eventDesc: row.eventDesc || row.EVENT_DESC || row.EventDesc || '',
                validFrom: row.validFrom || row.VALID_FROM || row.Begda || '',
                validTo: row.validTo || row.VALID_TO || row.Endda || '',
                confFlag: row.confFlag || row.CONF_FLAG || '',
                confDate: row.confDate || row.CONF_DATE || '',
                confTime: row.confTime || row.CONF_TIME || '',
                terminalId: row.terminalId || row.TERMINAL_ID || '',
                doneFlag: row.doneFlag || row.DONE_FLAG || ''
            }));

        if (currentEvents.length === 0) {
            eventsContainer.innerHTML = `<div class="no-data">${t('eventsNoData')}</div>`;
            return;
        }

        // Build events table
        let html = '<table class="events-table"><thead><tr>';
        html += `<th>${t('eventsHdrEvent')}</th>`;
        html += `<th>${t('eventsHdrDescription')}</th>`;
        html += `<th>${t('eventsHdrFrom')}</th>`;
        html += `<th>${t('eventsHdrTo')}</th>`;
        html += `<th>${t('eventsHdrStatus')}</th>`;
        html += `<th>${t('eventsHdrConfirmed')}</th>`;
        html += '</tr></thead><tbody>';

        currentEvents.forEach((event, index) => {
            const statusClass = getEventStatusClass(event);
            const statusText = getEventStatusText(event);
            const canConfirm = event.confFlag === 'X' && event.doneFlag !== 'X';
            const isChecked = event.doneFlag === 'X' ? 'checked' : '';

            html += `<tr class="event-row ${statusClass}">`;
            html += `<td>${event.event || 'N/A'}</td>`;
            html += `<td>${event.eventDesc || 'N/A'}</td>`;
            html += `<td>${formatDate(event.validFrom)}</td>`;
            html += `<td>${formatDate(event.validTo)}</td>`;
            html += `<td><span class="status-badge ${statusClass}">${statusText}</span></td>`;
            html += `<td><input type="checkbox" class="event-checkbox" data-index="${index}" ${isChecked} ${canConfirm ? '' : 'disabled'} /></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += `<button class="btn-save-events" onclick="saveEventConfirmations()">${t('eventsSave')}</button>`;

        eventsContainer.innerHTML = html;

        // Add event listeners to checkboxes
        document.querySelectorAll('.event-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const index = this.dataset.index;
                // Can be used for real-time validation if needed
            });
        });
    } catch (error) {
        console.error('Error displaying events:', error);
        eventsContainer.innerHTML = `<div class="error">${t('eventsLoadFailed')}</div>`;
    }
}

function getEventStatusClass(event) {
    if (event.doneFlag === 'X') return 'status-done';
    if (event.confFlag === 'X') return 'status-accepted';
    return 'status-pending';
}

function getEventStatusText(event) {
    if (event.doneFlag === 'X') return t('eventsDone');
    if (event.confFlag === 'X') return t('eventsAccepted');
    return t('eventsPending');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US');
    } catch (e) {
        return dateString;
    }
}

function saveEventConfirmations() {
    const checkboxes = document.querySelectorAll('.event-checkbox:checked:not(:disabled)');
    if (checkboxes.length === 0) {
        alert(currentLanguage === 'ar' ? 'اختاري حدثاً واحداً على الأقل للتأكيد' : 'Select at least one event to confirm');
        return;
    }

    saveEventConfirmationsAsync(Array.from(checkboxes));
}

async function saveEventConfirmationsAsync(checkboxes) {
    try {
        const updates = checkboxes
            .map((checkbox) => {
                const index = parseInt(checkbox.dataset.index, 10);
                return currentEvents[index] || null;
            })
            .filter(Boolean)
            .map((event) => ({
                pernr: event.pernr || currentEmployee.hrCode || currentEmployee.employeeId || '',
                event: event.event,
                validFrom: event.validFrom,
                validTo: event.validTo,
                doneFlag: 'X'
            }));

        if (!updates.length) {
            alert(t('eventsSaveFailed'));
            return;
        }

        const responses = await Promise.all(updates.map((payload) =>
            fetch('/api/events/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(async (response) => {
                const body = await response.json().catch(() => ({}));
                if (!response.ok || body.ok === false) {
                    throw new Error(body.error || `Save failed with status ${response.status}`);
                }
                return body;
            })
        ));

        if (!responses.length) {
            throw new Error('No confirmation response');
        }

        alert(t('eventsSaveSuccess'));
        await fetchAndDisplayEvents();
    } catch (error) {
        console.error('Error saving confirmations:', error);
        alert(t('eventsSaveFailed'));
    }
}

applyTranslations();
