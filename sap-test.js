process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');

const BASE   = 'http://tbtd-sandbox.tbtd-egypt.com:8061/sap/opu/odata/sap/ZDATA_KIOSK_SRV';
const ENTITY = "/EmployeeProfileSet('4688')/";
const PARAMS = { '$format': 'json' };
const CLI200 = { 'sap-client': '200' };

async function test(label, user, pass, extraHeaders) {
    try {
        const r = await axios.get(BASE + ENTITY, {
            params: PARAMS, timeout: 10000,
            auth: { username: user, password: pass },
            headers: extraHeaders || {}
        });
        console.log(label, '→ HTTP', r.status, '✅');
        console.log('   DATA:', JSON.stringify(r.data).slice(0, 400));
    } catch (e) {
        const status = e.response ? e.response.status : null;
        console.log(label, '→', status ? 'HTTP ' + status : (e.code || e.message));
    }
}

(async () => {
    await test('mo.Abdotaled / 123456789              ', 'mo.Abdotaled',  '123456789', {});
    await test('mo.Abdotaled / 123456789 + client 200 ', 'mo.Abdotaled',  '123456789', CLI200);
    await test('MO.ABDOTALED / 123456789 + client 200 ', 'MO.ABDOTALED',  '123456789', CLI200);
    await test('mo.abdotaled / 123456789 + client 200 ', 'mo.abdotaled',  '123456789', CLI200);
    await test('mo.Abdotaled / 12345678               ', 'mo.Abdotaled',  '12345678',  CLI200);
    await test('mo.Abdotaled / 1234567890             ', 'mo.Abdotaled',  '1234567890',CLI200);
})();
