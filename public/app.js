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
        receivedItems: [
            { name: "بطاقة دخول", date: "2024-01-01", status: "received" },
            { name: "لابتوب", date: "2024-01-01", status: "received" }
        ]
    }
};

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
        leaveUsedVacations: 'المستخدم من رصيد الإجازات',
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
            'leave-request': 'طلب اجازة',
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
    'work-from-home': true,
    'review-report': true,
    'mission-checkout': true,
    'full-day-mission': true,
    'mission-return': true,
    'contract-renewal': true,
    'received-items': true
};

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
        case 'early-leave':
            return `
                ${formField(currentLanguage === 'ar' ? 'تاريخ الانصراف' : 'Leave date', '<input type="date" class="form-input" id="f-date" />')}
                ${formField(currentLanguage === 'ar' ? 'وقت الانصراف المطلوب' : 'Requested leave time', '<input type="time" class="form-input" id="f-time" />')}
                ${formField(currentLanguage === 'ar' ? 'سبب الانصراف المبكر' : 'Reason for early leave', `<textarea class="form-textarea" id="f-reason" placeholder="${currentLanguage === 'ar' ? 'اكتب سبب الانصراف...' : 'Write the reason for early leave...'}"></textarea>`)}
                <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
            `;
        case 'leave-request':
            return `
                <div class="leave-request-form">
                    ${formField(currentLanguage === 'ar' ? 'نوع الاجازة' : 'Leave type', `
                        <select class="form-select" id="f-type" onchange="updateLeaveTypeHelp(this.value)">
                            ${getLeaveTypeOptionsHtml()}
                        </select>
                    `)}
                    <div class="form-row form-row-spacious">
                        ${formField(currentLanguage === 'ar' ? 'من تاريخ' : 'From date', '<input type="date" class="form-input" id="f-from" />')}
                        ${formField(currentLanguage === 'ar' ? 'إلى تاريخ' : 'To date', '<input type="date" class="form-input" id="f-to" />')}
                    </div>
                    <div class="form-row form-row-spacious">
                        ${formField(currentLanguage === 'ar' ? 'من وقت' : 'From time', '<input type="time" class="form-input" id="f-begti" />')}
                        ${formField(currentLanguage === 'ar' ? 'إلى وقت' : 'To time', '<input type="time" class="form-input" id="f-endti" />')}
                    </div>
                    <div class="form-helper" id="leave-type-helper">
                        ${currentLanguage === 'ar'
                            ? 'للإجازات من نوع حدث، أدخل الوقت من وإلى.'
                            : 'For event leave, enter from/to time.'}
                    </div>
                    ${formField(currentLanguage === 'ar' ? 'ملاحظات' : 'Notes', `<textarea class="form-textarea form-textarea-large" id="f-notes" placeholder="${currentLanguage === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}"></textarea>`)}
                    <button class="submit-btn" onclick="submitAction('${actionKey}')">${submitText}</button>
                </div>
            `;
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
    document.getElementById('section-title').textContent = dictionary.sectionTitle;

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

        const employee = await response.json();
        currentEmployee = employee;
        displayEmployee(employee);
    } catch (apiError) {
        // Fallback to mock data when SAP is unavailable
        const key = String(empId).replace(/^0+/, '') || empId;
        const paddedKey = String(empId).padStart(8, '0');
        const mock = mockEmployees[key] || mockEmployees[paddedKey] || mockEmployees[empId];
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
        const payload = await response.json().catch(() => ({}));

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
                        <th>${t('leaveHdrTotal')}</th>
                        <th>${t('leaveHdrUsed')}</th>
                        <th>${t('leaveHdrRemaining')}</th>
                        <th>${t('leaveHdrStatus')}</th>
                        <th>${t('leaveHdrFrom')}</th>
                        <th>${t('leaveHdrTo')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${safeRecords.map((record) => `
                        <tr>
                            <td>${escapeHtml(record.leaveType || '-')}</td>
                            <td>${escapeHtml(record.totalDays ?? 0)}</td>
                            <td>${escapeHtml(record.usedDays ?? 0)}</td>
                            <td>${escapeHtml(record.remainingDays ?? 0)}</td>
                            <td>${escapeHtml(record.status || '-')}</td>
                            <td>${escapeHtml(record.fromDate || '-')}</td>
                            <td>${escapeHtml(record.toDate || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        : `${overviewTitleHtml}<div class="leave-history-message">${t('leaveNoData')}</div>`;

    const extraSections = bundle
        ? [
            renderGenericLeaveSection(t('leaveAbsenceQuotaTitle'), bundle.absenceQuota),
            renderGenericLeaveSection(t('leaveHolidaysTitle'), bundle.holidays),
            renderGenericLeaveSection(t('leaveTypesTitle'), bundle.leaveTypes)
        ].join('')
        : '';

    content.innerHTML = `
        <div class="leave-summary-row">
            <div class="leave-summary-badge">${t('leaveRequestedTotal')}: <strong>${escapeHtml(requestedTotal.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveTotalVacations')}: <strong>${escapeHtml(vacationSummary.total.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveUsedVacations')}: <strong>${escapeHtml(vacationSummary.used.toFixed(2))}</strong></div>
            <div class="leave-summary-badge">${t('leaveRemainingVacations')}: <strong>${escapeHtml(vacationSummary.remaining.toFixed(2))}</strong></div>
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
    const safePhoto = employee.photo || 'https://ui-avatars.com/api/?name=Employee&background=1d4ed8&color=fff&size=512';

    // Set profile data
    document.getElementById('emp-photo').src = safePhoto;
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

        if (actionKey === 'leave-request') {
            updateLeaveTypeHelp(document.getElementById('f-type')?.value || '');
        }
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}

// ============================================
// SUBMIT ACTION
// ============================================
async function submitAction(actionName) {
    if (actionName === 'leave-request') {
        await submitLeaveRequest();
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

async function submitLeaveRequest() {
    const subty = document.getElementById('f-type')?.value?.trim();
    const fromDate = document.getElementById('f-from')?.value?.trim();
    const toDate = document.getElementById('f-to')?.value?.trim();
    const begti = document.getElementById('f-begti')?.value?.trim() || '';
    const endti = document.getElementById('f-endti')?.value?.trim() || '';
    const note = document.getElementById('f-notes')?.value?.trim() || '';
    const employeeId = String(currentEmployee?.hrCode || '').trim();

    if (!employeeId || !subty || !fromDate || !toDate) {
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
                begti,
                endti,
                note
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
                <p>${t('successMessageStart')}${actionLabel('leave-request')}${t('successMessageEnd')}</p>
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

applyTranslations();
