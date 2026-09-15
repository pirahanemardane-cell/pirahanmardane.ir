export async function sendSms() {
  return { ok: false, skipped: true, error: "SMS disabled" };
}
export default { sendSms };
