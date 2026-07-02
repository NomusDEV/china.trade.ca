import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, phone, country_code, country_iso, code } = body;

    if (action === 'send') {
      // Generate 6-digit verification code
      const verifyCode = String(Math.floor(100000 + Math.random() * 900000));

      // Store code on user record
      await base44.asServiceRole.entities.User.update(user.id, {
        phone_verification_code: verifyCode,
      });

      // NOTE: No SMS provider configured. In production, integrate Twilio/etc here.
      // For now, return the code so the frontend can display it (demo mode).
      return Response.json({
        success: true,
        demo_code: verifyCode,
        message: 'Код отправлен на ваш номер',
      });
    }

    if (action === 'verify') {
      // Get stored code
      const freshUser = await base44.asServiceRole.entities.User.get(user.id);
      const storedCode = freshUser.phone_verification_code;

      if (!storedCode || storedCode !== String(code)) {
        return Response.json({ success: false, error: 'Неверный код' }, { status: 400 });
      }

      // Mark phone as verified and save phone data
      await base44.asServiceRole.entities.User.update(user.id, {
        phone,
        country_code,
        country_iso,
        phone_verified: true,
        phone_verification_code: '',
      });

      return Response.json({ success: true, message: 'Номер подтверждён' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});